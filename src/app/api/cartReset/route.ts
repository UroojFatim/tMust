import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../../lib/mongodb";

export const DELETE = async (request: NextRequest) => {
    const req = await request.json();
    try {
      const db = await getDatabase();
      const cartCollection = db.collection("cart");
      
      const result = await cartCollection.deleteMany({
        user_id: req.user_id
      });
        
      console.log('Products Successfully Deleted');
      
      return NextResponse.json({ message: "Products Successfully Deleted" });
    } catch (error) {
      console.log("Error removing items from cart", error);
      return NextResponse.json({ message: "Error Deleting Products" }, { status: 500 });
    }
  };
  