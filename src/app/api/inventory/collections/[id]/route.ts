import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, message: "Invalid collection ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { name, styles } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { ok: false, message: "Collection name is required" },
      { status: 400 }
    );
  }

  const slug = slugify(name);

  const db = await getDatabase();
  const result = await db
    .collection("inventory_collections")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), slug, styles: styles || [] } }
    );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { ok: false, message: "Collection not found" },
      { status: 404 }
    );
  }

  const updatedCollection = await db
    .collection("inventory_collections")
    .findOne({ _id: new ObjectId(id) });

  return NextResponse.json({
    ok: true,
    message: "Collection updated successfully",
    collection: updatedCollection,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, message: "Invalid collection ID" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const result = await db
    .collection("inventory_collections")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { ok: false, message: "Collection not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Collection deleted successfully",
  });
}
