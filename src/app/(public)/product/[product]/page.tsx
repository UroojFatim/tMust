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

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

async function getProduct(slug: string): Promise<IProduct | null> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(
      `${baseUrl}/api/public/products/${slug}`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch product: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function page({ params }: { params: Promise<{ product: string }> }) {
  const resolvedParams = await params;
  const { product } = resolvedParams;
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
