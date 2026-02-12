"use client";

import { useMemo, useState } from "react";
import ProductCart from "@/components/ProductCart";
import FiltersTopBar from "@/components/FiltersSidebar";

export default function AllProductsClient({
  products,
  showFilters = true,
}: {
  products: any[];
  showFilters?: boolean;
}) {
  const [price, setPrice] = useState<[number, number | null]>([0, null]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    console.log("Products:", products); console.log("First product images:", products[0]?.images)
    return products.filter((p) => {
      // Extract variants data
      const variants = p.variants || [];
      
      // Get all colors from variants (lowercase for comparison)
      const productColors = variants
        .map((v: any) => v.color?.toLowerCase())
        .filter(Boolean);
      
      // Get all sizes from all variants (lowercase for comparison)
      const productSizes = variants
        .flatMap((v: any) => (v.sizes || []).map((s: any) => s.size?.toLowerCase()))
        .filter(Boolean);

      const matchPrice =
        price[1] === null || (p.basePrice >= price[0] && p.basePrice <= price[1]);

      const matchSize =
        sizes.length === 0 ||
        sizes.some((s) => productSizes.includes(s.toLowerCase()));

      const matchColor =
        colors.length === 0 ||
        colors.some((c) => productColors.includes(c.toLowerCase()));

      return matchPrice && matchSize && matchColor;
    });
  }, [products, price, sizes, colors]);

  // Group products by style
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    filteredProducts.forEach((product) => {
      const styleName = product.styleName || "Uncategorized";
      if (!groups[styleName]) {
        groups[styleName] = [];
      }
      groups[styleName].push(product);
    });
    
    return groups;
  }, [filteredProducts]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
      {showFilters ? (
        <FiltersTopBar
          price={price}
          setPrice={setPrice}
          sizes={sizes}
          setSizes={setSizes}
          colors={colors}
          setColors={setColors}
          total={filteredProducts.length}
        />
      ) : null}

      <div className="flex-1 w-full">
        {/* Display products grouped by style */}
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          {Object.entries(groupedProducts).map(([styleName, styleProducts]) => (
            <div key={styleName}>
              {/* Style Heading */}
              <div className="flex justify-between items-center w-full mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-gray-200">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  {styleName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {styleProducts.length} {styleProducts.length === 1 ? "product" : "products"}
                </p>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                {styleProducts.map((product) => (
                  <ProductCart
                    key={product._id}
                    item={product}
                    linkTo={`/product/${product.slug}`}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 sm:py-16 lg:py-20">
              <p className="text-sm sm:text-base lg:text-lg text-gray-500">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
