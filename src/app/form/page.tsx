import React from "react"
// import { Form } from "../../components/form"

const Page = () => {
  return (
    <main className="m-4 border-4 border-dashed border-red-400 p-4">
      {/* <Form action={signup} /> */}

      <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
        Go back to: <a href="/">/</a>
      </nav>
    </main>
  )
}

export default Page
