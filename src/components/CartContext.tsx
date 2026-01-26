'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

// Create a context for the cart
const CartContext = createContext<{
  cartItemCount: number;
  setCartItemCount: React.Dispatch<React.SetStateAction<number>>;
  cartItems: any[]; // Add a property for cartItems
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>; // Add a setter for cartItems
  userId: string; // Session-based user ID
}>({
  cartItemCount: 0,
  setCartItemCount: () => {},
  cartItems: [], // Initialize cartItems as an empty array
  setCartItems: () => {}, // Initialize setCartItems as a no-op function
  userId: '',
});

// Create a CartProvider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');

  // Generate or retrieve session-based user ID
  useEffect(() => {
    let sessionUserId = localStorage.getItem('session_user_id');
    if (!sessionUserId) {
      sessionUserId = uuidv4();
      localStorage.setItem('session_user_id', sessionUserId);
    }
    setUserId(sessionUserId);
  }, []);

  return (
    <CartContext.Provider value={{ cartItemCount, setCartItemCount, cartItems, setCartItems, userId }}>
      {children}
    </CartContext.Provider>
  );
}

// Create a custom hook to use the cart context
export function useCart() {
  return useContext(CartContext);
}
