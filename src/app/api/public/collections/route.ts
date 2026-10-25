import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const collections = await db
      .collection("inventory_collections")
      .find({})
      .sort({ name: 1 })
      .toArray();

    const serialized = collections.map((collection) => ({
      _id: collection._id?.toString(),
      name: collection.name,
      slug: collection.slug,
    }));

    return NextResponse.json({ ok: true, collections: serialized });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
