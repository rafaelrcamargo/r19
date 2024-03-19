import { createFromFetch, encodeReply } from "react-server-dom-esm/client.browser"
import { useState, startTransition, use, createElement, type Dispatch } from "react"
import { hydrateRoot } from "react-dom/client"

const moduleBaseURL = "/build/"

let updateRoot: Dispatch<any>
const callServer = async (id: string, args: unknown[]): Promise<unknown> => {
  const fromFetch = await createFromFetch(
    fetch(`/?__RSA=true`, {
      method: "POST",
      headers: { "rsa-origin": window.location.pathname, "rsa-reference": id },
      body: await encodeReply(args)
    }),
    { callServer, moduleBaseURL }
  )

  startTransition(() => updateRoot(fromFetch.root))
  return fromFetch.returnValue
}

const url = new URL(window.location.href)
const search = new URLSearchParams(window.location.search)
search.set("__RSC", "true")
url.search = search.toString()

const data = createFromFetch(fetch(url), { callServer, moduleBaseURL })

const Shell = ({ data }: any) => {
  const [root, setRoot] = useState(use(data))
  updateRoot = setRoot
  return root
}

hydrateRoot(document.getElementById("root")!, createElement(Shell, { data }))
