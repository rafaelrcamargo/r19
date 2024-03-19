import { Suspense } from "react"

import Counter from "../components/counter"
import OS from "../components/os"

const Page = () => {
  return (
    <>
      <main className="m-4 p-4 border-4 border-dashed border-red-400">
        <h1 className="text-2xl font-bold">Hello from the Server!</h1>

        <p>
          You're running <OS />
        </p>

        <section className="mt-4 border-4 h-16 flex items-center justify-center border-dashed border-blue-400">
          <Suspense fallback={"Loading..."}>
            <Counter />
          </Suspense>
        </section>

        <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
          Follow to: <a href="/hey">Hey!</a> - ({Math.random()})
        </nav>
      </main>

      <footer className="mx-4">
        <h2>Caption:</h2>

        <small className="text-red-400">* Server components = No JS, rendered on the server</small>
        <br />
        <small className="text-blue-400">* Client components = JS, rendered on the client</small>
      </footer>
    </>
  )
}

export default Page
