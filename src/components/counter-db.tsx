"use client"

import React, { useState, useTransition } from "react"

export default ({ initValue, action }: { initValue: number, action: () => number }) => {
  const [isPending, startTransition] = useTransition()
  const [count, setCount] = useState(initValue)


  const handleAction = () =>
    // @ts-expect-error - async functions should be expected
    startTransition(async () => setCount(async () => await action()))

  return (
    <>

      <button
        disabled={isPending}
        onClick={handleAction}
        className="relative h-14 w-full bg-blue-100 text-xl duration-150 hover:bg-blue-200 disabled:bg-red-100 disabled:opacity-50">
        {count}
        <small className="absolute bottom-1 right-1 text-xs opacity-50">
          (Server action with persistent state in sqlite db)
        </small>
      </button>

    </>
  )
}
