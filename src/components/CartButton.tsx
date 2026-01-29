"use client"
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCart } from "./CartContext";

const CartButton = () => {
  const { cartItemCount } = useCart();

  return (
    <Link href="/cart">
      <button className="relative p-2 rounded-full hover:bg-white/40 transition">
        <ShoppingCart className="h-6 w-6 text-black" />
        {cartItemCount > 0 && (
          <div className="absolute z-10 top-0 text-center bg-red-500 text-xs text-white rounded-full h-4 w-4 right-1">
            {cartItemCount}
          </div>
        )}
      </button>
    </Link>
  );
};

export default CartButton;
