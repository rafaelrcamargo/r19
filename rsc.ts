import { resolve } from "path"
import { decodeReply, decodeReplyFromBusboy, renderToPipeableStream } from "react-server-dom-esm/server.node"
import bodyParser from "body-parser"
import busboy from "busboy"
import express from "express"
import { cors, log, logger } from "./utils"

const moduleBaseURL = "/build/"
const port = 3001

log(`Listening on http://localhost:${port}`)

express()
  .use(logger)
  .use(cors)
  .get("/*", async (req, res) => {
    let mod // A slot to hold the module

    try {
      mod = (await import(resolve("build/app", `.${req.path}/page.js`))).default(req.query) // We will use the query as props for the page
    } catch {
      mod = "Not Found"
    }

    renderToPipeableStream(mod, moduleBaseURL).pipe(res)
  })
  .post("/*", bodyParser.text(), async (req, res) => {
    const actionReference = String(req.headers["rsa-reference"])
    const actionOrigin = String(req.headers["rsa-origin"])

    // Resolve the action
    const [filepath, name] = actionReference.split("#")
    const action = (await import(`.${resolve(filepath)}`))[name]

    let args // Decode the arguments
    if (req.is("multipart/form-data")) {
      // Use busboy to streamingly parse the reply from form-data.
      const bb = busboy({ headers: req.headers })
      const reply = decodeReplyFromBusboy(bb, resolve("build/") + "/")
      req.pipe(bb)
      args = await reply
    } else {
      args = await decodeReply(req.body, moduleBaseURL)
    }

    const returnValue = await action.apply(null, args) // Call the action

    const root = (await import(resolve("build/app", `.${actionOrigin}/page.js`))).default(req.query) // We will use the query as props for the page
    renderToPipeableStream({ returnValue, root }, moduleBaseURL).pipe(res) // Render the app with the RSC, action result and the new root
  })
  .listen(port)
