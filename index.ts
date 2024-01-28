import { resolve, parse } from "path";
import { readdir } from "fs/promises";

import { renderToReadableStream } from "react-server-dom-webpack/server.edge";

const clientManifest: Record<string, unknown> = {};

const pages = (await readdir(resolve("src/app"), { recursive: true }))
  .filter((file) => file.endsWith("page.tsx"))
  .map((page) => resolve("src/app", page));

await Bun.build({
  target: "bun",
  external: ["*"],
  entrypoints: pages,
  outdir: resolve("build", "app")
});

const components = (
  await readdir(resolve("src/components"), { recursive: true })
).map((file) => resolve("src/components", file));

const { outputs } = await Bun.build({
  target: "bun",
  splitting: true,
  entrypoints: [resolve("src/_client.tsx"), ...components]
});

await Promise.all(
  outputs.map(async (out) => {
    const absolute = resolve("build", out.path);
    const content = await out.text();

    const directives = content.match(/(?:^|\n|;)("use (client|server)";)/);

    console.log(directives);

    if (out.kind !== "entry-point" || !directives)
      return void Bun.write(absolute, content);

    const { exports } = new Bun.Transpiler().scan(content);
    if (exports.length === 0) return void Bun.write(absolute, content);

    const refs = exports.map((e) => {
      const name = e === "default" ? parse(out.path).name + "_" + e : e;

      clientManifest[`${absolute}#${name}`] = {
        id: resolve("/build", out.path),
        name: e,
        async: true,
        chunks: []
      };

      console.log(directives[2]);

      return `${name}.$$id="${absolute}#${name}";\n${name}.$$typeof=Symbol.for("react.${directives[2]}.reference");`;
    });

    return void Bun.write(absolute, `${content}\n${refs.join("\n\n")}`);
  })
);

console.log("Listening on http://localhost:3000");

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);

    if (url.searchParams.has("__RSC")) {
      const props = Object.fromEntries(url.searchParams.entries());
      delete props["__RSC"];

      let rsc; // Create a slot for the resource

      try {
        rsc = await (
          await import(resolve("build/app", `.${url.pathname}/page.js`))
        ).default(props);
      } catch (e) {
        console.error(e);
        rsc = "404 Not found";
      }

      return new Response(renderToReadableStream(rsc, clientManifest));
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
