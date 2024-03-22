import type { Request, Response } from "express"

export const pad = (str: string, n = 11) => str.slice(0, n) + (n - str.length > 0 ? " ".repeat(n - str.length) : "")

export const logger = (req: Request, _: unknown, next: Function) => (
  console.log(
    `\x1b[2m${new Date().toISOString().replace(/.*T|Z/g, "")}\x1b[0m`,
    `\x1b[33m${req.method}\x1b[0m`,
    `\x1b[2m(${pad(req.headers["user-agent"] ?? "May be Node")})\x1b[0m`,
    `\x1b[32m"${req.path}"\x1b[0m`
  ),
  next()
)

export const cors = (_: unknown, res: Response, next: Function) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
}
