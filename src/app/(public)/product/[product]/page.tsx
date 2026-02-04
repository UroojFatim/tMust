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
    const { getDatabase } = await import("@/lib/mongodb");
    const db = await getDatabase();
    const product = await db
      .collection("inventory_products")
      .findOne({ slug });

    if (!product) {
      console.error(`Product not found: ${slug}`);
      return null;
    }

    return {
      _id: product._id?.toString(),
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      basePrice: product.basePrice,
      productCode: product.productCode,
      collection: product.collection,
      collectionSlug: product.collectionSlug,
      style: product.style,
      styleSlug: product.styleSlug,
      tags: product.tags,
      details: product.details,
      variants: product.variants,
      createdAt: product.createdAt,
    };
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
