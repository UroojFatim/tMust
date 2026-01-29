"use client";

import React from "react";
import { CartProvider } from "@/components/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <ToastContainer position="top-right" autoClose={2500} />
    </CartProvider>
  );
}
