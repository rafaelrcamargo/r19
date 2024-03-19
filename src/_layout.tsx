export default ({children}: any) => (
  <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root">{children}</div>
      <script type="module" src="/build/_client.js"></script>
    </body>
  </html>
)
