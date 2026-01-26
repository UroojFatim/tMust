/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { urlForImage } from "../../sanity/lib/image";
import Image from "next/image";

const ProductDetails = ({ foundData }: { foundData: any }) => {
  const [num, setNum] = useState(1);
  const { setCartItemCount, userId } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL"];

  const handleAddToCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          product_id: foundData?._id,
          product_title: foundData?.title,
          product_price: foundData?.price ? foundData.price * num : 0,
          product_quantity: num,
          image_url: urlForImage(foundData.images[0].asset).url(),
          product_category: foundData?.category,
        }),
      });

      // Update the cart item count
      setCartItemCount((prevCount: number) => prevCount + 1);
      setShowNotification(true);

      // Use toast to show a notification
      toast.success("Product added to cart!", {
        autoClose: 3000, // Close the notification after 3 seconds
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex mt-16">
      {foundData && (
        <div key={foundData._id}>
          {/* First Row */}
          <div className="flex">
            {/* 1st Div */}
            <div className="grid grid-cols-1 mr-8">
              {foundData.images.map((_imageObj: any, index: number) => {
                return (
                  <Image
                    key={_imageObj.asset._id || index}
                    src={urlForImage(_imageObj.asset).url()}
                    alt={_imageObj.alt || foundData.title || "Product image"}
                    width={100}
                    height={100}
                  />
                );
              })}
            </div>

            {/* 2nd Div */}

            <div className="w-[600px]">
              <Image
                src={urlForImage(foundData.images[0].asset).url()}
                height={500}
                width={400}
                className="h-full w-full object-cover"
                alt={foundData.title}
              />
            </div>

            {/* 3rd Div */}

            <div className="mt-16 ml-5">
              <h1 className="text-2xl leading-8 -tracking-tighter">
                {foundData.title}
              </h1>
              <h2 className="text-lg text-gray-500 font-semibold opacity-50">
                {foundData.category}
              </h2>
              <h3 className="font-bold mt-6">SELECT SIZE</h3>
              <span className="flex font-bold justify-between ml-4 mt-5 text-gray-800 opacity-80">
                {sizes.map((size) => (
                  <button key={size}>{size}</button>
                ))}
              </span>
              <div className="flex align-middle mt-10">
                <h3 className="font-bold mr-6">Quantity: </h3>
                <section className="flex items-center gap-x-2">
                  <div
                    className="border rounded-full h-8 w-8 text-center bg-slate-200 text-2xl"
                    onClick={() => {
                      setNum(num <= 1 ? 1 : num - 1);
                    }}
                  >
                    -
                  </div>
                  <span>{num}</span>
                  <div
                    className="border rounded-full h-8 w-8 text-center bg-slate-200 text-xl"
                    onClick={() => {
                      setNum(num + 1);
                    }}
                  >
                    +
                  </div>
                </section>
              </div>
              <div className="flex mt-8 gap-x-5 items-center">
                <Button
                  onClick={handleAddToCart}
                  className=" bg-[#212121] text-white font-bold py-6 px-30 gap-x-3 text-sm w-[45%] border-2  border-solid shadow-md lg:max-w-[250px]"
                >
                  <ShoppingCart className="h-6 w-6" color="#ffffff" />
                  <div>Add to Cart</div>
                </Button>
                <ToastContainer />
                {/* {showNotification && (
                  <div className="notification absolute top-0 left-0 bg-green-500 text-white p-2 rounded-md shadow-md">
                    Product added to cart!
                  </div>
                )} */}
                <div className="font-bold text-2xl">
                  ${foundData.price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}

          <div className="my-20 space-y-10 relative">
            <div className="border-b-4 h-24">
              <h3
                className="font-extrabold text-[7.5rem] leading-[151px] text-paragraph opacity-[0.06] w-1/4
           -z-10 absolute top-0"
              >
                Overview
              </h3>
              <h2 className="tracking-wider font-extrabold text-xl mt-1">
                Product Information
              </h2>
            </div>

            <div className="flex">
              <div className="basis-1/3 tracking-wider font-bold text-grey">
                PRODUCT DETAILS
              </div>
              <div className="basis-2/3 text-justify tracking-wider text-lg font-light">
                {foundData.description}
              </div>
            </div>

            <div className="flex">
              <div className="basis-1/3 tracking-wider font-bold text-grey">
                PRODUCT CARE
              </div>
              <ul className="basis-2/3 list-disc ml-7 font-bold text-justify tracking-wider text-lg">
                <li>Lorem ipsum dolor sit amet</li>
                <li>consectetur adipiscing elit</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
