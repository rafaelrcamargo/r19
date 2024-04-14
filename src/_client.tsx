import { createElement, use, type FC, type ReactNode } from "react"
import { hydrateRoot } from "react-dom/client"
import { createFromFetch, encodeReply } from "react-server-dom-esm/client"

// The *server* path of the modules
const moduleBaseURL = "/build/"

// Function to prepare a URL to a action call on the RSC server
const getUrl = () => {
  const url = new URL(location.href)
  url.port = "3001"
  return url
}

// This is the one that will handle the calls to resolve the actions
const callServer = async (id: string, args: unknown[]) =>
  (
    await createFromFetch(
      fetch(getUrl(), {
        method: "POST",
        body: await encodeReply(args),
        headers: {
          "rsa-origin": location.pathname, // Tells the server where the call is coming from
          "rsa-reference": id // Tells the server which action is being called
        }
      }),
      { callServer, moduleBaseURL }
    )
  ).returnValue

// `createFromFetch` will get the data to hydrate the page
const data = createFromFetch(fetch(getUrl()), { callServer, moduleBaseURL })

// This will transform the ReactNode stream into a ReactNode tree
const Shell: FC<{ data: ReactNode }> = ({ data }) => use(data)

// Finally this will then hydrate the page with the `Shell` component as the root
hydrateRoot(document.getElementById("root")!, createElement(Shell, { data }))
