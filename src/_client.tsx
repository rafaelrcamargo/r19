import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { createFromFetch } from "react-server-dom-webpack/client";

// @ts-expect-error - Hack to map webpack resolution to native ESM
window.__webpack_require__ = async (id) => import(id);

createFromFetch(fetch("/rsc")).then((response: ReactNode) =>
  createRoot(document.getElementById("root")!).render(response)
);
