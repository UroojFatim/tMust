/* eslint-disable react/jsx-key */
"use client";

import getStripePromise from "@/lib/stripe";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import Wrapper from "@/components/shared/Wrapper";
import LoadingSpinner from "@/components/LoadingSpinner";
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [state, setState] = useState(false);

  const { userId, refreshCart } = useCart();

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getRowKey = (item: CartItem) => {
    if (item.cart_item_id) return item.cart_item_id;

    const size = (item.product_size ?? item.size ?? "no-size") || "no-size";
    const color =
      (item.product_color ?? item.color ?? "no-color") || "no-color";

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
        const res = await fetch(`/api/cart?user_id=${userId}`, {
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error(`API error: ${res.status} ${res.statusText}`);

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
    try {
      setCheckoutLoading(true);

      const stripePromise = await getStripePromise();
      if (!stripePromise) {
        alert(
          "Payment system not configured. Please add valid Stripe keys to .env",
        );
        setCheckoutLoading(false);
        return;
      }

      console.log("Sending checkout request with products:", products);
      const response = await fetch("/api/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-cache",
        body: JSON.stringify({
          products,
          session_user_id: userId,
          quantities,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Stripe session response:", data);

      if (data.session?.id) {
        console.log(
          "Redirecting to Stripe checkout with session:",
          data.session.id,
        );
        await stripePromise.redirectToCheckout({ sessionId: data.session.id });
      } else if (data.error) {
        throw new Error(
          data.error.message || "Failed to create checkout session",
        );
      } else {
        throw new Error("No session ID returned from server");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        `Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setCheckoutLoading(false);
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
      <section className="px-2 my-28 lg:my-32">
        <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
          Shopping Cart
        </h1>

        {loading ? (
          <div className="mt-8 sm:mt-12">
            <LoadingSpinner />
          </div>
        ) : products.length > 0 ? (
          <div className="flex flex-col lg:flex-row mt-4 sm:mt-6 lg:mt-8 gap-6 lg:gap-10">
            <div className="w-full lg:basis-[70%]">
              {products.map((item) => {
                const key = getRowKey(item);
                const q = quantities[key] ?? 1;

                // ✅ Use unit_price directly as the price per item
                const price = item.unit_price;
                const subtotal = price * q;

                const size = item.product_size ?? "—";
                const color = item.product_color ?? "—";

                return (
                  <div
                    className="flex flex-col sm:flex-row p-4 sm:p-6 lg:p-7 gap-4 sm:gap-6 lg:gap-8 border-b"
                    key={key}
                  >
                    <div className="relative w-full sm:w-40 md:w-44 lg:w-48 aspect-[3/4]">
                      <Image
                        src={item.image_url}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 160px, 192px"
                        className="rounded-lg object-cover"
                        alt={item.product_title}
                      />
                    </div>

                    <div className="w-full">
                      <div className="text-base sm:text-lg lg:text-xl font-semibold flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="leading-tight line-clamp-2">
                            {item.product_title}
                          </div>

                          {/* ✅ variants show */}
                          <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Size: {size}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Color: {color}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteProduct(key)}
                          aria-label="Remove item"
                          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition"
                        >
                          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                      </div>

                      <h2 className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-500 font-medium">
                        {titleCase(item.product_category)}
                      </h2>

                      <div className="mt-2 sm:mt-4 text-base sm:text-lg flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xl font-bold">
                            {" "}
                            ${price}
                          </span>
                        </div>

                        <section className="flex items-center gap-x-2 border rounded-lg p-1 bg-gray-50">
                          <div
                            className="border rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-lg sm:text-xl cursor-pointer select-none transition"
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
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
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

                          <span className="min-w-[24px] sm:min-w-[28px] text-center font-semibold text-sm sm:text-base">
                            {q}
                          </span>

                          <div
                            className="border rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-lg sm:text-xl cursor-pointer select-none transition"
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

            <div className="bg-blue-50 w-full lg:basis-[30%] p-6 sm:p-7 lg:p-9 space-y-4 sm:space-y-6 lg:space-y-7 h-fit rounded-lg sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold">Order Summary</h2>
              <div className="text-base sm:text-lg flex">
                Quantity:{" "}
                <span className="font-semibold ml-1">{totalQuantity}</span>
              </div>
              <div className="text-base sm:text-lg">
                Sub Total:{" "}
                <span className="font-bold">${totalSubtotal}</span>
              </div>

              <Button
                // onClick={handleCheckout}
                // disabled={checkoutLoading}
                className="text-white w-full py-3 text-sm sm:text-base"
              >
                {/* {checkoutLoading ? "Processing..." : "Proceed To Checkout"} */}
                Proceed To Checkout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-col items-center flex mt-8 sm:mt-12 text-center px-4">
            <ShoppingBag className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 text-gray-400" />
            <p className="font-bold text-xl sm:text-2xl lg:text-3xl mt-4 mb-6 sm:mb-9">
              Your shopping bag is empty
            </p>
          </div>
        )}
      </section>
    </Wrapper>
  );
}
