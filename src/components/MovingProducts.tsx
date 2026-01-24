/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useState, useEffect } from "react";
import ProductCart from "../components/ProductCart";
import FetchData from "../../sanity/FetchData";
import Link from "next/link";

export default function MovingProducts() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 3; // Number of items to show at a time

  useEffect(() => {
    async function fetchData() {
      const productData = await FetchData();
      setData(productData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + itemsToShow) % data.length);
    }, 3000); // Change products every 3 second

    return () => clearTimeout(timer);
  }, [currentIndex, data.length, itemsToShow]);

  const displayedItems = data.slice(currentIndex, currentIndex + itemsToShow);

  return (
    <section className="">
      <div className="flex justify-center items-center flex-col gap-y-6 lg:grid lg:grid-cols-[repeat(3,auto)] lg:gap-x-16 2xl:gap-x-96 ">
        {displayedItems.map((item: any, index) => (
          <Link href={`/product/${item.slug.current}`} key={index}>
            <ProductCart item={item} key={index} />
          </Link>
        ))}
      </div>
    </section>
  );
}
