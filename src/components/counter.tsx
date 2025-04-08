"use client"

import React, { useState, useTransition, type FC } from "react"

type Props = { initialValue: number; action: () => Promise<number> }
export const Counter: FC<Props> = ({ initialValue, action }) => {
  const [isPending, startTransition] = useTransition()
  const [count, setCount] = useState(initialValue)

  const handleAction = () => startTransition(async () => setCount(await action()))

  return (
    <button
      disabled={isPending}
      onClick={handleAction}
      className="relative h-14 w-full bg-sky-100 text-xl duration-150 hover:bg-sky-200 disabled:bg-rose-100 disabled:opacity-50">
      {count}

      <small className="absolute right-1 bottom-1 text-xs opacity-50">
        (Server function w/ persistent state in SQLite)
      </small>
    </button>
  )
}
