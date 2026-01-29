"use client";

import { useMemo, useState } from "react";
import ProductCart from "@/components/ProductCart";
import FiltersSidebar from "@/components/FiltersSidebar";
import Link from "next/link";

export default function AllProductsClient({ products }: { products: any[] }) {
  const [price, setPrice] = useState([0, 500]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    console.log(products)
    return products.filter((p) => {
      // Extract variants data
      const variants = p.variants || [];
      
      // Get all colors from variants
      const productColors = variants.map((v: any) => v.color).filter(Boolean);
      
      // Get all sizes from all variants
      const productSizes = variants
        .flatMap((v: any) => (v.sizes || []).map((s: any) => s.size))
        .filter(Boolean);

      const matchPrice =
        p.basePrice >= price[0] && p.basePrice <= price[1];

      const matchSize =
        sizes.length === 0 ||
        sizes.some((s) => productSizes.includes(s));

      const matchColor =
        colors.length === 0 ||
        colors.some((c) => productColors.includes(c));

      const matchStyle =
        styles.length === 0 || styles.includes(p.styleName);

      return matchPrice && matchSize && matchColor && matchStyle;
    });
  }, [products, price, sizes, colors, styles]);

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

        {/* Display products grouped by style */}
        <div className="space-y-12">
          {Object.entries(groupedProducts).map(([styleName, styleProducts]) => (
            <div key={styleName}>
              {/* Style Heading */}
              <div className="mb-6 pb-3 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                  {styleName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {styleProducts.length} {styleProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {styleProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                  >
                    <ProductCart item={product} />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}