import { Prism } from "react-syntax-highlighter"

import { addLike } from "../../components/actions"
import Greet from "../../components/greet"
import React from "react"

const Page = async (props: {}) => {
  return (
    <>
      <main className="m-4 p-4 border-4 border-dashed border-red-400">
        <h1 className="text-2xl font-bold">Hello from /hey!</h1>
        <section>
          <p className="mt-4">
            Server props: <small>(URL search params)</small>
          </p>
          <Prism language="json">{JSON.stringify(props, null, 2)}</Prism>
          <small className="opacity-50">
            This was rendered on the server, and no JS was sent to the client for the syntax highlighting.
          </small>
        </section>

        <Greet action={addLike} />

        <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
          Follow to broken: <a href="/random">404</a>
        </nav>
      </main>
    </>
  )
}

export default Page
