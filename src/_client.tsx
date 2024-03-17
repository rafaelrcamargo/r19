import { startTransition } from "react";
// @ts-expect-error - React types are not up to date
import { createElement, useState, use } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import {
  createFromFetch,
  encodeReply
} from "react-server-dom-esm/client.browser";

/* // @ts-expect-error - we just use webpack's function names to avoid forking react
window.__webpack_chunk_load__ = async (moduleId, ...args) => import(moduleId);
// @ts-expect-error - Hack to map webpack resolution to native ESM
window.__webpack_require__ = async (id) => import(id); */

const moduleBaseURL = "/build/";

let updateRoot: React.Dispatch<React.SetStateAction<unknown>>;
const callServer = async (id: any, args: any): Promise<any> => {
  console.log("callServer", id, args);

  const fromFetch = await createFromFetch(
    fetch(`/?__RSA=true`, {
      method: "POST",
      body: await encodeReply(args)
    }),
    {
      callServer,
      moduleBaseURL
    }
  );

  console.log("returnValue", fromFetch);

  startTransition(() => updateRoot(fromFetch.root));
  return fromFetch.returnValue;
};

const url = new URL(window.location.href);
const search = new URLSearchParams(window.location.search);
search.set("__RSC", "true");
url.search = search.toString();

console.log("fetching", url);

const data = createFromFetch(fetch(url), {
  callServer,
  moduleBaseURL
}); /* .then(
  (value: unknown) => {
    console.log("From fetch:", value);
    return createRoot(document.getElementById("root")!).render(
      <StrictMode>{value as ReactNode}</StrictMode>
    );
  },
  console.error
); */

console.log("data", data);

function Shell({ data }: any) {
  console.log("Shell", data);
  const [root, setRoot] = useState(use(data));
  updateRoot = setRoot;
  return root;
}

// hydrateRoot(document.getElementById("root")!, createElement(Shell, { data }));
createRoot(document.getElementById("root")!).render(<Shell data={data} />);
