/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { urlForImage } from "../../sanity/lib/image";
import Image from "next/image";

const titleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

const normalize = (v: string | null | undefined) =>
  (v ?? "").toString().trim().toLowerCase();

const ProductDetails = ({ foundData }: { foundData: any }) => {
  const [num, setNum] = useState(1);

  // ✅ dynamic variations
  const sizesFromSanity: string[] = useMemo(
    () => (Array.isArray(foundData?.sizes) ? foundData.sizes : []),
    [foundData?.sizes]
  );

  const colorsFromSanity: string[] = useMemo(
    () => (Array.isArray(foundData?.colors) ? foundData.colors : []),
    [foundData?.colors]
  );

  const hasSizes = sizesFromSanity.length > 0;
  const hasColors = colorsFromSanity.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // ✅ IMPORTANT: prefer refreshCart (badge count should come from backend)
  const { userId, refreshCart } = useCart();

  // ✅ build variant key so same product with different size/color becomes different row
  const rowKey = useMemo(() => {
    const pid = foundData?._id ?? "no-product";
    const size = hasSizes ? normalize(selectedSize) || "no-size" : "no-size";
    const color = hasColors ? normalize(selectedColor) || "no-color" : "no-color";
    return `${pid}__${size}__${color}`;
  }, [foundData?._id, selectedSize, selectedColor, hasSizes, hasColors]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please login first!", { autoClose: 3000, position: "top-center" });
      return;
    }

    // ✅ Only require what actually exists
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size!", { autoClose: 3000, position: "top-center" });
      return;
    }
    if (hasColors && !selectedColor) {
      toast.error("Please select a color!", { autoClose: 3000, position: "top-center" });
      return;
    }

    setIsLoading(true);

    try {
      const mainImageUrl =
        foundData?.images?.[0]?.asset ? urlForImage(foundData.images[0].asset).url() : null;

      // ✅ pass ALL useful attributes
      const payload = {
        user_id: userId,

        // product identity
        product_id: foundData?._id,
        product_title: foundData?.title ?? "",
        product_slug: foundData?.slug?.current ?? null,

        // pricing + quantity
        // NOTE: you’re currently sending totalPrice = price * qty
        // If you want easier logic later, also send unit_price.
        unit_price: Number(foundData?.price ?? 0),
        product_price: Number(foundData?.price ?? 0) * num,
        product_quantity: num,

        // variations
        product_size: hasSizes ? selectedSize : null,
        product_color: hasColors ? selectedColor : null,

        // ✅ unique key so backend can store separate rows
        row_key: rowKey,

        // product metadata
        product_category: foundData?.category ?? null,
        product_style: foundData?.style ?? null,

        // media
        image_url: mainImageUrl,

        // optional extra info (only if you have them in sanity)
        description: foundData?.description ?? null,
        // images: Array.isArray(foundData?.images)
        //   ? foundData.images
        //       .map((img: any) => (img?.asset ? urlForImage(img.asset).url() : null))
        //       .filter(Boolean)
        //   : [],
      };

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to add to cart");
      }

      // ✅ update header/badge from backend truth
      await refreshCart?.();

      // ✅ Get updated cart count after refresh
      const cartRes = await fetch(`/api/cart?user_id=${userId}`, { cache: "no-store" });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const cartItems = Array.isArray(cartData) ? cartData : [];
        const totalQty = cartItems.reduce((acc: number, item: any) => {
          return acc + (item.product_quantity ?? 1);
        }, 0);

        toast.success(`Added to cart! Total items: ${totalQty}`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.success("Product added to cart!", {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add product to cart!",
        { autoClose: 3000, position: "top-center" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!foundData) return null;

  return (
    <div className="flex mt-32">
      <div key={foundData._id}>
        {/* First Row */}
        <div className="flex">
          {/* Thumbnails */}
          <div className="grid grid-cols-1 mr-8 gap-2">
            {foundData?.images?.map((_imageObj: any, index: number) => (
              <Image
                key={_imageObj?.asset?._id || index}
                src={urlForImage(_imageObj.asset).url()}
                alt={_imageObj.alt || foundData.title || "Product image"}
                width={100}
                height={100}
                className="rounded"
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="w-[600px]">
            <Image
              src={urlForImage(foundData.images[0].asset).url()}
              height={500}
              width={400}
              className="h-full w-full object-cover rounded"
              alt={foundData.title}
            />
          </div>

          {/* Details */}
          <div className="mt-16 ml-5">
            <h1 className="text-2xl leading-8 -tracking-tighter">{foundData.title}</h1>

            {foundData?.category && (
              <h2 className="text-lg text-gray-500 font-semibold opacity-50">
                {titleCase(foundData.category)}
              </h2>
            )}

            {/* ✅ SIZE SELECTOR */}
            {hasSizes && (
              <>
                <h3 className="font-bold mt-6">SELECT SIZE</h3>
                <div className="flex font-bold gap-x-4 mt-5 text-gray-800 gap-2 flex-wrap">
                  {sizesFromSanity.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded transition-all ${
                        selectedSize === size
                          ? "bg-[#212121] text-white border-[#212121]"
                          : "bg-white text-gray-800 border-gray-300 hover:border-[#212121]"
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ✅ COLOR SELECTOR */}
            {hasColors && (
              <>
                <h3 className="font-bold mt-6">SELECT COLOR</h3>
                <div className="flex font-bold gap-x-4 mt-5 text-gray-800 gap-2 flex-wrap">
                  {colorsFromSanity.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded transition-all ${
                        selectedColor === color
                          ? "bg-[#212121] text-white border-[#212121]"
                          : "bg-white text-gray-800 border-gray-300 hover:border-[#212121]"
                      }`}
                    >
                      {titleCase(color)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Quantity */}
            <div className="flex align-middle mt-10">
              <h3 className="font-bold mr-6">Quantity: </h3>
              <section className="flex items-center gap-x-2">
                <button
                  type="button"
                  className="border rounded-full h-8 w-8 text-center bg-slate-200 text-2xl"
                  onClick={() => setNum((n) => (n <= 1 ? 1 : n - 1))}
                >
                  -
                </button>
                <span>{num}</span>
                <button
                  type="button"
                  className="border rounded-full h-8 w-8 text-center bg-slate-200 text-xl"
                  onClick={() => setNum((n) => n + 1)}
                >
                  +
                </button>
              </section>
            </div>

            {/* Add to cart */}
            <div className="flex mt-8 gap-x-5 items-center">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="bg-[#212121] text-white font-bold py-6 px-30 gap-x-3 text-sm w-[45%] border-2 border-solid shadow-md lg:max-w-[250px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-6 w-6" color="#ffffff" />
                <div>{isLoading ? "Adding..." : "Add to Cart"}</div>
              </Button>

              <ToastContainer />

              <div className="font-bold text-2xl">
                ${Number(foundData.price || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="my-20 space-y-10 relative">
          <div className="border-b-4 h-24">
            <h3 className="font-extrabold text-[7.5rem] leading-[151px] text-paragraph opacity-[0.06] w-1/4 -z-10 absolute top-0">
              Overview
            </h3>
            <h2 className="tracking-wider font-extrabold text-xl mt-1">Product Information</h2>
          </div>

          <div className="flex">
            <div className="basis-1/3 tracking-wider font-bold text-grey">PRODUCT DETAILS</div>
            <div className="basis-2/3 text-justify tracking-wider text-lg font-light">
              {foundData.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;