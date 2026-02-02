import { NextRequest, NextResponse } from "next/server";
import { getInventorySession } from "@/lib/inventoryAuth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, message: "Invalid file type" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;

    // Store in MongoDB
    const db = await getDatabase();
    const imagesCollection = db.collection("uploaded_images");

    const result = await imagesCollection.insertOne({
      filename: file.name,
      mimeType,
      base64Data: `data:${mimeType};base64,${base64}`,
      uploadedAt: new Date(),
      uploadedBy: session.username,
    });

    const imageId = result.insertedId.toString();
    const url = `/api/inventory/images/${imageId}`;

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { ok: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
