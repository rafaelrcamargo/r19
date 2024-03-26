import { readdir } from "fs/promises"
import { resolve } from "path"

import { createReference } from "./utils"

console.log("----------------- Building the pages")
await Bun.$`rm -rf ./build/`

const pages = (await readdir(resolve("src/app"), { recursive: true }))
  .filter(file => file.endsWith("page.tsx"))
  .map(page => resolve("src/app", page))

const server = await Bun.build({
  target: "bun",
  entrypoints: pages,
  external: ["react", "react-dom"],
  outdir: resolve("build", "app"),
  plugins: [
    {
      name: "rsc-server",
      setup(build) {
        build.onLoad({ filter: /\.(ts|tsx)$/ }, async args => {
          const content = await Bun.file(args.path).text()

          const directives = content.match(/(?:^|\n|;)("use (client|server)";?)/)
          if (!directives) return { contents: content } // If there are no directives, we let it be bundled

          const { exports } = new Bun.Transpiler({ loader: "tsx" }).scan(content)
          if (exports.length === 0) return { contents: content } // If there are no exports, we also let it be bundled

          return {
            contents: exports.map(e => createReference(e, args.path, directives[2])).join("\n")
          }
        })
      }
    }
  ]
})

console.log("Successful build?", server.success)
console.log("----------------- Building the components")

const components = (await readdir(resolve("src"), { recursive: true }))
  .filter((file: string) => file.match(/\..+$/g) && !(file.endsWith(".d.ts") || file.endsWith("page.tsx")))
  .map((file: string) => resolve("src", file))

const client = await Bun.build({
  target: "bun",
  external: ["react", "react-dom", "react-server-dom-esm"],
  entrypoints: components,
  outdir: resolve("build")
})

console.log("Successful build?", client.success)
