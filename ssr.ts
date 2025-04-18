import compression from "compression"
import express from "express"
import http from "http"
import { resolve } from "path"
import { createElement, use, type FunctionComponent } from "react"
import { renderToPipeableStream } from "react-dom/server.node"
import { createFromNodeStream } from "react-server-dom-esm/client.node"
import { log, logger } from "./utils"

const moduleBaseURL = "/build/"
const port = 3000

log(`Listening on http://localhost:${port}`)

express()
  .use(logger)
  .use(compression())
  .use("/build", express.static("build"))
  .use("/node_modules", express.static("node_modules"))
  .get(/\.(?!js).+$/, express.static("build"))
  .get(/.*/, async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    url.port = "3001" // Forward to the SSR API server
    if (url.searchParams.size === 0) {
      const page = (req.path === "/" ? "index" : req.path.slice(1)) + ".html"
      log("Defaulting to static page:", `"${page}"`.green)
      try {
        return void res.send(await Bun.file(resolve("build/static/", "./" + page)).text())
      } catch {
        log("File not found, falling back to SSR".dim)
      }
    }

    return void http.get(url, async rsc => {
      let Root: FunctionComponent<any> = () =>
        use(createFromNodeStream(rsc, resolve("build/") + "/", moduleBaseURL)) // Create a root component from the RSC result
      const Layout = (await import(resolve("build/_layout"))).default // Load a HTML shell layout

      renderToPipeableStream(createElement(Layout, { children: createElement(Root) }), {
        bootstrapModules: ["/build/_client.js"],
        importMap: {
          imports: {
            react: "https://esm.sh/react@beta",
            "react-dom": "https://esm.sh/react-dom@beta",
            "react-dom/": "https://esm.sh/react-dom@beta/",
            "react-server-dom-esm/client":
              "/node_modules/react-server-dom-esm/esm/react-server-dom-esm-client.browser.production.js"
          }
        }
      }).pipe(res) // Render the the element as html and send it to the client
    })
  })
  .listen(port)

new Worker(new URL("./export.ts", import.meta.url).href).addEventListener("close", _ =>
  log("Pages exported successfully! 🚀".bold)
)
