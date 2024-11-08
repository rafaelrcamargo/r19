import "colors"
import { readdir } from "fs/promises"
import { resolve } from "path"
import { createReference, log } from "./utils"

log("Cleaning build artifacts")
log("Successful clean?".dim, (await Bun.$`rm -rf ./build/`).exitCode === 0)

// Here we'll store some data about the build process
const meta = { pages: { static: new Array<string>(), dynamic: new Array<string>() } }

const entries = (await readdir(resolve("src"), { recursive: true })).reduce(
  (acc, file) => {
    const ext = file.match(/\..+$/)
    if (!ext) return acc
    const path = resolve("src", file)
    if (file.endsWith("page.tsx")) acc["pages"].push(path)
    else if (ext[0].match(/\.tsx?$/)) acc["components"].push(path)
    else acc["assets"].push(path)
    return acc
  },
  { pages: [], components: [], assets: [] } as Record<string, string[]>
)

log("Building the pages")
const server = await Bun.build({
  target: "bun",
  entrypoints: entries["pages"],
  external: ["react", "react-dom"],
  outdir: resolve("build", "app"),
  plugins: [
    {
      name: "rsc-register",
      setup(build) {
        build.onLoad({ filter: /\.tsx?$/ }, async args => {
          const content = await Bun.file(args.path).text()

          const { exports } = new Bun.Transpiler({ loader: "tsx" }).scan(content)
          if (exports.length === 0) return { contents: content } // If there are no exports, we let it be bundled

          // We want to categorize the only the pages
          if (args.path.endsWith("page.tsx"))
            if (exports.some(e => e === "dynamic")) meta.pages.dynamic.push(args.path.split("/").at(-2)!)
            else meta.pages.static.push(args.path.split("/").at(-2)!) // We fallback to static

          const directives = content.match(/(?:^|\n|;)"use (client|server)";?/)
          if (!directives) return { contents: content } // If there are no directives, we also let it be bundled

          return {
            contents: exports.map(e => createReference(e, args.path, directives[1])).join("\n")
          }
        })
      }
    }
  ]
})
log("Successful build?".dim, server.success)
if (!server.success) {
  log(server)
  process.exit(1)
}

log("Building the components")
const client = await Bun.build({
  target: "bun",
  external: ["react", "react-dom", "react-server-dom-esm"],
  entrypoints: entries["components"],
  root: resolve("src"),
  outdir: resolve("build")
})
log("Successful build?".dim, client.success)
if (!client.success) {
  log(client)
  process.exit(1)
}

entries["assets"].forEach(asset => Bun.write(asset.replace("src", "build"), Bun.file(asset)))
log("Done! 🎉".bold)

// Write the meta file
Bun.write(resolve("build", "meta.json"), JSON.stringify(meta))
