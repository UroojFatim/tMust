"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCart } from "./CartContext";

const CartButton = () => {
  const { cartItemCount } = useCart();

  return (
    // CHANGED: single <Link> acts as the control (no nested <button> inside <a>,
    // which is invalid interactive nesting and broke the accessibility tree).
    // CHANGED: aria-label gives the icon-only link a discernible name.
    // CHANGED: min 44x44 hit area satisfies the "touch target size" audit.
    <Link
      href="/cart"
      aria-label={
        cartItemCount > 0
          ? `Cart, ${cartItemCount} item${cartItemCount === 1 ? "" : "s"}`
          : "Cart"
      }
      className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-black/5"
    >
      <ShoppingCart className="h-6 w-6 text-black" aria-hidden="true" />
      {cartItemCount > 0 && (
        <span className="absolute right-1 top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
          {cartItemCount}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
