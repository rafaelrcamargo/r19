import { resolve } from "path"
import { decodeReply, renderToPipeableStream } from "react-server-dom-esm/server.node"
import bodyParser from "body-parser"
import express from "express"
import { cors, logger } from "./utils"

const moduleBaseURL = "/build/"
const port = 3001

console.log(`----------------- Listening on http://localhost:${port}`)

express()
  .use(logger)
  .use(cors)
  .get("/*", async (req, res) => {
    const { __RSC, ...props } = req.query // We will use the query as props for the page
    let mod
    try {
      mod = (await import(resolve("build/app", `.${req.path}/page.js`))).default(props)
    } catch {
      console.error(`Not found: ${req.path}`)
      mod = "404 Not Found"
    }
    renderToPipeableStream(mod, moduleBaseURL).pipe(res)
  })
  .post("/*", bodyParser.text(), async (req, res) => {
    const { search } = new URL(req.url, `http://${req.headers.host}`)

    if (search.includes("__RSA")) {
      const actionReference = String(req.headers["rsa-reference"])
      const actionOrigin = String(req.headers["rsa-origin"])
      const { __RSA, ...props } = req.query // We will use the query as props for the page

      // Resolve the action
      const [filepath, name] = actionReference.split("#")
      const action = (await import(`.${resolve(filepath)}`))[name]

      const args = await decodeReply(req.body, moduleBaseURL) // Decode the arguments
      const returnValue = await action.apply(null, args) // Call the action

      const root = (await import(resolve("build/app", `.${actionOrigin}/page.js`))).default(props)
      renderToPipeableStream({ returnValue, root }, moduleBaseURL).pipe(res) // Render the app with the RSC, action result and the new root
    }
  })
  .listen(port)
