import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";
import { getDatabase } from "@/lib/mongodb";

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
  
  const db = await getDatabase();
  const products = await db
    .collection("inventory_products")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const serialized = products.map((product: any) => ({
    _id: product._id?.toString(),
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    productCode: product.productCode,
    collection: product.collection,
    collectionSlug: product.collectionSlug,
    style: product.style,
    styleSlug: product.styleSlug,
    tags: product.tags,
    details: product.details,
    purchasePrice: product.purchasePrice,
    variants: product.variants,
    images: product.images,
    category: product.category,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

  const filtered = serialized.filter((item: any) => item.category === category);

  return (
    <Wrapper>
      <section className="py-32">
        <AllProductsClient products={filtered} />
      </section>
    </Wrapper>
  );
}