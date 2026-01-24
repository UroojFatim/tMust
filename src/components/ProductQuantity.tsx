"use client";
import React, { useEffect } from "react";
import { CartProvider, useCart } from "./CartContext";

const ProductQuantity = () => {
  const { cartItems } = useCart();
  const [totalQuantity, setTotalQuantity] = React.useState(0);

  useEffect(() => {
    console.log("cartItems:", cartItems);
    const newTotalQuantity = cartItems.reduce(
      (total, item) => total + item.product_quantity,
      0
    );
    console.log("newTotalQuantity:", newTotalQuantity);
    setTotalQuantity(newTotalQuantity);
  }, [cartItems]);

  useEffect(() => {
    const newTotalQuantity = cartItems.reduce(
      (total, item) => total + item.product_quantity,
      0
    );
    setTotalQuantity(newTotalQuantity);
  }, [cartItems]);

  return (
    <CartProvider>
      <section className="flex items-center gap-x-2">
        <span>{totalQuantity}</span>
      </section>
    </CartProvider>
  );
};

export default ProductQuantity;
