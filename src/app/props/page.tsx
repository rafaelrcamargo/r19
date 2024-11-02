import React from "react"
import { codeToHtml } from "shiki"

export const Page = async (props: unknown) => {
  const html = await codeToHtml(JSON.stringify(props), {
    lang: "json",
    theme: "rose-pine-dawn"
  })

  return (
    <main className="m-4 border-4 border-dashed border-rose-400 p-4">
      <h1 className="text-2xl font-bold">Hello from /props!</h1>

      <section>
        <p className="mt-4">
          Incoming props: <i className="text-xs opacity-50">(Look at your URL!)</i>
        </p>

        {/* Here we use the generated HTML to render the highlighting */}
        <div
          className="mt-2 overflow-hidden rounded-md [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <i className="text-xs opacity-50">
          This was rendered on the server, and no JS was sent to the client for the <i>(huge)</i> syntax
          highlighting library.
        </i>
      </section>

      <nav className="mt-4 [&_a]:text-sky-500 [&_a]:underline">
        Go back to: <a href="/">/</a>
      </nav>
    </main>
  )
}

export default Page
