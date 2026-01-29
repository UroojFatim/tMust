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
  const styles = await db
    .collection("inventory_styles")
    .find({})
    .sort({ name: 1 })
    .toArray();

  const serialized = styles.map((style) => ({
    ...style,
    _id: style._id?.toString(),
  }));

  return NextResponse.json({ ok: true, styles: serialized });
}

export async function POST(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json(
      { ok: false, message: "Style name is required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);

  const db = await getDatabase();
  const existing = await db
    .collection("inventory_styles")
    .findOne({ slug });

  if (existing) {
    return NextResponse.json(
      { ok: false, message: "Style already exists" },
      { status: 409 }
    );
  }

  const doc = {
    name,
    slug,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("inventory_styles").insertOne(doc);

  return NextResponse.json({
    ok: true,
    style: { ...doc, _id: result.insertedId.toString() },
  });
}
