import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getInventorySession } from "@/lib/inventoryAuth";

export async function GET(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = await getDatabase();
  const products = await db.collection("inventory_products").find({}).toArray();

  let totalSkus = 0;
  let unitsOnHand = 0;
  let lowStockItems = 0;

  for (const product of products) {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    for (const variant of variants) {
      const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];
      for (const size of sizes) {
        totalSkus += 1;
        const qty = Number(size.quantity || 0);
        unitsOnHand += qty;
        if (qty <= 5) lowStockItems += 1;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    totals: {
      totalProducts: products.length,
      totalSkus,
      unitsOnHand,
      lowStockItems,
      totalSales: 0,
      totalProfit: 0,
      transactions: 0,
    },
  });
}
