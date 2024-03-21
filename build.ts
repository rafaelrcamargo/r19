import { readdir } from "fs/promises"
import { relative, resolve } from "path"

console.log("----------------- Building the pages")
await Bun.$`rm -rf ./build/`

const pages = (await readdir(resolve("src/app"), { recursive: true }))
  .filter(file => file.endsWith("page.tsx"))
  .map(page => resolve("src/app", page))

const server = await Bun.build({
  target: "bun",
  entrypoints: pages,
  external: ["react", "react-dom"],
  publicPath: "https://esm.sh/", // default is undefined
  outdir: resolve("build", "app"),
  plugins: [
    {
      name: "rsc-server",
      setup(build) {
        build.onLoad({ filter: /\.(ts|tsx)$/ }, async args => {
          const content = await Bun.file(args.path).text()

          const uses = content.match(/(?:^|\n|;)("use (client|server)";?)/)
          if (!uses) return { contents: content } // If there are no directives, we let it be bundled

          const { exports } = new Bun.Transpiler({ loader: "tsx" }).scan(content)
          if (exports.length === 0) return { contents: content } // If there are no exports, we also let it be bundled

          const refs = exports.map(e => {
            const path = `/${relative(".", args.path).replace("src", "build").replace(".tsx", ".js").replace(".ts", ".js")}`

            return uses[2] === "server"
              ? // If it is a server component, we add fields to a error-throwing function to avoid shipping the code to the client
                `\n\nexport const ${e}=()=>{throw new Error("This should only run on the server")};${e}.$$typeof=Symbol.for("react.server.reference");${e}.$$id="${path}#${e}";${e}.$$bound=null;`
              : `${e === "default" ? "export default {" : `export const ${e} = {`}$$typeof:Symbol.for("react.client.reference"),$$id:"${path}#${e}",$$async:true};`
          })

          return { contents: refs.join("\n\n") }
        })
      }
    }
  ]
})

console.log("Successful build?", server.success)
console.log("----------------- Building the components")

const components = (await readdir(resolve("src/components"), { recursive: true })).map(file =>
  resolve("src/components", file)
)

const client = await Bun.build({
  target: "bun",
  splitting: true,
  external: ["react", "react-dom", "react-server-dom-esm"],
  entrypoints: [resolve("src/_client.tsx"), resolve("src/_layout.tsx"), ...components],
  outdir: resolve("build")
})

console.log("Successful build?", client.success)
