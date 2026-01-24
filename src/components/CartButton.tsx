"use client"
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCart } from "./CartContext";

const CartButton = () => {
  const { cartItemCount } = useCart();

  return (
    <Link href="/cart">
      <button className="h-10 w-10 rounded-full bg-gray-200 flex justify-center items-center relative">
        <ShoppingCart className="h-5 w-5" />
        <div className="absolute z-10 top-0 text-center bg-red-500 text-xs text-white rounded-full h-4 w-4 left-6">
          {cartItemCount}
        </div>
      </button>
    </Link>
  );
};

export default CartButton;
