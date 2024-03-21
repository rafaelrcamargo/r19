import React, { type PropsWithChildren } from "react"

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
