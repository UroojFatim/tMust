import React from "react";
import FetchData from "../../../../sanity/FetchData";
import ProductCart from "@/components/ProductCart";
import Link from "next/link";

interface IProductImage {
  _type: string;
  _key: string;
  asset: {
    _ref: string;
    url: string;
  };
}

interface IProduct {
  _type: string;
  _id: string;
  slug: {
    _type: string;
    current: string;
  };
  title: string;
  description: string;
  price: number;
  images: IProductImage[];
  category: string;
  gender: string;
}

export default async function CategoryPage({ params }: { params: any }) {
  const data = await FetchData();

  const filteredData = data.filter(
    (item: IProduct) => item.gender === params.gender
  );

  if (filteredData.length === 0) {
    return <div className="text-center mt-20 font-bold">No Products found</div>;
  }

  return (
    <section>
      <div className="grid grid-cols-[repeat(1,auto)] lg:grid-cols-[repeat(3,auto)] xl:grid-cols-[repeat(4,auto)] gap-14 mt-10 justify-center">
        {filteredData.map((product: IProduct, index: number) => (
          <Link href={`/product/${product.slug.current}`} key={index}>
            <ProductCart item={product} key={product._id} />
          </Link>
        ))}
      </div>
    </section>
  );
}
