import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const styles = await db
      .collection("inventory_styles")
      .find({})
      .sort({ name: 1 })
      .toArray();

    const serialized = styles.map((style) => ({
      _id: style._id?.toString(),
      name: style.name,
      slug: style.slug,
    }));

    return NextResponse.json({ ok: true, styles: serialized });
  } catch (error) {
    console.error("Error fetching styles:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch styles" },
      { status: 500 }
    );
  }
}
