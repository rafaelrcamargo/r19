import p from "path";

import { createElement } from "react";
import * as ReactServerDom from "react-server-dom-webpack/server.browser";

const clientEntrypoints = new Set<string>();
const clientManifest: any = {};

await Bun.build({
  target: "bun",
  entrypoints: [p.resolve(import.meta.dirname, "src", "index.tsx")],
  outdir: p.resolve(import.meta.dirname, "build"),
  plugins: [
    {
      name: "resolve-client-imports",
      setup(build) {
        build.onResolve({ filter: /^.\// }, async ({ path, importer }) => {
          // TODO: Find a way to use the node_modules packages instead of bundling it
          if (importer.includes("node_modules")) return;

          const absolute = p.join(
            import.meta.dir,
            `${path.replace("./", "./src/")}.tsx`
          );

          if ((await Bun.file(absolute).text()).startsWith('"use client"')) {
            clientEntrypoints.add(absolute);
            return { path, external: true };
          }

          return { path: absolute };
        });
      }
    }
  ]
});

const csr = await Bun.build({
  target: "browser",
  splitting: true,
  entrypoints: [
    p.resolve(import.meta.dirname, "src", "_client.tsx"),
    ...clientEntrypoints
  ]
});

const transpiler = new Bun.Transpiler({ loader: "tsx" });

await Promise.all(
  csr.outputs.map(async (out) => {
    const path = p.resolve(import.meta.dirname, "build", out.path);
    const content = await out.text();

    const exports = transpiler.scan(content).exports;

    if (out.kind !== "entry-point" || exports.length === 0)
      return void Bun.write(path, content);

    const refs = exports.map((e) => {
      const name = e === "default" ? p.parse(out.path).name + "_" + e : e;

      clientManifest[`${path}#${name}`] = {
        id: `/build/${out.path.slice(2)}`,
        name: e,
        async: true,
        chunks: []
      };

      return `${name}.$$id="${path}#${name}";\n${name}.$$typeof=Symbol.for("react.client.reference");`;
    });

    const code = `${content}\n${refs.join("\n\n")}`;
    return void Bun.write(path, code);
  })
);

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/")
      return new Response(
        `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="module" src="/build/_client.js"></script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );

    if (url.pathname === "/rsc")
      return new Response(
        ReactServerDom.renderToReadableStream(
          createElement((await import("./build/index")).default),
          clientManifest
        )
      );

    if (new Bun.Glob("/build/*").match(url.pathname))
      return new Response(Bun.file(`./${url.pathname}`));

    return new Response("Not found", { status: 404 });
  }
});
