import { NextRequest, NextResponse } from "next/server";
import { cartColumns, db } from "../../../lib/drizzle";
import { eq } from "drizzle-orm";

export const DELETE = async (request: NextRequest) => {
    const req = await request.json();
    try {
      const res = await db
        .delete(cartColumns)
        .where(eq(cartColumns.user_id, req.user_id))
        .returning();
        
      console.log('Products Successfully Deleted');
      
      return NextResponse.json({ message: "Products Successfully Deleted" });
    } catch (error) {
      console.log("Error removing items from cart", error);
      return NextResponse.json({ message: "Error Deleting Products" });
    }
  };
  