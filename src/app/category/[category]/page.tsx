import FetchData from "../../../../sanity/FetchData";
import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";

export async function generateStaticParams() {
  const categories = [
    "new_arrivals",
    "best_sellers",
    "casual_wears",
    "formal_wears",
    "fancy_party_wear",
    "traditional_wear",
  ];

  return categories.map((category) => ({ category }));
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = await FetchData();

  const filtered = data.filter((item: any) => item.category === category);

  return (
    <Wrapper>
      <AllProductsClient products={filtered} />
    </Wrapper>
  );
}