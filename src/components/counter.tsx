"use client"

import React, { useReducer } from "react"
import { toast, Toaster } from "sonner"

export default () => {
  const [count, increment] = useReducer(count => count + 1, 0)

  return (
    <>
      <Toaster closeButton />

      <button onClick={increment} className="h-14 w-full bg-blue-100 text-xl hover:bg-blue-200">
        {count}
      </button>

      <button
        onClick={() => toast("Message from the client!")}
        className="h-14 w-full border-l-4 border-dashed border-blue-400 bg-blue-100 text-xl hover:bg-blue-200">
        Toast!
      </button>
    </>
  )
}
