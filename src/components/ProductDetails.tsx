/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useMemo, useState, useEffect } from "react";
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

  // ✅ Extract data from MongoDB structure (variants)
  const variants = useMemo(() => foundData?.variants || [], [foundData?.variants]);

  // Get all unique sizes from all variants (only those with stock > 0)
  const sizesFromSanity: string[] = useMemo(() => {
    const sizeSet = new Set<string>();
    variants.forEach((variant: any) => {
      (variant.sizes || []).forEach((s: any) => {
        if (s.size && s.quantity > 0) sizeSet.add(s.size);
      });
    });
    return Array.from(sizeSet);
  }, [variants]);

  // Get all unique colors from variants (only those with at least one size in stock)
  const colorsFromSanity: string[] = useMemo(() => {
    return variants
      .filter((v: any) => {
        // Check if this variant has at least one size with stock
        return v.sizes?.some((s: any) => s.quantity > 0);
      })
      .map((v: any) => v.color)
      .filter(Boolean);
  }, [variants]);

  const hasSizes = sizesFromSanity.length > 0;
  const hasColors = colorsFromSanity.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizesFromSanity.length > 0 ? sizesFromSanity[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorsFromSanity.length > 0 ? colorsFromSanity[0] : null
  );

  const [isLoading, setIsLoading] = useState(false);

  // ✅ IMPORTANT: prefer refreshCart (badge count should come from backend)
  const { userId, refreshCart } = useCart();

  // Get current variant based on selected color
  const currentVariant = useMemo(() => {
    if (selectedColor) {
      return (
        variants.find(
          (v: any) => v.color?.toLowerCase() === selectedColor.toLowerCase(),
        ) || variants[0]
      );
    }
    return variants[0];
  }, [selectedColor, variants]);

  // Get all images from all variants for display
  const allProductImages = useMemo(() => {
    const images: any[] = [];
    variants.forEach((variant: any) => {
      if (variant.images && Array.isArray(variant.images)) {
        images.push(...variant.images);
      }
    });
    return images;
  }, [variants]);

  // Track selected image for main display
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get images from current variant
  const productImages = useMemo(() => {
    return currentVariant?.images || [];
  }, [currentVariant]);

  // ✅ build variant key so same product with different size/color becomes different row
  const rowKey = useMemo(() => {
    const pid = foundData?._id ?? "no-product";
    const size = hasSizes ? normalize(selectedSize) || "no-size" : "no-size";
    const color = hasColors
      ? normalize(selectedColor) || "no-color"
      : "no-color";
    return `${pid}__${size}__${color}`;
  }, [foundData?._id, selectedSize, selectedColor, hasSizes, hasColors]);

  // Get available stock for selected size and color
  const availableStock = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    
    const variant = variants.find(
      (v: any) => v.color?.toLowerCase() === selectedColor.toLowerCase()
    );
    
    if (!variant) return null;
    
    const sizeObj = variant.sizes?.find(
      (s: any) => s.size?.toLowerCase() === selectedSize.toLowerCase()
    );
    
    return sizeObj?.quantity ?? 0;
  }, [selectedSize, selectedColor, variants]);

  // Calculate final price based on selected size/color and their price adjustment
  const finalPrice = useMemo(() => {
    const basePrice = Number(foundData?.basePrice || 0);
    
    if (!selectedSize || !selectedColor) return basePrice;
    
    const variant = variants.find(
      (v: any) => v.color?.toLowerCase() === selectedColor.toLowerCase()
    );
    
    if (!variant) return basePrice;
    
    const sizeObj = variant.sizes?.find(
      (s: any) => s.size?.toLowerCase() === selectedSize.toLowerCase()
    );
    
    const priceDelta = Number(sizeObj?.priceDelta || 0);
    return basePrice + priceDelta;
  }, [selectedSize, selectedColor, variants, foundData?.basePrice]);

  // Update main image when color changes
  useEffect(() => {
    if (!selectedColor || !currentVariant?.images?.[0]) return;
    
    // Find the index of the first image of the current variant in allProductImages
    const firstVariantImage = currentVariant.images[0];
    const indexInAll = allProductImages.findIndex(
      (img: any) => img.url === firstVariantImage.url
    );
    
    if (indexInAll !== -1) {
      setSelectedImageIndex(indexInAll);
    }
  }, [selectedColor, currentVariant, allProductImages]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please login first!", {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    }

    // ✅ Only require what actually exists
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size!", {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    }
    if (hasColors && !selectedColor) {
      toast.error("Please select a color!", {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    }

    // Check stock availability
    if (availableStock !== null && availableStock === 0) {
      toast.error("This item is out of stock!", {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    }

    if (availableStock !== null && num > availableStock) {
      toast.error(`Only ${availableStock} items available in stock!`, {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const mainImageUrl = productImages[0]?.url || "";

      // ✅ pass ALL useful attributes
      const payload = {
        user_id: userId,

        // product identity
        product_id: foundData?._id,
        product_title: foundData?.title ?? "",
        product_slug: foundData?.slug ?? null,

        // pricing + quantity
        // NOTE: you’re currently sending totalPrice = price * qty
        // If you want easier logic later, also send unit_price.
        unit_price: finalPrice,
        product_price: finalPrice * num,
        product_quantity: num,

        // variations
        product_size: hasSizes ? selectedSize : null,
        product_color: hasColors ? selectedColor : null,

        // ✅ unique key so backend can store separate rows
        row_key: rowKey,

        // product metadata
        product_category: foundData?.collection ?? null,
        product_style: foundData?.style ?? null,

        // media
        image_url: mainImageUrl,

        // optional extra info
        description: foundData?.shortDescription ?? null,
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
      const cartRes = await fetch(`/api/cart?user_id=${userId}`, {
        cache: "no-store",
      });
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
        error instanceof Error
          ? error.message
          : "Failed to add product to cart!",
        { autoClose: 3000, position: "top-center" },
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!foundData) return null;

  return (
    <div className="flex pt-28 lg:pt-32 px-3 sm:px-4">
      <div key={foundData._id} className="w-full">
        {/* First Row */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Thumbnails */}
          <div className="flex lg:flex-col order-2 lg:order-1 gap-2 overflow-x-auto lg:overflow-y-auto lg:mr-4 lg:w-24">
            {allProductImages?.map((_imageObj: any, index: number) => (
              <button
                key={_imageObj?.url || index}
                onClick={() => setSelectedImageIndex(index)}
                className="flex-shrink-0"
              >
                <Image
                  src={_imageObj.url}
                  alt={_imageObj.alt || foundData.title || "Product image"}
                  width={100}
                  height={100}
                  className={`rounded transition-all w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover ${
                    selectedImageIndex === index
                      ? "ring-2 ring-gray-900 ring-offset-0"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="order-1 lg:order-2 w-full lg:flex-1">
            {allProductImages[selectedImageIndex]?.url ? (
              <Image
                src={allProductImages[selectedImageIndex].url}
                height={500}
                width={400}
                className="w-full h-auto object-contain rounded"
                alt={foundData.title}
              />
            ) : (
              <div className="h-64 sm:h-96 lg:h-[500px] w-full bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm sm:text-base">No Image Available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="order-3 w-full lg:flex-1 mt-4 sm:mt-6 lg:mt-0 lg:ml-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl leading-tight -tracking-tighter font-bold">
              {foundData.title}
            </h1>

            {foundData?.collection && (
              <h2 className="text-base sm:text-lg text-gray-500 font-semibold opacity-50 mt-1 sm:mt-2">
                {foundData.collection}
              </h2>
            )}

            {foundData?.style && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                Style: {foundData.style}
              </p>
            )}

            {/* ✅ SIZE SELECTOR */}
            {hasSizes && (
              <>
                <h3 className="font-bold mt-4 sm:mt-6 text-sm sm:text-base">SELECT SIZE</h3>
                <div className="flex font-bold gap-2 mt-3 sm:mt-4 text-gray-800 flex-wrap">
                  {sizesFromSanity.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-2 border-2 rounded text-xs sm:text-sm transition-all ${
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
                <h3 className="font-bold mt-4 sm:mt-6 text-sm sm:text-base">SELECT COLOR</h3>
                <div className="flex font-bold gap-2 mt-3 sm:mt-4 text-gray-800 flex-wrap">
                  {colorsFromSanity.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 sm:px-4 py-2 border-2 rounded text-xs sm:text-sm transition-all ${
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

            {/* Stock Availability - Urgency Message */}
            {selectedSize && selectedColor && availableStock !== null && availableStock > 0 && availableStock < 10 && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-300 rounded-lg shadow-sm">
                <p className="text-sm sm:text-base text-rose-800 font-semibold flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span>
                    Hurry! Only <span className="font-bold text-rose-900">{availableStock}</span> {availableStock === 1 ? 'piece' : 'pieces'} left in stock
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-rose-600 mt-1 ml-7">Limited stock - Order now before it's gone!</p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base">Quantity:</h3>
              <section className="flex items-center gap-x-2 border rounded-lg p-1 bg-gray-50">
                <button
                  type="button"
                  className="border rounded-full h-7 w-7 sm:h-8 sm:w-8 text-center bg-slate-200 hover:bg-slate-300 text-lg sm:text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setNum((n) => (n <= 1 ? 1 : n - 1))}
                  disabled={num <= 1}
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{num}</span>
                <button
                  type="button"
                  className="border rounded-full h-7 w-7 sm:h-8 sm:w-8 text-center bg-slate-200 hover:bg-slate-300 text-lg sm:text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (availableStock !== null && num >= availableStock) {
                      toast.warning(`Only ${availableStock} items available!`, {
                        autoClose: 2000,
                        position: "top-center",
                      });
                      return;
                    }
                    setNum((n) => n + 1);
                  }}
                  disabled={availableStock !== null && num >= availableStock}
                >
                  +
                </button>
              </section>
            </div>

            {/* Add to cart */}
            <div className="flex flex-col sm:flex-row mt-6 sm:mt-8 gap-3 sm:gap-4 items-start sm:items-center">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || (availableStock !== null && availableStock === 0)}
                className="bg-[#212121] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 gap-x-2 text-xs sm:text-sm w-full sm:w-auto lg:max-w-xs border-2 border-solid shadow-md disabled:opacity-70 disabled:cursor-not-allowed hover:bg-gray-900 transition"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" color="#ffffff" />
                <div>
                  {isLoading 
                    ? "Adding..." 
                    : availableStock === 0 
                    ? "Out of Stock" 
                    : "Add to Cart"}
                </div>
              </Button>

              <ToastContainer />

              <div className="font-bold text-xl sm:text-2xl lg:text-3xl">
                ${finalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="my-8 sm:my-12 md:my-16 lg:my-20 space-y-6 sm:space-y-8 lg:space-y-10 relative">
          <div className="border-b-4 pb-4 sm:pb-6">
            <h3 className="font-extrabold text-2xl sm:text-3xl lg:text-[7.5rem] leading-tight lg:leading-[151px] text-paragraph opacity-10 lg:opacity-[0.06] lg:w-1/4 -z-10 lg:absolute top-0">
              Overview
            </h3>
            <h2 className="tracking-wider font-extrabold text-base sm:text-lg lg:text-xl mt-1">
              Product Information
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="lg:basis-1/3 tracking-wider font-bold text-grey text-sm sm:text-base uppercase">
              PRODUCT DETAILS
            </div>
            <div className="lg:basis-2/3 text-justify tracking-wider text-sm sm:text-base lg:text-lg font-light text-gray-700">
              {foundData.shortDescription || "No description available"}
            </div>
          </div>

          {/* Product details from MongoDB */}
          {foundData.details && foundData.details.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {foundData.details.map((detail: any, idx: number) => (
                <div key={idx} className="flex flex-col lg:flex-row gap-3 lg:gap-8">
                  <div className="lg:basis-1/3 tracking-wider font-bold text-grey uppercase text-sm sm:text-base">
                    {detail.key}
                  </div>
                  <div
                    className="lg:basis-2/3 text-justify tracking-wider text-sm sm:text-base lg:text-lg font-light text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: detail.valueHtml }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
