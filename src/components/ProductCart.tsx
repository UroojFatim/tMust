import React, { useState } from "react";
import Image from "next/image";
import { urlForImage } from "../../sanity/lib/image";
import { FC } from "react";
import Link from "next/link";

const ProductCart: FC<{ item: any }> = ({ item }) => {
  return (
    // <Link href={`/products/${item._id}`}>
      <div className="hover:scale-110 transition-transform duration-500">
        <div className="h-[290px] w-[270px] lg:h-[280px] lg:w-[260px] xl:h-[270px] xl:w-[250px]">
           <Image
            src={urlForImage(item.images[0]).url()}
            alt="Product"
            height={500}
            width={400}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="font-semibold lg:space-y-1 text-lg">
          <h2 className="mt-3">{item.title}</h2>
          <h5 className="text-[#888]">{item.category}</h5>
          <h1>${item.price}</h1>
        </div>
      </div>
    // </Link>
  );
};

export default ProductCart;
function useShoppingCart(): {
  addItem: any;
  incrementItem: any;
  cartDeatils: any;
} {
  throw new Error("Function not implemented.");
}
