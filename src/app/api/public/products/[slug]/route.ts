import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const db = await getDatabase();
    const product = await db
      .collection("inventory_products")
      .findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { ok: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const serialized = {
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
      images: product.images,
      createdAt: product.createdAt,
    };

    return NextResponse.json({ ok: true, product: serialized });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
