'use client'

import React from "react";
import { useState } from "react";

const Quantity = (item:any) => {
  const [num, setNum] = useState(1);

  return (
    <section className="flex items-center gap-x-2">
      <div
        className="border rounded-full h-8 w-8 text-center bg-slate-200 text-2xl"
        onClick={() => {
          setNum(num <= 1 ? 1 :num - 1);
        }}
      >
        -
      </div>
      <span>{num}</span>
      <div
        className="border rounded-full h-8 w-8 text-center bg-slate-200 text-xl"
        onClick={() => {
          setNum(num + 1);
        }}
      >
        +
      </div>
    </section>
  );
};

export default Quantity;
