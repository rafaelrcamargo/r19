import React, { Suspense } from "react"
import { add, addDB } from "../components/actions"
import Counter from "../components/counter"
import CounterDB from "../components/counter-db"
import OS from "../components/os"
import { selectQuery } from "../database"

const Page = () => {
  const { counter } = selectQuery.get() as { counter: number }
  return (
    <>
      <main className="m-4 border-4 border-dashed border-red-400 p-4">
        <h1 className="text-2xl font-bold">
          Hello from <i>{process.release.name}</i>! {/* Shouldn't this be "bun" ??? */}
        </h1>

        <p>
          You're running: <OS />
        </p>

        <section className="mt-4 flex h-16 items-center justify-center border-4 border-dashed border-blue-400">
          <Suspense fallback={"Loading counter..."}>
            <Counter action={add} />
          </Suspense>
        </section>

        <section className="mt-4 flex h-16 items-center justify-center border-4 border-dashed border-blue-400">
          <Suspense fallback={"Loading counter..."}>
            <CounterDB initValue={counter} action={addDB} />
          </Suspense>
        </section>

        <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
          Follow to: <a href="/props?name=John&age=25">/props</a>, <a href="/form">/form</a> or{" "}
          <a href="/404">/404</a>
        </nav>
      </main>

      <footer className="mx-4">
        <h2>Caption:</h2>

        <small className="text-red-400">
          * Server components = No bundle size increase, rendered on the server
        </small>
        <br />
        <small className="text-blue-400">
          * Client components = Includes a JS bundle, rendered on the client
        </small>
      </footer>
    </>
  )
}

export default Page
