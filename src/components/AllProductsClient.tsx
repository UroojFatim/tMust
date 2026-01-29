"use client";

import { useMemo, useState } from "react";
import ProductCart from "@/components/ProductCart";
import FiltersSidebar from "@/components/FiltersSidebar";

export default function AllProductsClient({ products }: { products: any[] }) {
  const [price, setPrice] = useState([0, 500]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    console.log("Products:", products); console.log("First product images:", products[0]?.images)
    return products.filter((p) => {
      const matchPrice =
        p.price >= price[0] && p.price <= price[1];

      const matchSize =
        sizes.length === 0 ||
        sizes.some((s) => p.sizes?.includes(s));

      const matchColor =
        colors.length === 0 ||
        colors.some((c) => p.colors?.includes(c));

      const matchStyle =
        styles.length === 0 || styles.includes(p.style);

      return matchPrice && matchSize && matchColor && matchStyle;
    });
  }, [products, price, sizes, colors, styles]);

  return (
    <div className="flex gap-10">
      {/* LEFT FILTERS */}
      <FiltersSidebar
        price={price}
        setPrice={setPrice}
        sizes={sizes}
        setSizes={setSizes}
        colors={colors}
        setColors={setColors}
        styles={styles}
        setStyles={setStyles}
        total={filteredProducts.length}
      />

      {/* RIGHT PRODUCTS */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">All Products</h2>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <ProductCart
              key={product._id}
              item={product}
              linkTo={`/product/${product.slug.current}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
