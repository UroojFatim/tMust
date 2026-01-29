// app/all-products/page.tsx
import FetchData from "../../../sanity/FetchData";
import AllProductsClient from "@/components/AllProductsClient";
import Wrapper from "@/components/shared/Wrapper";

export default async function Page() {
  const productData = await FetchData();

  return (
    <Wrapper>
      <section className="py-8">
        <AllProductsClient products={productData} />
      </section>
    </Wrapper>
  );
}