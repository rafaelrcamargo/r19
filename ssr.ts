import http from "http"
import { resolve } from "path"

import { createElement, use } from "react"
import { renderToPipeableStream } from "react-dom/server.node"
import { createFromNodeStream } from "react-server-dom-esm/client.node"
import express from "express"

import { logger } from "./utils"

const moduleBaseURL = "/build/"

console.log("----------------- Listening on http://localhost:3000")

express()
  .use(logger)
  .use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    next()
  })
  .use("/build", express.static("build"))
  .use("/node_modules", express.static("node_modules"))
  .get("/*", async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (url.pathname.includes("favicon.ico")) return res.end() // Ignore favicon requests

    url.port = "3001" // Forward to the SSR API
    url.searchParams.set("__RSC", "true") // Let's re-use the url and forward to the API

    return http.get(url.toString(), async rsc => {
      let Root = () => use(createFromNodeStream(rsc, resolve("build/") + "/", moduleBaseURL)) // Create a root component from the RSC result
      const Layout = (await import(resolve("build/_layout"))).default // Load a HTML shell layout

      res.set("Content-type", "text/html")
      renderToPipeableStream(createElement(Layout, { children: createElement(Root) }), {
        importMap: {
          imports: {
            "react/jsx-dev-runtime": "https://esm.sh/react@experimental?pin=v124&dev/jsx-dev-runtime.js",
            react: "https://esm.sh/react@experimental?pin=v124&dev",
            "react-dom": "https://esm.sh/react-dom@experimental?pin=v124&dev",
            "react-dom/": "https://esm.sh/react-dom@experimental&pin=v124&dev/",
            "react-server-dom-esm/client":
              "/node_modules/react-server-dom-esm/esm/react-server-dom-esm-client.browser.development.js"
          }
        },
        bootstrapModules: ["/build/_client.js"]
      }).pipe(res) // Render the the element as html and send it to the client
    })
  })
  .listen(3000)
