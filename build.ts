import { readdir } from "fs/promises"
import { parse, relative, resolve } from "path"

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
            contents: exports
              .map(e => {
                console.log(e, args.path, directives[2], createReference(e, args.path, directives[2]))
                return createReference(e, args.path, directives[2])
              })
              .join("\n\n")
          }
        })
      }
    }
  ]
})

const createReference = (e: string, path: string, directive: string) => {
  console.log(e, path, directive)
  const id = `/${relative(".", path).replace("src", "build").replace(/\..+$/, ".js")}#${e}` // React uses this to identify the component
  const mod = `${e === "default" ? parse(path).base.replace(/\..+$/, "") : ""}_${e}` // We create a unique name for the component export

  return directive === "server"
    ? // In case the of a server components, we add properties to a mock up function to avoid shipping the code to the client
      `const ${mod}=()=>{throw new Error("This function is expected to only run on the server")};${mod}.$$typeof=Symbol.for("react.server.reference");${mod}.$$id="${id}";${mod}.$$bound=null;${e === "default" ? `export{${mod} as default}` : `export {${mod} as ${e}}`};`
    : `${e === "default" ? "export default {" : `export const ${e} = {`}$$typeof:Symbol.for("react.client.reference"),$$id:"${id}",$$async:true};`
}

console.log("Successful build?", server)
console.log("----------------- Building the components")

const components = (await readdir(resolve("src"), { recursive: true }))
  .filter((file: string) => file.match(/\..+$/g) && !(file.endsWith(".d.ts") || file.endsWith("page.tsx")))
  .map((file: string) => resolve("src", file))

const client = await Bun.build({
  target: "bun",
  splitting: true,
  external: ["react", "react-dom", "react-server-dom-esm"],
  entrypoints: components,
  outdir: resolve("build")
})

console.log("Successful build?", client.success)
