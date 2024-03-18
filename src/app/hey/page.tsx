/* import { Prism } from "react-syntax-highlighter"; */
import { addLike } from "../../components/actions"
import Greet from "../../components/greet"

const Page = async (props: {}) => {
  return (
    <>
      <main className="m-4 p-4 border-4 border-dashed border-red-400">
        <h1 className="text-2xl font-bold">Hello from the on /hey!</h1>
        {/* <p className="mt-4">
          Server side props: <small>(Search Params)</small>
        </p>
        <Prism language="json">{JSON.stringify(props, null, 2)}</Prism> */}

        <Greet action={addLike} />

        <nav className="mt-4 [&_a]:text-blue-500 [&_a]:underline">
          Follow to broken: <a href="/random">404</a>
        </nav>
      </main>
    </>
  )
}

export default Page
