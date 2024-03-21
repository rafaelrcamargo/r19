"use client"

import React, { useState, useTransition } from "react"

export default ({ action }: any) => {
  const [isPending, startTransition] = useTransition()
  const [count, setCount] = useState(0)

  const onClick = () =>
    // @ts-expect-error - async functions should be valid
    startTransition(async () => setCount(await action()))

  return (
    <div className="mt-4 flex items-center justify-between border-2 border-dashed border-blue-400 p-4">
      <p>
        Count: <b>{count}</b>
      </p>
      <small className="opacity-50">(This is a server action with a artificial delay)</small>
      <button
        className="rounded-sm border border-blue-400 bg-blue-500/10 px-6 py-1 text-blue-600 duration-150 hover:bg-blue-500/20 hover:shadow-md active:shadow-sm disabled:grayscale"
        onClick={onClick}
        disabled={isPending}>
        +1
      </button>
    </div>
  )
}
