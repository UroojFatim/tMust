import { NextResponse } from "next/server";
import { getDatabase } from "../../../lib/mongodb";

export const GET = async () => {
  try {
    const db = await getDatabase();
    
    // Try to connect and ping
    const adminDb = db.admin();
    const status = await adminDb.ping();
    
    return NextResponse.json({
      status: "Connected to MongoDB",
      database: "tMust",
      ping: status,
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    return NextResponse.json(
      {
        status: "Failed to connect to MongoDB",
        error: String(error),
        message: "Check your MONGODB_URI environment variable",
      },
      { status: 500 }
    );
  }
};
