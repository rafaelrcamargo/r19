import { resolve, relative } from "path";
import { readdir } from "fs/promises";

import { renderToReadableStream } from "react-server-dom-webpack/server.edge";
// import { renderToReadableStream } from "react-dom/server";

console.log("\n----------------- Building the pages\n");
await Bun.$`rm -rf ./build/`;

const clientManifest: Record<string, Record<string, unknown>> = {};

const pages = (await readdir(resolve("src/app"), { recursive: true }))
  .filter((file) => file.endsWith("page.tsx"))
  .map((page) => resolve("src/app", page));

const server = await Bun.build({
  target: "bun",
  entrypoints: pages,
  external: ["react", "react-dom", "scheduler"],
  outdir: resolve("build", "app"),
  plugins: [
    {
      name: "rsc-server",
      setup(build) {
        build.onLoad({ filter: /\.(ts|tsx)$/ }, async (args) => {
          console.log({ args });

          const content = await Bun.file(args.path).text();

          // If there are no directives, we let it be bundled
          const directives = content.match(
            /(?:^|\n|;)("use (client|server)";)/
          );
          if (!directives) return { contents: content };

          const { exports } = new Bun.Transpiler({ loader: "tsx" }).scan(
            content
          );

          if (exports.length === 0) return { contents: content };

          const refs = exports.map((e) => {
            const path = `/${relative(".", args.path)
              .replace("src", "build")
              .replace(".tsx", ".js")
              .replace(".ts", ".js")}`;

            clientManifest[path] = {};
            clientManifest[path][e] = {
              id: resolve(path),
              chunks: [resolve(path)],
              async: true,
              name: e
            };

            return directives[2] === "server"
              ? // If it is a server component, we add things in the export
                `\n\n${e}.$$typeof = Symbol.for("react.server.reference"); ${e}.$$filepath = "${path}"; ${e}.$$name = "${e}"; ${e}.$$bound = "";`
              : // If it is a client component, we inline only the reference, then it will be fetched  later
                `${
                  e === "default"
                    ? "export default { "
                    : `export const ${e} = { `
                }$$typeof: Symbol.for("react.client.reference"), $$id: "${path}#${e}", $$async: false, filepath: "${path}", name: "${e}" }`;
          });

          return {
            contents:
              directives[2] === "server"
                ? // I'm not sure this is right, feel like the code for server functions shouldn't be in the bundle
                  // But without this I get a "object is not a function" error on the client
                  content + refs.join("\n\n")
                : refs.join("\n\n"),
            loader: "tsx"
          };
        });
      }
    }
  ]
});

console.log("Successful build?", server.success, server);
console.log("\n----------------- Building the components\n");

const components = (
  await readdir(resolve("src/components"), { recursive: true })
).map((file) => resolve("src/components", file));

const client = await Bun.build({
  target: "bun",
  splitting: true,
  entrypoints: [resolve("src/_client.tsx"), ...components],
  outdir: resolve("build")
});

console.log("Successful build?", client.success);
Bun.write("build/manifest.json", JSON.stringify(clientManifest));
console.log("\n----------------- Listening on http://localhost:3000\n");

Bun.serve({
  port: 3000,
  async fetch(req) {
    console.log(new Date().toLocaleTimeString(), "-", req.method, req.url);
    const url = new URL(req.url); // Parse the incoming URL

    if (url.searchParams.has("__RSC")) {
      const props = Object.fromEntries(url.searchParams.entries());
      delete props["__RSC"]; // Remove __RSC from the props

      let rsc; // Create a slot for the resource

      try {
        rsc = await (
          await import(resolve("build/app", `.${url.pathname}/page.js`))
        ).default(props);
      } catch (e) {
        console.error(e);
        rsc = "404 Not found";
      }

      return new Response(renderToReadableStream(rsc, clientManifest) as any);
    }

    if (new Bun.Glob("/build/**").match(url.pathname))
      return new Response(Bun.file(`.${url.pathname}`));

    if (new Bun.Glob("/*").match(url.pathname))
      return new Response(
        `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="module" src="/build/_client.js"></script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );

    return new Response("Not found", { status: 404 });
  }
});
