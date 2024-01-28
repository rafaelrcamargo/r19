import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { createFromFetch } from "react-server-dom-webpack/client";

// @ts-expect-error - Hack to map webpack resolution to native ESM
window.__webpack_require__ = async (id) => import(id);

const url = new URL(window.location.href);
const search = new URLSearchParams(window.location.search);
search.set("__RSC", "true");
url.search = search.toString();

createFromFetch(
  fetch(url) /* , {
  callServer(id: { id: string; name: string }, args: unknown[]) {
    console.log("CALL_SERVER");
    const searchParams = new URLSearchParams();
    searchParams.set("id", id.id);
    searchParams.set("name", id.name);
    const response = fetch(`/rsf?${searchParams}`, {
      method: "POST",
      body: JSON.stringify(args)
    });
    return createFromFetch(response);
  }
} */
).then((response: ReactNode) =>
  createRoot(document.getElementById("root")!).render(response)
);
