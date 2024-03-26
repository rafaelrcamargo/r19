import React, { type PropsWithChildren } from "react"

export default ({ children }: PropsWithChildren) => (
  <html>
    <head>
      {/* We only inline the Tailwind Script for the sake of the example */}
      <script src="https://cdn.tailwindcss.com" />
    </head>
    <body>
      {/* We could add any kind of shared UI here */}
      <main id="root">{children}</main>
    </body>
  </html>
)
