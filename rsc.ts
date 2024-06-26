import { resolve } from "path"
import { decodeReply, renderToPipeableStream } from "@physis/react-server-dom-esm/server.node"
import bodyParser from "body-parser"
import express from "express"

express()
  .use((_, res, next) => (res.header("Access-Control-Allow-Origin", "*").header("Access-Control-Allow-Headers", "*"), next()))
  .get("/*", async (req, res) =>
    renderToPipeableStream((await import(resolve("build/app", `.${req.path}/page.js`))).default(req.query), "/build/").pipe(res)
  )
  .post("/*", bodyParser.text(), async (req, res) => {
    const [filepath, name] = String(req.headers["rsa-reference"]).split("#")
    const returnValue = await (await import(`.${resolve(filepath)}`))[name].apply(null, await decodeReply(req.body, "/build/"))
    const root = (await import(resolve("build/app", `.${String(req.headers["rsa-origin"])}/page.js`))).default(req.query)
    renderToPipeableStream({ returnValue, root }, "/build/").pipe(res)
  })
  .listen(3001)