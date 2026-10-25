import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const products = await db
      .collection("inventory_products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const serialized = products.map((product) => ({
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({ ok: true, products: serialized });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
