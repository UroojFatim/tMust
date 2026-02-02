import Wrapper from "@/components/shared/Wrapper";
import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";

interface IVariant {
  color: string;
  images: Array<{ url: string; alt: string }>;
  sizes: Array<{
    size: string;
    quantity: number;
    priceDelta: number;
    sku: string;
    barcode: string;
    label: string;
  }>;
}

interface IProduct {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  productCode: string;
  collection: string;
  collectionSlug: string;
  style: string;
  styleSlug: string;
  tags: string[];
  details: Array<{
    key: string;
    valueHtml: string;
  }>;
  variants: IVariant[];
  createdAt: string;
}

async function getProduct(slug: string): Promise<IProduct | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/products/${slug}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/products`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const products = data.products || [];
    
    return products.map((item: any) => ({
      product: item.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function page({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  const foundData = await getProduct(product);

  if (!foundData) {
    notFound();
  }

  return (
    <Wrapper>
      <ProductDetails foundData={foundData} />
    </Wrapper>
  );
}
