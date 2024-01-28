"use client";

export const Greeter = ({ greet }: any) => {
  return (
    <button
      onClick={() =>
        Promise.resolve(greet(String(Math.random()))).then((res) => alert(res))
      }
      className="mt-4"
    >
      Greet
    </button>
  );
};
