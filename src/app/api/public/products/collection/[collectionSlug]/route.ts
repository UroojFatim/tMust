import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { collectionSlug: string } }
) {
  try {
    const { collectionSlug } = params;
    
    console.log("Fetching products for collection slug:", collectionSlug);
    
    const db = await getDatabase();
    
    // First, let's see all products to debug
    const allProducts = await db
      .collection("inventory_products")
      .find({})
      .limit(10)
      .toArray();
    
    const debugInfo = allProducts.map(p => ({
      title: p.title,
      collection: p.collection,
      collectionSlug: p.collectionSlug
    }));
    
    console.log("Sample products from DB:", debugInfo);
    
    // Try multiple query variations to find a match
    const products = await db
      .collection("inventory_products")
      .find({ 
        $or: [
          { collectionSlug },
          { collectionSlug: collectionSlug.toLowerCase() },
          { collection: collectionSlug },
          { collection: new RegExp(collectionSlug, 'i') }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${products.length} products for collection: ${collectionSlug}`);

    const serialized = products.map((product) => ({
      _id: product._id?.toString(),
      id: product._id?.toString(),
      title: product.title,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      productCode: product.productCode,
      collection: product.collection,
      collectionSlug: product.collectionSlug,
      style: product.style,
      styleSlug: product.styleSlug,
      variants: product.variants,
      images: product.images,
      createdAt: product.createdAt,
    }));

    return NextResponse.json({ 
      ok: true, 
      products: serialized, 
      count: serialized.length,
      debug: debugInfo // Return debug info to see in browser
    });
  } catch (error) {
    console.error("Error fetching products by collection:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
