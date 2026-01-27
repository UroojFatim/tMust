/* eslint-disable react/jsx-key */
"use client";

import getStripePromise from "@/lib/stripe";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import Wrapper from "@/components/shared/Wrapper";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartContext";

const titleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");


  
type CartItem = {
  product_id: string;
  product_title: string;
  product_category: string;
  image_url: string;
  unit_price: number;
  product_quantity: number;

  // the ones we want to show
  product_size?: string | null;
  product_color?: string | null;

  // sometimes backend sends different names
  size?: string | null;
  color?: string | null;

  cart_item_id?: string;
};

export default function CartItems() {
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(false);

  const { userId, refreshCart } = useCart();

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getRowKey = (item: CartItem) => {
    if (item.cart_item_id) return item.cart_item_id;

    const size = (item.product_size ?? item.size ?? "no-size") || "no-size";
    const color = (item.product_color ?? item.color ?? "no-color") || "no-color";

    return `${item.product_id}__${size}__${color}`;
  };

  useEffect(() => {
    const run = async () => {
      if (!userId) {
        setLoading(false);
        setProducts([]);
        setQuantities({});
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/cart?user_id=${userId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

        const data = await res.json();
        const cartItems: CartItem[] = Array.isArray(data) ? data : [];

        // ✅ normalize fields so UI always sees product_size/product_color
        const normalized = cartItems.map((it) => ({
          ...it,
          product_size: it.product_size ?? it.size ?? null,
          product_color: it.product_color ?? it.color ?? null,
        }));

        setProducts(normalized);

        const initial: Record<string, number> = {};
        for (const item of normalized) {
          initial[getRowKey(item)] = item.product_quantity ?? 1;
        }
        setQuantities(initial);
      } catch (e) {
        console.error("Error fetching cart:", e);
        setProducts([]);
        setQuantities({});
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [userId, state]);

  const handleCheckout = async () => {
    const stripePromise = await getStripePromise();
    if (!stripePromise) {
      alert("Payment system not configured. Please add valid Stripe keys to .env.local");
      return;
    }

    const response = await fetch("/api/stripe-session/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify({
        products,
        session_user_id: userId,
        quantities,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    if (data.session?.id) {
      await stripePromise.redirectToCheckout({ sessionId: data.session.id });
    }
  };

  // ✅ delete by unique row (using row_key for proper variation handling)
  async function deleteProduct(rowKey: string) {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      body: JSON.stringify({
        user_id: userId,
        row_key: rowKey,
      }),
    });
    setState(!state);
    // ✅ Refresh cart context to update header count
    await refreshCart();
  }

  const totalQuantity = useMemo(() => {
    return Object.values(quantities).reduce((acc, curr) => acc + curr, 0);
  }, [quantities]);

  const totalSubtotal = useMemo(() => {
    return products.reduce((acc, item) => {
      const key = getRowKey(item);
      const q = quantities[key] ?? 1;

      // ✅ Use unit_price directly as the price per item
      const price = item.unit_price;
      if (price === 0 || isNaN(price)) return acc;

      return acc + (isNaN(price) ? 0 : price * q);
    }, 0);
  }, [products, quantities]);

  console.log("products:", products); 

  return (
    <Wrapper>
      <section className="px-12 my-16">
        <h1 className="font-bold text-2xl">Shopping Cart</h1>

        {loading ? (
          <div className="flex-col items-center flex mt-12">
            <p className="font-bold text-2xl">Loading cart...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="flex mt-2 gap-x-10">
            <div className="basis-[70%]">
              {products.map((item) => {
                const key = getRowKey(item);
                const q = quantities[key] ?? 1;

                // ✅ Use unit_price directly as the price per item
                const price = item.unit_price;
                const subtotal = price * q;

                const size = item.product_size ?? "—";
                const color = item.product_color ?? "—";

                return (
                  <div className="flex p-7 gap-x-8 border-b" key={key}>
                    <div className="h-48 w-44">
                      <Image
                        src={item.image_url}
                        height={500}
                        width={400}
                        className="h-full w-full object-cover rounded-lg"
                        alt={item.product_title}
                      />
                    </div>

                    <div className="w-full">
                      <div className="text-xl font-semibold flex items-start justify-between gap-4">
                        <div>
                          <div className="leading-tight">{item.product_title}</div>

                          {/* ✅ variants show */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Size: {size}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Color: {color}
                            </span>
                          </div>
                        </div>

                        <button onClick={() => deleteProduct(key)} aria-label="Remove item">
                          <Trash2 />
                        </button>
                      </div>

                        <h2 className="mt-4 text-gray-500 font-medium">{titleCase(item.product_category)}</h2>
 
                      <div className="mt-6 text-lg flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-md font-bold"> ${price.toFixed(2)}</span>
                        </div>

                        <section className="flex items-center gap-x-2">
                          <div
                            className="border rounded-full h-8 w-8 flex items-center justify-center bg-slate-200 text-2xl cursor-pointer select-none"
                            onClick={async () => {
                              const newQ = q - 1;
                              if (newQ >= 1) {
                                setQuantities((prev) => ({
                                  ...prev,
                                  [key]: newQ,
                                }));
                                // ✅ Update backend
                                await fetch("/api/cart", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    user_id: userId,
                                    row_key: key,
                                    product_quantity: newQ,
                                  }),
                                });
                                // ✅ Refresh cart context to update header count
                                await refreshCart();
                              }
                            }}
                          >
                            -
                          </div>

                          <span className="min-w-[20px] text-center">{q}</span>

                          <div
                            className="border rounded-full h-8 w-8 flex items-center justify-center bg-slate-200 text-xl cursor-pointer select-none"
                            onClick={async () => {
                              const newQ = q + 1;
                              setQuantities((prev) => ({
                                ...prev,
                                [key]: newQ,
                              }));
                              // ✅ Update backend
                              await fetch("/api/cart", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  user_id: userId,
                                  row_key: key,
                                  product_quantity: newQ,
                                }),
                              });
                              // ✅ Refresh cart context to update header count
                              await refreshCart();
                            }}
                          >
                            +
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 basis-[30%] p-9 space-y-7 h-fit rounded-lg">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="text-lg flex">Quantity: {totalQuantity} Products</div>
              <div className="text-lg">Sub Total: ${totalSubtotal.toFixed(2)}</div>

              <Button onClick={handleCheckout} className="text-white w-full py-3">
                Proceed To Checkout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-col items-center flex mt-12">
            <ShoppingBag height={120} width={120} />
            <p className="font-bold text-3xl mt-4 mb-9">Your shopping bag is empty</p>
          </div>
        )}
      </section>
    </Wrapper>
  );
}