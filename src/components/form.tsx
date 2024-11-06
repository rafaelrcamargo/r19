"use client"

import React, { useState, useTransition, type FC } from "react"
import type { signup } from "./actions"

type Props = { action: typeof signup }
export const Form: FC<Props> = ({ action }) => {
  const [state, setState] = useState<{ user: string }>()
  const [isPending, startTransition] = useTransition()

  const handleAction = (data: FormData) => startTransition(async () => setState(await action(data)))

  return (
    <>
      <form className="flex flex-wrap gap-4" action={handleAction}>
        <input
          type="email"
          name="email"
          disabled={isPending}
          placeholder="Your best email..."
          className="border-2 border-dashed border-gray-200 bg-gray-50 p-2 disabled:opacity-50"
        />
        <input
          type="password"
          name="password"
          disabled={isPending}
          placeholder="A secure password..."
          className="border-2 border-dashed border-gray-200 bg-gray-50 p-2 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isPending}
          className="border-2 border-dashed border-green-300 bg-green-100 p-2 px-6 duration-150 hover:bg-green-200 disabled:border-rose-300 disabled:bg-rose-100 disabled:opacity-50">
          Sign up
        </button>
      </form>

      <p className="mt-4">
        {state?.user ? (
          <>
            Signed up with: <b>{state?.user}</b>
          </>
        ) : (
          isPending && (
            <>
              Loading... <i>(This function is throttled, no worries)</i>
            </>
          )
        )}
      </p>
    </>
  )
}
