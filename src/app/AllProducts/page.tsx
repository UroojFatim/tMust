// app/all-products/page.tsx
import FetchData from "../../../sanity/FetchData";
import AllProductsClient from "@/components/AllProductsClient";

export default async function Page() {
  const productData = await FetchData();

  return (
    <section className="px-4 lg:px-10 py-8">
      <AllProductsClient products={productData} />
    </section>
  );
}