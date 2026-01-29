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
