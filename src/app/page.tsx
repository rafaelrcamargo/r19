import React, { Suspense } from "react"
import { update } from "../components/actions"
import { Counter } from "../components/counter"
import { OS } from "../components/os"
import { ShowToast } from "../components/toaster"
import { db } from "../database"

export const dynamic = "force-dynamic"

const Page = () => {
  const { counter } = db.query(`SELECT value as counter FROM counter WHERE id = 1`).get() as {
    counter: number
  }

  return (
    <>
      <main className="border-4 border-dashed border-rose-400 p-4">
        <h1 className="text-2xl font-bold">
          Hello from <i>{process.release.name}</i>! {/* Isn't this supposed to be "bun"?! */}
        </h1>

        <p>
          You're running: <OS />
        </p>

        <section className="mt-4 flex h-16 items-center justify-center border-4 border-dashed border-sky-400">
          <Suspense fallback={"Loading Counter..."}>
            <Counter initialValue={counter} action={update} />
          </Suspense>

          <Suspense fallback={"Loading ShowToast..."}>
            <ShowToast />
          </Suspense>
        </section>

        <p className="mt-2 text-sm">
          <b>This is a "{dynamic}" page!</b> This page opted out of static generation because we have a
          dynamic value in focus. If we were to statically generate this page, we would need to regenerate it
          every time the value changes, or else the wrong value would "flash", causing a hydration error.
        </p>

        <nav className="mt-4 [&_a]:text-sky-500 [&_a]:underline">
          Follow to: <a href="/props?name=John&age=25">/props</a>, <a href="/form">/form</a> or{" "}
          <a href="/404">/404</a>
        </nav>
      </main>

      <footer className="mx-4 mt-4">
        <h2>Caption:</h2>

        <small className="text-rose-400">
          * Server components = No bundle size increase, rendered on the server
        </small>
        <br />
        <small className="text-sky-400">
          * Client components = Includes a JS bundle, rendered on the client
        </small>
      </footer>
    </>
  )
}

export default Page
