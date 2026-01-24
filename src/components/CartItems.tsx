/* eslint-disable react/jsx-key */

"use client";
import getStripePromise from "@/lib/stripe";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Wrapper from "@/components/shared/Wrapper";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function CartItems() {
  const [products, setProducts] = useState<any>(null);
  const [state, setState] = useState(false);
  const { isSignedIn } = useAuth();
  const { userId } = useAuth();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>(
    {}
  );

  useEffect(() => {
    fetch(`api/cart?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);

        // Initialize quantities state with fetched data
        const initialQuantities: { [productId: string]: number } = {};
        data.forEach((item: any) => {
          initialQuantities[item.product_id] = item.product_quantity;
        });
        setQuantities(initialQuantities);
      });
  }, [isSignedIn, userId, state]);

  const handleCheckout = async () => {
    const stripePromise = await getStripePromise();
    const response = await fetch("api/stripe-session/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify({
        products: products,
      }),
    });
    const data = await response.json();
    if (data.session) {
      stripePromise?.redirectToCheckout({ sessionId: data.session.id });
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

  if (products) {
    totalQuantity = Object.values(quantities).reduce(
      (acc, curr) => acc + curr,
      0
    );
    console.log("Quantities:", products);
    totalSubtotal = products?.reduce(
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
        {totalQuantity != 0 ? (
          <div className=" flex mt-2 gap-x-10">
            {/* Cart Items */}

            <div className="basis-[70%]">
              {isSignedIn ? (
                <div>
                  {products?.map((item: any) => (
                    <div className=" flex p-7 gap-x-8">
                      <div className=" h-48 w-44 ">
                        <Image
                          src={item.image_url} // Use the image URL here
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
              ) : (
                <p>Please Login In</p>
              )}
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
