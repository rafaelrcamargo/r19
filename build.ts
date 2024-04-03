import { readdir } from "fs/promises"
import { resolve } from "path"
import { createReference } from "./utils"

console.log("\n----------------- Cleaning build artifacts")
console.log("Successful clean?", (await Bun.$`rm -rf ./build/`).exitCode === 0)

const entries = (await readdir(resolve("src"), { recursive: true })).reduce(
  (acc, file) => {
    const ext = file.match(/\..+$/)
    if (!ext) return acc
    const path = resolve("src", file)
    if (file.endsWith("page.tsx")) acc.pages.push(path)
    else if (ext[0].match(/\.tsx?$/)) acc.components.push(path)
    else acc.assets.push(path)
    return acc
  },
  { pages: [], components: [], assets: [] } as Record<string, string[]>
)

console.log("----------------- Building the pages")
const server = await Bun.build({
  target: "bun",
  entrypoints: entries.pages,
  external: ["react", "react-dom"],
  outdir: resolve("build", "app"),
  plugins: [
    {
      name: "rsc-server",
      setup(build) {
        build.onLoad({ filter: /\.tsx?$/ }, async args => {
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
const client = await Bun.build({
  target: "bun",
  external: ["react", "react-dom", "react-server-dom-esm"],
  entrypoints: entries.components,
  outdir: resolve("build")
})
console.log("Successful build?", client.success)

entries.assets.forEach(asset => Bun.write(asset.replace("src", "build"), Bun.file(asset)))

console.log("----------------- Done! 🎉\n")
