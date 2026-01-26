/* eslint-disable react/jsx-key */

"use client";
import getStripePromise from "@/lib/stripe";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Wrapper from "@/components/shared/Wrapper";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartContext";

export default function CartItems() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(false);
  const { userId } = useCart();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>(
    {}
  );

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetch(`/api/cart?user_id=${userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Cart data fetched:", data);
          const cartItems = Array.isArray(data) ? data : [];
          setProducts(cartItems);

          // Initialize quantities state with fetched data
          const initialQuantities: { [productId: string]: number } = {};
          cartItems.forEach((item: any) => {
            initialQuantities[item.product_id] = item.product_quantity;
          });
          setQuantities(initialQuantities);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
          setProducts([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId, state]);

  const handleCheckout = async () => {
    try {
      const stripePromise = await getStripePromise();
      
      if (!stripePromise) {
        console.error(
          "❌ Stripe not initialized. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local"
        );
        alert(
          "Payment system not configured. Please add valid Stripe keys to .env.local"
        );
        return;
      }

      console.log("[Checkout] Creating Stripe session...");
      const response = await fetch("/api/stripe-session/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-cache",
        body: JSON.stringify({
          products: products,
          session_user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[Checkout] Stripe session response:", data);

      if (data.session?.id) {
        console.log("[Checkout] Redirecting to Stripe checkout...");
        await stripePromise.redirectToCheckout({ sessionId: data.session.id });
      } else {
        console.error("[Checkout] No session ID in response:", data);
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("[Checkout] Error:", error);
      alert(`Checkout error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  async function deleteProduct(product_title: any) {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      body: JSON.stringify({
        user_id: userId,
        product_title: product_title,
      }),
    });
    setState(!state);
  }

  // Calculate the total quantity and subtotal
  let totalQuantity = 0;
  let totalSubtotal = 0;

  if (products && Array.isArray(products) && products.length > 0) {
    totalQuantity = Object.values(quantities).reduce(
      (acc, curr) => acc + curr,
      0
    );
    console.log("Cart products:", products);
    totalSubtotal = products.reduce(
      (
        acc: number,
        item: {
          product_price: number;
          product_quantity: number;
          product_id: string | number;
        }
      ) => {
        const pricePerItem = item.product_price / item.product_quantity;
        const itemSubtotal = pricePerItem * (quantities[item.product_id] || 1);
        return acc + itemSubtotal;
      },
      0
    );
  }

  return (
    <Wrapper>
      <section className="px-12 my-16">
        <h1 className="font-bold text-2xl">Shopping Cart</h1>
        
        {loading ? (
          <div className="flex-col items-center flex mt-12">
            <p className="font-bold text-2xl">Loading cart...</p>
          </div>
        ) : products.length > 0 ? (
          <div className=" flex mt-2 gap-x-10">
            {/* Cart Items */}

            <div className="basis-[70%]">
              <div>
                {products.map((item: any) => (
                  <div className=" flex p-7 gap-x-8" key={item.product_id}>
                    <div className=" h-48 w-44 ">
                      <Image
                        src={item.image_url}
                        height={500}
                        width={400}
                        className="h-full w-full object-cover rounded-lg"
                        alt={item.product_title}
                      />
                    </div>
                    <div className="font-bold w-full ">
                      <div className="text-xl font-light flex items-center justify-between">
                        <span>{item.product_title}</span>
                        <button
                          onClick={() => deleteProduct(item.product_title)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                      <h2 className="mt-5 text-gray-500">
                        {item.product_category}
                      </h2>
                      <div className="mt-4">Delivery Estimation</div>
                      <div className="mt-4 text-yellow-400">
                        5 Working Days
                      </div>
                      <div className="mt-4 text-lg flex items-center justify-between">
                        <span>
                          $
                          {(item.product_price / item.product_quantity) *
                            (quantities[item.product_id] || 1)}
                        </span>
                        <div className="font-light">
                          <section className="flex items-center gap-x-2">
                            <div
                              className="border rounded-full h-8 w-8 text-center bg-slate-200 text-2xl cursor-pointer"
                              onClick={() => {
                                const newQuantity =
                                  (quantities[item.product_id] || 1) - 1;
                                setQuantities((prevQuantities) => ({
                                  ...prevQuantities,
                                  [item.product_id]:
                                    newQuantity >= 1 ? newQuantity : 1,
                                }));
                              }}
                            >
                              -
                            </div>
                            <span>{quantities[item.product_id] || 1}</span>
                            <div
                              className="border rounded-full h-8 w-8 text-center bg-slate-200 text-xl cursor-pointer"
                              onClick={() => {
                                const newQuantity =
                                  (quantities[item.product_id] || 1) + 1;
                                setQuantities((prevQuantities) => ({
                                  ...prevQuantities,
                                  [item.product_id]: newQuantity,
                                }));
                              }}
                            >
                              +
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}

            <div className="bg-blue-50 basis-[30%] p-9 space-y-7">
              <>
                <h2 className="text-xl font-bold">Order Summary</h2>
                <div className="text-lg flex">
                  Quantity: {totalQuantity} Products
                </div>
                <div className="text-lg">Sub Total: ${totalSubtotal}</div>
                <Button
                  onClick={handleCheckout}
                  className="text-white w-full py-3"
                >
                  Proceed To Checkout
                </Button>
              </>
            </div>
          </div>
        ) : (
          <div className="flex-col items-center flex mt-12">
            <ShoppingBag height={120} width={120} />
            <p className="font-bold text-3xl mt-4 mb-9">
              Your shopping bag is empty
            </p>
          </div>
        )}
      </section>
    </Wrapper>
  );
}
