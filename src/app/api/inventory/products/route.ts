import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getInventorySession } from "@/lib/inventoryAuth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function generateSku(base: string, color: string, size: string) {
  const clean = [base, color, size]
    .filter(Boolean)
    .join("-")
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${clean}-${random}`.replace(/--+/g, "-");
}

function generateBarcode(sku: string) {
  // Use SKU as the barcode value for unique identification
  return sku;
}

export async function GET(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = await getDatabase();
  const products = await db
    .collection("inventory_products")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const serialized = products.map((product) => ({
    ...product,
    _id: product._id?.toString(),
  }));

  return NextResponse.json({ ok: true, products: serialized });
}

export async function POST(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json();

  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json(
      { ok: false, message: "Title is required" },
      { status: 400 }
    );
  }

  const slug = slugify(body.slug || title);
  const baseCode = String(body.productCode || slug).toUpperCase();

  const variants = (Array.isArray(body.variants) ? body.variants : []).map(
    (variant: any) => {
      const color = String(variant.color || "").trim();
      const images = (Array.isArray(variant.images) ? variant.images : [])
        .map((img: any) => ({
          url: String(img?.url || "").trim(),
          alt: String(img?.alt || "").trim(),
        }))
        .filter((img: any) => img.url);

      const sizes = (Array.isArray(variant.sizes) ? variant.sizes : []).map(
        (sizeEntry: any) => {
          const size = String(sizeEntry.size || "").trim();
          const sku = generateSku(baseCode, color, size);
          const barcode = generateBarcode(sku);
          const label = `${title} ${color} ${size}`.trim();

          return {
            size,
            quantity: Number(sizeEntry.quantity || 0),
            priceDelta: Number(sizeEntry.priceDelta || 0),
            sku,
            barcode,
            label,
          };
        }
      );

      return {
        color,
        images,
        sizes,
      };
    }
  );

  const product = {
    title,
    slug,
    shortDescription: String(body.shortDescription || "").trim(),
    collection: String(body.collection || "").trim(),
    style: Array.isArray(body.style) ? body.style : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    details: Array.isArray(body.details)
      ? body.details
          .map((detail: any) => ({
            key: String(detail.key || "").trim(),
            valueHtml: String(detail.valueHtml || "").trim(),
          }))
          .filter((detail: any) => detail.key && detail.valueHtml)
      : [],
    productCode: String(body.productCode || "").trim(),
    purchasePrice: Number(body.purchasePrice || 0),
    basePrice: Number(body.basePrice || 0),
    variants,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDatabase();
  const result = await db.collection("inventory_products").insertOne(product);

  return NextResponse.json({
    ok: true,
    productId: result.insertedId.toString(),
    product: { ...product, _id: result.insertedId.toString() },
  });
}
