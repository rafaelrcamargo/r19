import React, { type PropsWithChildren } from "react"

export default ({ children }: PropsWithChildren) => (
  <html>
    <head>
      <meta charSet="UTF-8" />
      <title>R19 - A dead-simple React 19 "framework" implementation!</title>
      {/* We only inline Tailwind for the sake of the example. */}
      <script src="https://cdn.tailwindcss.com" />
    </head>
    <body>
      <main id="root" className="m-4 border-2 border-dashed border-neutral-300 p-4">
        {children}
      </main>

      <footer className="mt-4 flex w-full items-center justify-center gap-2 text-center text-xs text-neutral-400">
        <a target="_blank" href="https://github.com/rafaelrcamargo/r19" className="underline">
          GitHub
        </a>
        |<span>CMRG</span>
        <span>©</span>
        <time>{new Date().getFullYear()}</time>
      </footer>
    </body>
  </html>
)
