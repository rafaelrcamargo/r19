"use client"

import React, { useActionState, useTransition, type FC } from "react"
import type { signup } from "./actions"

export const Form: FC<{ action: typeof signup }> = ({ action }) => {
  const [state, formAction] = useActionState(action, { user: "" })
  const [isPending, startTransition] = useTransition()

  const handleAction = (data: FormData) => startTransition(async () => formAction(data))

  return (
    <>
      <form className="flex flex-wrap gap-4" action={handleAction}>
        <input
          type="email"
          name="email"
          disabled={isPending}
          placeholder="Your best email..."
          className="border-2 border-dashed border-gray-400 bg-gray-100 p-2 disabled:opacity-50"
        />
        <input
          type="password"
          name="password"
          disabled={isPending}
          placeholder="A secure password..."
          className="border-2 border-dashed border-gray-400 bg-gray-100 p-2 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isPending}
          className="relative h-14 w-full border-2 border-dashed border-blue-400 bg-blue-100 text-xl duration-150 hover:bg-blue-200 disabled:bg-red-100 disabled:opacity-50">
          {isPending ? "Loading..." : "Sign up"}
        </button>
      </form>

      {state?.user && (
        <p className="mt-4">
          Signed up with: <b>{state?.user}</b>
        </p>
      )}
    </>
  )
}
