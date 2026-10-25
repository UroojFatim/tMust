import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getInventorySession } from "@/lib/inventoryAuth";
import { ObjectId } from "mongodb";

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
