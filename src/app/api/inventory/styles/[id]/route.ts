import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getInventorySession } from "@/lib/inventoryAuth";

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
      { ok: false, message: "Invalid style ID" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const result = await db
    .collection("inventory_styles")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { ok: false, message: "Style not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Style deleted successfully",
  });
}
