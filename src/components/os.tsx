import os from "os"

import React from "react"

export default () => (
  <b>
    {/* This is only accessible on the server */}
    {os.platform()} {os.arch()}
  </b>
)
