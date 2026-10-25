import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
      const { id } = await params;
    const db = await getDatabase();
    const imagesCollection = db.collection("uploaded_images");

    // Fetch image from MongoDB
    const image = await imagesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!image) {
      return NextResponse.json(
        { ok: false, message: "Image not found" },
        { status: 404 }
      );
    }

    // Extract base64 data and mime type
    const base64Data = image.base64Data.split(",")[1] || image.base64Data;
    const mimeType = image.mimeType || "image/jpeg";

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Return image with proper headers for browser caching
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Fetch image error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
