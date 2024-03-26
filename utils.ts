import { parse, relative } from "path"

import type { Request, Response } from "express"

// Create the reference for the "client component" / "server action"
export const createReference = (e: string, path: string, directive: string) => {
  const id = `/${relative(".", path).replace("src", "build").replace(/\..+$/, ".js")}#${e}` // React uses this to identify the component
  const mod = `${e === "default" ? parse(path).base.replace(/\..+$/, "") : ""}_${e}` // We create a unique name for the component export

  return directive === "server"
    ? // In case the of a server components, we add properties to a mock up function to avoid shipping the code to the client
      `const ${mod}=()=>{throw new Error("This function is expected to only run on the server")};${mod}.$$typeof=Symbol.for("react.server.reference");${mod}.$$id="${id}";${mod}.$$bound=null;${e === "default" ? `export{${mod} as default}` : `export {${mod} as ${e}}`};`
    : `${e === "default" ? "export default {" : `export const ${e} = {`}$$typeof:Symbol.for("react.client.reference"),$$id:"${id}",$$async:true};`
}

// Pad a string to a certain length
export const pad = (str: string, n = 11) =>
  str.slice(0, n) + (n - str.length > 0 ? " ".repeat(n - str.length) : "")

// Log express traffic to the console
export const logger = (req: Request, _: unknown, next: Function) => (
  console.log(
    `\x1b[2m${new Date().toISOString().replace(/.*T|Z/g, "")}\x1b[0m`,
    `\x1b[33m${req.method}\x1b[0m`,
    `\x1b[2m(${pad(req.headers["user-agent"] ?? "Unknown")})\x1b[0m`,
    `${req.headers["host"]?.split(":")[1]}`,
    `\x1b[32m"${req.path}"\x1b[0m`
  ),
  next()
)

// Add CORS headers to express response
export const cors = (_: unknown, res: Response, next: Function) => (
  res.header("Access-Control-Allow-Origin", "*").header("Access-Control-Allow-Headers", "*"), next()
)
