import os from "os"
import React from "react"

export const OS = () => (
  <b>
    {/* This is only accessible on the server */}
    {os.platform()} {os.arch()}
  </b>
)
