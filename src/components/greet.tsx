"use client"

import React from "react"
import { useState, useTransition } from "react"

export default ({ action }: any) => {
  const [isPending, startTransition] = useTransition()
  const [likeCount, setLikeCount] = useState(0)

  const onClick = () =>
    // @ts-expect-error - async functions should be valid
    startTransition(async () => setLikeCount(await action()))

  return (
    <>
      <p>Total Likes: {likeCount}</p>
      <button onClick={onClick} disabled={isPending}>
        Like
      </button>
    </>
  )
}
