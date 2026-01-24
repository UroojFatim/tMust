'use client';

import React, { createContext, useContext, useState } from "react";

// Create a context for the cart
const CartContext = createContext<{
  cartItemCount: number;
  setCartItemCount: React.Dispatch<React.SetStateAction<number>>;
  cartItems: any[]; // Add a property for cartItems
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>; // Add a setter for cartItems
}>({
  cartItemCount: 0,
  setCartItemCount: () => {},
  cartItems: [], // Initialize cartItems as an empty array
  setCartItems: () => {}, // Initialize setCartItems as a no-op function
});

// Create a CartProvider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);

  return (
    <CartContext.Provider value={{ cartItemCount, setCartItemCount, cartItems, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

// Create a custom hook to use the cart context
export function useCart() {
  return useContext(CartContext);
}
