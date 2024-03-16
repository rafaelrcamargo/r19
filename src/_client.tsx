import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { createFromFetch } from "react-server-dom-webpack/client";
// import { createFromFetch } from "react-server-dom-esm/client";

const __bun__module_map__ = new Map();

// @ts-expect-error - we just use webpack's function names to avoid forking react
window.__webpack_chunk_load__ = async function (moduleId, ...args) {
  console.log("chunk load", moduleId, args);
  const mod = await import(moduleId);
  __bun__module_map__.set(moduleId, mod);
  return mod;
};

// @ts-expect-error - hack to map webpack resolution to bun
window.__webpack_require__ = function (moduleId, ...args) {
  // TODO: handle non-default exports
  console.log("require", moduleId, args);
  return __bun__module_map__.get(moduleId);
};

/* // @ts-expect-error - Hack to map webpack resolution to native ESM
window.__webpack_require__ = async (id) => import(id); */

const url = new URL(window.location.href);
const search = new URLSearchParams(window.location.search);
search.set("__RSC", "true");
url.search = search.toString();

fetch(url).then(async (response) => {
  console.log(await response.text());
});

createFromFetch(fetch(url), {
  callServer(id: string, args: unknown[]) {
    console.log("callServer", id, args);

    const response = fetch(`/api/${id}`, {
      body: JSON.stringify(args),
      method: "POST"
    });

    return createFromFetch(response);
  },
  
}).then((response: ReactNode) => {
  console.log("From fetch:", response);
  return createRoot(document.getElementById("root")!).render(
    <StrictMode> {response}</StrictMode>
  );
});
