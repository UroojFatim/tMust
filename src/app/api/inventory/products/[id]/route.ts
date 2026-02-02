import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getInventorySession } from "@/lib/inventoryAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
  }

  const db = await getDatabase();
  const product = await db
    .collection("inventory_products")
    .findOne({ _id: new ObjectId(id) });

  if (!product) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    product: { ...product, _id: product._id.toString() },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { _id, ...updateData } = body;

  const db = await getDatabase();
  const result = await db
    .collection("inventory_products")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { ok: false, message: "Product not found" },
      { status: 404 }
    );
  }

  const updatedProduct = await db
    .collection("inventory_products")
    .findOne({ _id: new ObjectId(id) });

  return NextResponse.json({
    ok: true,
    message: "Product updated successfully",
    product: { ...updatedProduct, _id: updatedProduct?._id.toString() },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const result = await db
    .collection("inventory_products")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { ok: false, message: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Product deleted successfully",
  });
}
