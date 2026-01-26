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

    // Update or insert cart item
    const result = await cartCollection.updateOne(
      {
        user_id: req.user_id,
        product_id: req.product_id,
      },
      {
        $set: {
          user_id: req.user_id,
          product_id: req.product_id,
          product_title: req.product_title,
          image_url: req.image_url,
          product_category: req.product_category,
          product_price: req.product_price,
          product_quantity: req.product_quantity,
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
    if (!req.user_id || !req.product_title) {
      return NextResponse.json(
        { message: "user_id and product_title are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const cartCollection = db.collection("cart");
    
    const result = await cartCollection.deleteOne({
      user_id: req.user_id,
      product_title: req.product_title,
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
