"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

type CartContextType = {
  cartItemCount: number;
  cartItems: any[];
  userId: string;

  setCartItemCount: React.Dispatch<React.SetStateAction<number>>;
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;

  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cartItemCount: 0,
  setCartItemCount: () => {},
  cartItems: [],
  setCartItems: () => {},
  userId: "",
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>("");

  // ✅ 1) Generate or retrieve session-based user ID
  useEffect(() => {
    let sessionUserId = localStorage.getItem("session_user_id");
    if (!sessionUserId) {
      sessionUserId = uuidv4();
      localStorage.setItem("session_user_id", sessionUserId);
    }
    setUserId(sessionUserId);
  }, []);

  // ✅ 2) refreshCart function (DB is source of truth)
  const refreshCart = useCallback(async () => {
    try {
      if (!userId) return;

      const res = await fetch(`/api/cart?user_id=${userId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("refreshCart API error:", res.status);
        setCartItems([]);
        setCartItemCount(0);
        return;
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : [];

      setCartItems(items);

      // ✅ badge count = sum of quantities
      const total = items.reduce((acc: number, item: any) => {
        return acc + (item.product_quantity ?? 1);
      }, 0);

      setCartItemCount(total);
    } catch (err) {
      console.error("refreshCart error:", err);
      setCartItems([]);
      setCartItemCount(0);
    }
  }, [userId]);

  // ✅ 3) When userId becomes available, refresh from API
  useEffect(() => {
    if (userId) refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ✅ 4) (Optional) fallback localStorage persistence (can remove if you want)
  useEffect(() => {
    localStorage.setItem("cartItemCount", cartItemCount.toString());
  }, [cartItemCount]);

  const value = useMemo(
    () => ({
      cartItemCount,
      setCartItemCount,
      cartItems,
      setCartItems,
      userId,
      refreshCart,
    }),
    [cartItemCount, cartItems, userId, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}