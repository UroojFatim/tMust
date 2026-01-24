'use client'
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@clerk/nextjs";

const ContinueShoppingButton = () => {
    const [state, setState] = useState(false);
    const { userId } = useAuth();

    async function handleResetCart() {
        const res = await fetch("/api/cartReset", {
          method: "DELETE",
          body: JSON.stringify({
            user_id: userId,
          }),
        });
        setState(!state);
      }
  return (
    <div>
      <Button onClick={handleResetCart} className="text-white mt-1 rounded-lg px-28 py-6 text-xl">
        <a href="../">Continue Shopping</a>
      </Button>
    </div>
  );
};

export default ContinueShoppingButton;
