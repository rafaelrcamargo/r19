import { readdir } from "fs/promises"
import { resolve } from "path"

const pages = (await readdir(resolve("src"), { recursive: true }))
  .filter(file => file.endsWith("page.tsx"))
  .map(page => page.split("/").at(-2))

const exports = await Promise.all(
  pages.map(async page => [
    page,
    await (await fetch(`http://localhost:3000${page === "app" ? "/" : `/${page}`}`)).text()
  ])
)

exports.map(([page, content]) =>
  Bun.write(`./build/export/${page === "app" ? "index" : page}.html`, content!)
)
