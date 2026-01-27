import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../../lib/mongodb";

export const POST = async (request: NextRequest) => {
  const req = await request.json();
  try {
    if (!req.user_id || !req.product_id) {
      return NextResponse.json(
        { message: "user_id and product_id are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cartCollection = db.collection("cart");

    // ✅ Build query key to treat each product+size+color combo as unique
    // If row_key exists, use it. Otherwise, build from product_id + size + color
    const rowKey = req.row_key || (() => {
      const size = req.product_size || "no-size";
      const color = req.product_color || "no-color";
      return `${req.product_id}__${size}__${color}`;
    })();

    // ✅ Update or insert cart item
    const result = await cartCollection.updateOne(
      {
        user_id: req.user_id,
        row_key: rowKey, // ✅ Use row_key as unique identifier per variation
      },
      {
        $set: {
          user_id: req.user_id,
          product_id: req.product_id,
          row_key: rowKey,
          product_title: req.product_title,
          product_slug: req.product_slug || null,
          image_url: req.image_url,
          product_category: req.product_category,
          product_style: req.product_style || null,
          
          // ✅ Store unit price separately for better calculations
          unit_price: req.unit_price || req.product_price,
          
          // ✅ Store size and color variations
          product_size: req.product_size || null,
          product_color: req.product_color || null,
          
          // Optional metadata
          description: req.description || null,
        },
        // ✅ Increment quantity if same variant added again
        // (On first insert, this will set it; on updates, it will add)
        $inc: {
          product_quantity: req.product_quantity || 1,
        },
      },
      { upsert: true }
    );

    console.log("Data Posted To Database", result);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error While Posting Data To Database", error);
    return NextResponse.json(
      { message: "Something Went Wrong", error: String(error) },
      { status: 500 }
    );
  }
};


export const GET = async (request: NextRequest) => {
  const uid = request.nextUrl.searchParams.get("user_id") as string;
  try {
    if (!uid) {
      return NextResponse.json(
        { message: "user_id is required" },
        { status: 400 }
      );
    }

    console.log(`[Cart GET] Fetching cart for user: ${uid}`);
    const db = await getDatabase();
    console.log(`[Cart GET] Connected to database`);
    
    const cartCollection = db.collection("cart");
    console.log(`[Cart GET] Got cart collection`);
    
    const items = await cartCollection
      .find({ user_id: uid })
      .toArray();
    
    console.log(`[Cart GET] Fetched ${items.length} items for user ${uid}`, items);
    return NextResponse.json(items);
  } catch (error) {
    console.error("[Cart GET] Error fetching cart:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        message: "Error fetching cart", 
        error: errorMessage,
        details: "Check server logs for more information"
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  const req = await request.json();
  try {
    if (!req.user_id || !req.row_key) {
      return NextResponse.json(
        { message: "user_id and row_key are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cartCollection = db.collection("cart");
    
    // ✅ Delete by row_key which uniquely identifies product + size + color combo
    const result = await cartCollection.deleteOne({
      user_id: req.user_id,
      row_key: req.row_key,
    });
    
    console.log("Product Successfully Deleted", result);
    return NextResponse.json({ message: "Product Successfully Deleted", result });
  } catch (error) {
    console.error("Error removing item from cart", error);
    return NextResponse.json(
      { message: "Error Deleting Product", error: String(error) },
      { status: 500 }
    );
  }
};

// ✅ PATCH endpoint to update quantity for a specific product variation
export const PATCH = async (request: NextRequest) => {
  const req = await request.json();
  try {
    if (!req.user_id || !req.row_key || req.product_quantity === undefined) {
      return NextResponse.json(
        { message: "user_id, row_key, and product_quantity are required" },
        { status: 400 }
      );
    }

    // Ensure quantity is at least 1
    const newQuantity = Math.max(1, parseInt(req.product_quantity, 10));

    const db = await getDatabase();
    const cartCollection = db.collection("cart");
    
    const result = await cartCollection.updateOne(
      {
        user_id: req.user_id,
        row_key: req.row_key,
      },
      {
        $set: {
          product_quantity: newQuantity,
        },
      }
    );
    
    console.log("Quantity Updated", result);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error updating quantity", error);
    return NextResponse.json(
      { message: "Error Updating Quantity", error: String(error) },
      { status: 500 }
    );
  }
};
