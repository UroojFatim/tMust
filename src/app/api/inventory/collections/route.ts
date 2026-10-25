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

export async function GET(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = await getDatabase();
  const collections = await db
    .collection("inventory_collections")
    .find({})
    .sort({ name: 1 })
    .toArray();

  const serialized = collections.map((collection) => ({
    ...collection,
    _id: collection._id?.toString(),
  }));

  return NextResponse.json({ ok: true, collections: serialized });
}

export async function POST(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const styles = Array.isArray(body.styles)
    ? body.styles.map((style: any) => String(style || "").trim()).filter(Boolean)
    : [];

  if (!name) {
    return NextResponse.json(
      { ok: false, message: "Collection name is required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);

  const db = await getDatabase();
  const existing = await db
    .collection("inventory_collections")
    .findOne({ slug });

  if (existing) {
    return NextResponse.json(
      { ok: false, message: "Collection already exists" },
      { status: 409 }
    );
  }

  const doc = {
    name,
    slug,
    styles,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("inventory_collections").insertOne(doc);

  return NextResponse.json({
    ok: true,
    collection: { ...doc, _id: result.insertedId.toString() },
  });
}
