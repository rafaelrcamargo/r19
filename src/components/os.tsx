import os from "os"
import React from "react"

export default () => (
  <b>
    {os.platform()} {os.arch()}
  </b>
)
