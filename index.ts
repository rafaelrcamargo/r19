import { resolve, relative } from "path"
import { readdir } from "fs/promises"
import http from "http"

import express from "express"
import bodyParser from "body-parser"
import { logger } from "./utils"

// RSC
import { renderToPipeableStream, decodeReply } from "react-server-dom-esm/server"
import { createElement, use } from "react"
// SSR
import { renderToPipeableStream as DOM_renderToPipeableStream } from "react-dom/server.node"
import { createFromNodeStream } from "react-server-dom-esm/client.node"

const moduleBaseURL = "/build/"

console.log("\n----------------- Building the pages\n")
await Bun.$`rm -rf ./build/`

const pages = (await readdir(resolve("src/app"), { recursive: true }))
  .filter(file => file.endsWith("page.tsx"))
  .map(page => resolve("src/app", page))

const server = await Bun.build({
  target: "bun",
  entrypoints: pages,
  external: ["react", "react-dom", "scheduler"],
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
console.log("\n----------------- Building the components\n")

const components = (await readdir(resolve("src/components"), { recursive: true })).map(file =>
  resolve("src/components", file)
)

const client = await Bun.build({
  target: "bun",
  splitting: true,
  entrypoints: [resolve("src/_client.tsx"), resolve("src/_layout.tsx"), ...components],
  outdir: resolve("build")
})

console.log("Successful build?", client.success)
console.log("\n----------------- Listening on http://localhost:3000\n")

express()
  .use(logger)
  .use("/build", express.static("build"))
  .get("/*", async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (!url.search.includes("__RSC")) {
      url.searchParams.set("__RSC", "true") // Let's re-use the url and forward to the API
      return http.get(url.toString(), async rsc => {
        let Root = () => use(createFromNodeStream(rsc, resolve("build/") + "/", moduleBaseURL)) // Create a root component from the RSC result
        const Layout = (await import(resolve("build/_layout"))).default // Load a HTML shell layout
        DOM_renderToPipeableStream(createElement(Layout, { children: createElement(Root) })).pipe(res) // Render the the element as html and send it to the client
      })
    }

    try {
      const { __RSC, ...props } = req.query // We will use the query as props for the page

      renderToPipeableStream(
        createElement((await import(resolve("build/app", `.${req.path}/page.js`))).default, props),
        moduleBaseURL
      ).pipe(res)
    } catch (e) {
      console.error(e), res.send(e)
    }
  })
  .post("/*", bodyParser.text(), async (req, res) => {
    const { search } = new URL(req.url, `http://${req.headers.host}`)
    if (search.includes("__RSA")) {
      const actionReference = String(req.headers["rsa-reference"])
      const actionOrigin = String(req.headers["rsa-origin"])

      // Resolve the action
      const [filepath, name] = actionReference.split("#")
      const action = (await import(`.${resolve(filepath)}`))[name]

      const args = await decodeReply(req.body, moduleBaseURL) // Decode the arguments
      const returnValue = await action.apply(null, args) // Call the action

      const root = createElement((await import(resolve("build/app", `.${actionOrigin}/page.js`))).default)
      renderToPipeableStream({ returnValue, root }, moduleBaseURL).pipe(res) // Render the app with the RSC, action result and the new root
    }
  })
  .listen(3000)
