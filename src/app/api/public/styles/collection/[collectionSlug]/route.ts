import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ collectionSlug: string }> }
) {
  try {
    const { collectionSlug } = await params;

    const db = await getDatabase();

    // Fetch the collection with its styles
    const collection = await db
      .collection("inventory_collections")
      .findOne({ slug: collectionSlug });

    if (!collection) {
      return NextResponse.json(
        { ok: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    // Get styles from collection
    const styleNames = Array.isArray(collection.styles) ? collection.styles : [];

    if (styleNames.length === 0) {
      return NextResponse.json({
        ok: true,
        styles: [],
        message: "No styles in this collection",
      });
    }

    // Fetch style details from inventory_styles
    const styles = await db
      .collection("inventory_styles")
      .find({
        name: { $in: styleNames },
      })
      .sort({ name: 1 })
      .toArray();

    const serialized = styles.map((style) => ({
      _id: style._id?.toString(),
      name: style.name,
      slug: style.slug,
    }));

    return NextResponse.json({
      ok: true,
      styles: serialized,
      collectionName: collection.name,
    });
  } catch (error) {
    console.error("Error fetching styles by collection:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch styles" },
      { status: 500 }
    );
  }
}
