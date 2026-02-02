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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function abbreviate(value: string) {
  const clean = String(value || "").trim();
  if (!clean) return "NA";
  const words = clean
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 3);
  }

  return words.map((word) => word[0]).join("");
}

function normalizeSize(value: string) {
  const clean = String(value || "").trim().toUpperCase();
  const map: Record<string, string> = {
    XS: "XS",
    S: "S",
    SM: "S",
    SMALL: "S",
    M: "M",
    MEDIUM: "M",
    L: "L",
    LARGE: "L",
    XL: "XL",
    XXL: "XXL",
    XXXL: "XXXL",
  };
  if (map[clean]) return map[clean];
  if (clean.includes("EXTRA") && clean.includes("SMALL")) return "XS";
  if (clean.includes("EXTRA") && clean.includes("LARGE")) return "XL";
  return clean.replace(/[^A-Z0-9]/g, "").slice(0, 4) || "NA";
}

function generateSku(
  category: string,
  fabric: string,
  style: string,
  color: string,
  size: string
) {
  const parts = [
    "MUSTT",
    abbreviate(category),
    abbreviate(fabric),
    abbreviate(style),
    abbreviate(color),
    normalizeSize(size),
  ];
  return parts.filter(Boolean).join("-");
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

  // Validate collection and style
  const collection = String(body.collection || "").trim();
  const collectionSlug = String(body.collectionSlug || "").trim();
  if (!collection || !collectionSlug) {
    return NextResponse.json(
      { ok: false, message: "Collection and collection slug are required" },
      { status: 400 }
    );
  }

  const style = String(body.style || "").trim();
  const styleSlug = String(body.styleSlug || "").trim();
  if (!style || !styleSlug) {
    return NextResponse.json(
      { ok: false, message: "Style and style slug are required" },
      { status: 400 }
    );
  }

  const slug = slugify(body.slug || title);

  const detailsArray = Array.isArray(body.details) ? body.details : [];
  const fabricDetail = detailsArray.find((detail: any) =>
    String(detail?.key || "")
      .toLowerCase()
      .trim()
      .match(/fabric|material|work/)
  );
  const fabricValue = fabricDetail
    ? stripHtml(String(fabricDetail.valueHtml || ""))
    : "";

  const styleValue = Array.isArray(body.style)
    ? String(body.style[0] || "").trim()
    : String(body.style || "").trim();

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
          const sku = generateSku(collection, fabricValue, styleValue, color, size);
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
    collection,
    collectionSlug,
    style,
    styleSlug,
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
