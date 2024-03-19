import type { PropsWithChildren } from "react"

export default ({ children }: PropsWithChildren) => (
  <html>
    <head>
      <script src="https://cdn.tailwindcss.com" />
    </head>
    <body>
      <div id="root">{children}</div>
      <script type="module" src="/build/_client.js" />
    </body>
  </html>
)
