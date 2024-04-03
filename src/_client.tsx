import { createElement, startTransition, use, useState, type Dispatch } from "react"
import { hydrateRoot } from "react-dom/client"
import { createFromFetch, encodeReply } from "react-server-dom-esm/client"

// Global
const moduleBaseURL = "/build/"
let updateRoot: Dispatch<unknown>

const getUrl = () => {
  const url = new URL(window.location.href)
  const search = new URLSearchParams(window.location.search)
  search.set("__RSA", "true")
  url.port = "3001" // Forward to the SSR API
  url.search = search.toString()
  return url
}

const callServer = async (id: string, args: unknown[]): Promise<unknown> => {
  const fromFetch = await createFromFetch(
    fetch(getUrl(), {
      method: "POST",
      headers: { "rsa-origin": window.location.pathname, "rsa-reference": id },
      body: await encodeReply(args)
    }),
    { callServer, moduleBaseURL }
  )

  startTransition(() => updateRoot(fromFetch.root))
  return fromFetch.returnValue
}

/* Render */
const data = createFromFetch(fetch(getUrl()), { callServer, moduleBaseURL })
const Shell = ({ data }: any) => {
  const [root, setRoot] = useState(use(data))
  updateRoot = setRoot
  return root
}
hydrateRoot(document.getElementById("root")!, createElement(Shell, { data }))
