"use client"

import React, { type FC } from "react"
import { useFormState, useFormStatus } from "react-dom"

const initialState = { message: "" }

export const Form: FC<{ action: Function }> = ({ action }) => {
  const [state, formAction] = useFormState(action, initialState)

  return (
    <form className="flex gap-4" action={formAction}>
      <input className="rounded-md border border-gray-300 p-2" type="text" name="email" placeholder="Email" />
      <input
        className="rounded-md border border-gray-300 p-2"
        type="password"
        name="password"
        placeholder="Password"
      />
      <Submit />

      <p aria-live="polite" role="status">
        {state?.message}
      </p>
    </form>
  )
}

const Submit = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-500 px-6 py-2 text-white disabled:opacity-50">
      Sign up
    </button>
  )
}
