import http from "http"
import { resolve } from "path"
import { createElement, use } from "react"
import { renderToPipeableStream } from "react-dom/server.node"
import { createFromNodeStream } from "@physis/react-server-dom-esm/client.node"
import express from "express"

express()
  .use("/build", express.static("build"))
  .use("/node_modules", express.static("node_modules"))
  .get(/\.(?!js).+$/, express.static("build"))
  .get("/*", async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    return http.get(((url.port = "3001"), url), async rsc => {
      let Root = () => use(createFromNodeStream(rsc, resolve("build/") + "/", "/build/"))
      renderToPipeableStream(
        createElement((await import(resolve("build/_layout"))).default, { children: createElement(Root) }),
        {
          bootstrapModules: ["/build/_client.js"],
          importMap: {
            imports: {
              "react/jsx-dev-runtime": "https://esm.sh/react@next/jsx-dev-runtime.js",
              react: "https://esm.sh/react@next",
              "react-dom": "https://esm.sh/react-dom@next",
              "react-dom/": "https://esm.sh/react-dom@next/",
              "@physis/react-server-dom-esm/client": "/node_modules/@physis/react-server-dom-esm/esm/react-server-dom-esm-client.browser.development.js"
            }
          }
        }
      ).pipe(res)
    })
  })
  .listen(3000)