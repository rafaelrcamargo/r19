import type { PropsWithChildren } from "react"
import React from "react"

export default ({ children }: PropsWithChildren) => (
  <html>
    <head>
      <script src="https://cdn.tailwindcss.com" />
    </head>
    <body>
      <div id="root">{children}</div>
    </body>
  </html>
)
