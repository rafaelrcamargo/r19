import React from "react"
import { Prism } from "react-syntax-highlighter"

import { add } from "../../components/actions"
import Counter from "../../components/count"

const Page = async (props: {}) => {
  return (
    <>
      <main className="m-4 border-4 border-dashed border-red-400 p-4">
        <h1 className="text-2xl font-bold">Hello from /action!</h1>
        <section>
          <p className="mt-4">
            Server props: <small>(URL search params)</small>
          </p>
          <Prism language="json">{JSON.stringify(props, null, 2)}</Prism>
          <small className="opacity-50">
            This was rendered on the server, and no JS was sent to the client for the syntax highlighting.
          </small>
        </section>

        <Counter action={add} />

        <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
          Go back to: <a href="/">/</a>
        </nav>
      </main>
    </>
  )
}

export default Page
