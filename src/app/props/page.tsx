import hljs from "highlight.js"
import { resolve } from "path"
import React from "react"
// @ts-ignore
import styles from "highlight.js/styles/github-dark.css"

export const Page = async (props: unknown) => {
  const html = hljs.highlightAuto(JSON.stringify(props)).value

  return (
    <main className="m-4 border-4 border-dashed border-red-400 p-4">
      <h1 className="text-2xl font-bold">Hello from /props!</h1>

      <section>
        <p className="mt-4">
          Server props: <small>(Look at your URL!)</small>
        </p>

        {/* Here we load the imported CSS file, it will be bundled with the page */}
        <link rel="stylesheet" href={resolve("/build/app/props", styles)} />
        {/* Here we use the generated HTML to render the highlighting */}
        <div
          className="my-2 rounded-md bg-[#22272e] p-4 text-[#cdd9e5]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <small className="opacity-50">
          This was rendered on the server, and no JS was sent to the client for the <i>(huge)</i> syntax
          highlighting lib.
        </small>
      </section>

      <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
        Go back to: <a href="/">/</a>
      </nav>
    </main>
  )
}

export default Page
