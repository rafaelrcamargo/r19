import { pages } from "./build/meta.json"

const exports = await Promise.all(
  pages.static.map(async page => [
    page,
    await (await fetch(`http://localhost:3000${page === "app" ? "/" : `/${page}`}`)).text()
  ])
)

exports.map(([page, content]) =>
  Bun.write(`./build/static/${page === "app" ? "index" : page}.html`, content!)
)
