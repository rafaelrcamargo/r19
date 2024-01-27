import { Suspense } from "react";

import Counter from "./counter";
import OS from "./os";

const Page = () => {
  return (
    <>
      <main className="m-4 p-4 border-4 border-dashed border-red-400">
        <h1 className="text-2xl font-bold">Hello from the Server!</h1>

        <p>
          You're running <OS />
        </p>

        <section className="mt-4 border-4 h-16 flex items-center justify-center border-dashed border-blue-400">
          <Suspense fallback={<Spinner />}>
            <Counter />
          </Suspense>
        </section>
      </main>

      <footer className="mx-4">
        <h2>Caption:</h2>

        <small className="text-red-400">
          * Server components = No JS, rendered on the server
        </small>
        <br />
        <small className="text-blue-400">
          * Client components = JS, rendered on the client
        </small>
      </footer>
    </>
  );
};

export default Page;

const Spinner = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" className="stroke-slate-500">
    <g fill="none" fillRule="evenodd" strokeWidth="2">
      <circle cx="22" cy="22" r="1">
        <animate
          attributeName="r"
          begin="0s"
          dur="1.8s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          begin="0s"
          dur="1.8s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="22" cy="22" r="1">
        <animate
          attributeName="r"
          begin="-0.9s"
          dur="1.8s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          begin="-0.9s"
          dur="1.8s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  </svg>
);
