import FetchData from "../../../../sanity/FetchData";
import Wrapper from "@/components/shared/Wrapper";
import ProductDetails from "@/components/ProductDetails";

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

export async function generateStaticParams() {
  const data = await FetchData();
  return data.map((item: any) => ({
    product: item.slug.current,
  }));
}

export default async function page({ params }: { params: any }) {
  const data = await FetchData();
  const foundData = data.find(
    (item: IProduct) => item.slug.current == params.product
  );

  return (
    <Wrapper>
      <ProductDetails foundData={foundData} />
    </Wrapper>
  );
}
