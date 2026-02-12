// app/all-products/page.tsx
import AllProductsClient from "@/components/AllProductsClient";
import Wrapper from "@/components/shared/Wrapper";
import { getDatabase } from "@/lib/mongodb";

async function getAllProducts() {
  try {
    const db = await getDatabase();
    const products = await db
      .collection("inventory_products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize the products for client-side use
    const serialized = products.map((product) => ({
      _id: product._id?.toString(),
      id: product._id?.toString(),
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
      styleName: product.style, // Add styleName for grouping
      tags: product.tags,
      details: product.details,
      purchasePrice: product.purchasePrice,
      variants: product.variants,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return serialized;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Page() {
  const productData = await getAllProducts();

  return (
    <Wrapper>
      <section className="py-28 lg:py-32">
        <AllProductsClient products={productData} />
      </section>
    </Wrapper>
  );
}