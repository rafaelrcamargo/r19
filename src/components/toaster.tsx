"use client"

import React from "react"
import { toast, Toaster } from "sonner"

export const ShowToast = () => {
  const choose = () => {
    switch (Math.floor(Math.random() * 5) + 1) {
      case 1:
        return toast.info("My first info toast")
      case 2:
        return toast.success("My first success toast")
      case 3:
        return toast.warning("My first warning toast")
      case 4:
        return toast.error("My first error toast")
      case 5:
        return toast("My first toast")
    }
  }

  return (
    <>
      <Toaster richColors closeButton />

      <button
        onClick={choose}
        className="relative h-14 w-full border-l-4 border-dashed border-sky-400 bg-sky-100 text-xl hover:bg-sky-200">
        Toast! <small className="absolute right-1 bottom-1 text-xs opacity-50">(Client lib.)</small>
      </button>
    </>
  )
}
