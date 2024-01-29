"use client";

import { useState, useTransition } from "react";

export default ({ action }: any) => {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(0);

  const onClick = () => {
    console.log("click");
    // @ts-expect-error - TODO: fix this
    startTransition(async () => {
      console.log("transitioning");
      const currentCount = await action();
      setLikeCount(currentCount);
    });
  };

  return (
    <>
      <p>Total Likes: {likeCount}</p>
      <button onClick={onClick} disabled={isPending}>
        Like
      </button>
    </>
  );
};
