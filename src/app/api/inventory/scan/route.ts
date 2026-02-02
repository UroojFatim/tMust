import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode")?.trim();

  if (!barcode) {
    return NextResponse.json(
      { ok: false, message: "Barcode is required" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  
  // Find product containing the barcode in any variant/size
  const product = await db.collection("inventory_products").findOne({
    "variants.sizes.barcode": barcode,
  });

  if (!product) {
    return NextResponse.json(
      { ok: false, message: "Product not found" },
      { status: 404 }
    );
  }

  // Find the specific variant and size that matches this barcode
  let matchedVariant = null;
  let matchedSize = null;

  for (const variant of product.variants || []) {
    const size = (variant.sizes || []).find(
      (s: any) => s.barcode === barcode
    );
    if (size) {
      matchedVariant = variant;
      matchedSize = size;
      break;
    }
  }

  // Redirect to product detail page
  const productId = product._id?.toString();
  return NextResponse.redirect(
    `${request.nextUrl.protocol}//${request.nextUrl.host}/inventory/products/${productId}`,
    { status: 302 }
  );
}
