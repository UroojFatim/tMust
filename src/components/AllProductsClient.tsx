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
    console.log("Products:", products);
    console.log("First product images:", products[0]?.images);
    return products.filter((p) => {
      // Extract variants data
      const variants = p.variants || [];

      // Get all colors from variants (lowercase for comparison)
      const productColors = variants
        .map((v: any) => v.color?.toLowerCase())
        .filter(Boolean);

      // Get all sizes from all variants (lowercase for comparison)
      const productSizes = variants
        .flatMap((v: any) =>
          (v.sizes || []).map((s: any) => s.size?.toLowerCase()),
        )
        .filter(Boolean);

      const matchPrice =
        price[1] === null ||
        (p.basePrice >= price[0] && p.basePrice <= price[1]);

      const matchSize =
        sizes.length === 0 ||
        sizes.some((s) => productSizes.includes(s.toLowerCase()));

      const matchColor =
        colors.length === 0 ||
        colors.some((c) => productColors.includes(c.toLowerCase()));

      return matchPrice && matchSize && matchColor;
    });
  }, [products, price, sizes, colors]);

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
        {/* Display all products in a single grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            {filteredProducts.map((product) => (
              <ProductCart
                key={product._id}
                item={product}
                linkTo={`/product/${product.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-16 lg:py-20">
            <p className="text-sm sm:text-base lg:text-lg text-gray-500">
              No products found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
