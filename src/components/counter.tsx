"use client";

import { useReducer } from "react";
import { Toaster, toast } from "sonner";

export default () => {
  const [count, increment] = useReducer((count) => count + 1, 0);

  return (
    <>
      <Toaster closeButton />

      <button
        onClick={increment}
        className="text-xl w-full h-14 bg-blue-100 hover:bg-blue-200"
      >
        {count}
      </button>
      <button
        onClick={() => toast("Message from the client!")}
        className="text-xl w-full border-l-4 border-dashed border-blue-400 h-14 bg-blue-100 hover:bg-blue-200"
      >
        Toast!
      </button>
    </>
  );
};

export const Dummy = () => <></>;
