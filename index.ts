import { resolve, relative } from "path"
import { readdir } from "fs/promises"

import React, { createElement, type ReactElement } from "react"
import { renderToPipeableStream, decodeReply } from "react-server-dom-esm/server"

// SSR
import { createFromNodeStream } from "react-server-dom-esm/client.node"
import { renderToPipeableStream as DOM_renderToPipeableStream } from "react-dom/server.node"

import express from "express"
import type { Response } from "express-serve-static-core"
import bodyParser from "body-parser"
import morgan from "morgan"

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

          // If there are no directives, we let it be bundled
          const uses = content.match(/(?:^|\n|;)("use (client|server)";?)/)
          if (!uses) return { contents: content }

          const { exports } = new Bun.Transpiler({ loader: "tsx" }).scan(content)
          if (exports.length === 0) return { contents: content }

          const refs = exports.map(e => {
            const path = `/${relative(".", args.path).replace("src", "build").replace(".tsx", ".js").replace(".ts", ".js")}`

            // If it is a server component, we add things in a error-throwing function to avoid shipping the code to the client
            return uses[2] === "server"
              ? `\n\nexport const ${e}=()=>{throw new Error("This should only run on the server")};${e}.$$typeof=Symbol.for("react.server.reference");${e}.$$id="${path}#${e}";${e}.$$bound=null;`
              : `${e === "default" ? "export default {" : `export const ${e} = {`}$$typeof:Symbol.for("react.client.reference"),$$id:"${path}#${e}",$$async:true};`
          })

          return { contents: refs.join("\n\n"), loader: "tsx" }
        })
      }
    }
  ]
})

console.log("Successful build?", server.success, server)
console.log("\n----------------- Building the components\n")

const components = (await readdir(resolve("src/components"), { recursive: true })).map(file =>
  resolve("src/components", file)
)

const client = await Bun.build({
  target: "bun",
  splitting: true,
  entrypoints: [resolve("src/_client.tsx"), resolve("src/_layout.tsx"), ...components],
  outdir: resolve("build")
  // TODO: Add the $$ props to server and client components to be able to validate when needed
})

console.log("Successful build?", client.success, client)
console.log("\n----------------- Listening on http://localhost:3000\n")

const app = express()
app.use(morgan("tiny") as any)
app.use("/build", express.static("build"))

import http from "http"

app.get("/*", async (req, res) => {
  const { search } = new URL(req.url, `http://${req.headers.host}`)
  if (search.includes("__RSC")) {
    const props = req.query
    delete props["__RSC"]

    let rsc
    try {
      rsc = React.createElement((await import(resolve("build/app", `.${req.path}/page.js`))).default)
    } catch (e) {
      console.error(e)
      rsc = "404 Not found"
    }
    renderToPipeableStream(rsc, moduleBaseURL).pipe(res)
  } else {
    http.get("http://localhost:3000/?__RSC=true", async rsc => {
      /* const vDOM = createFromNodeStream(rsc, resolve("build/") + "/", moduleBaseURL) */

      let root: any
      let Root = () => {
        if (root) return React.use(root)
        return React.use((root = createFromNodeStream(rsc, resolve("build/") + "/", moduleBaseURL)))
      }

      res.set("Content-type", "text/html")
      const Layout = (await import(resolve("build/_layout"))).default
      DOM_renderToPipeableStream(createElement(Layout, { children: createElement(Root) })).pipe(res)
    })

    /* res.send(
      `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="module" src="/build/_client.js"></script></body></html>`
    ) */
  }
})

app.post("/*", bodyParser.text(), async (req, res) => {
  const { search } = new URL(req.url, `http://${req.headers.host}`)
  if (search.includes("__RSA")) {
    const actionReference = String(req.headers["rsa-reference"])
    const actionOrigin = String(req.headers["rsa-origin"])

    const [filepath, name] = actionReference.split("#")
    const action = (await import(`.${resolve(filepath)}`))[name]

    // TODO: Validate the action
    /* if (action.$$typeof !== Symbol.for("react.server.reference"))
    throw new Error("Invalid action"); */

    const args = await decodeReply(req.body, moduleBaseURL)
    const result = action.apply(null, args)

    try {
      await result
    } catch (e) {
      console.error(e)
      res.send(e)
    }

    const App = (await import(resolve("build/app", `.${actionOrigin}/page.js`))).default
    renderApp(res, result, createElement(App))
  }
})

app.listen(3000)

// ----------------------------------------------------------------

async function renderApp(res: Response, returnValue: unknown, root: ReactElement) {
  // For client-invoked server actions we refresh the tree and return a return value.
  const payload = returnValue ? { returnValue, root } : root
  renderToPipeableStream(payload, moduleBaseURL).pipe(res)
}
