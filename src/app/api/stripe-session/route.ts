import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { getDatabase } from "../../../lib/mongodb";

const key = process.env.STRIPE_SECRET_KEY || "";

const stripe = new Stripe(key, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log(body)
  try {
    if (body.products.length > 0) {
      const session = await stripe.checkout.sessions.create({
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "required",
        // Shipping disabled - enable when you create shipping rates in your new Stripe account
        // shipping_address_collection: {
        //   allowed_countries: ['US', 'CA', 'GB', 'AU'],
        // },
        phone_number_collection: {
          enabled: true,
        },
        customer_email: undefined, // Let customer enter email
        // shipping_options: [
        //   { shipping_rate: "shr_1NkOlPJiiFtN0i2AfQA5k7uS" },
        //   { shipping_rate: "shr_1NkOkvJiiFtN0i2AnQRSJ5LP" },
        // ],
        line_items: body.products.map((item: any) => {
          // ✅ Get current quantity from quantities object using row_key
          const rowKey = item.row_key || `${item.product_id}__${item.product_size || "no-size"}__${item.product_color || "no-color"}`;
          const currentQuantity = body.quantities?.[rowKey] ?? item.product_quantity ?? 1;
          
          // ✅ Get unit price from various possible fields
          // Database stores it as 'unit_price', may also be 'product_price'
          const rawPrice = item.unit_price ?? item.product_price ?? item.price ?? 0;
          const unitPrice = Number(rawPrice);
          
          if (isNaN(unitPrice) || unitPrice <= 0) {
            throw new Error(`Invalid price for product ${item.product_id}: ${rawPrice}`);
          }
          
          // ✅ Build product name with size and color info
          let productName = item.product_title || "Product";
          const size = item.product_size || item.size;
          const color = item.product_color || item.color;
          
          if (size || color) {
            productName += " - ";
            if (size) productName += `Size: ${size}`;
            if (size && color) productName += ", ";
            if (color) productName += `Color: ${color}`;
          }

          return {
            price_data: {
              currency: "usd",
              unit_amount: Math.round(unitPrice * 100),
              product_data: {
                name: productName,
              },
            },
            quantity: Math.max(1, Math.round(currentQuantity)),
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
              maximum: 10,
            },
          };
        }),
        metadata: {
          session_user_id: body.session_user_id, // Store session ID for later
        },
        success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get("origin")}/?canceled=true`,
      });
      return NextResponse.json({ session });
    } else {
      return NextResponse.json({
        error: {
          message: "No items in cart",
        },
      });
    }
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Failed to create checkout session" } },
      { status: 400 }
    );
  }
}
