import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY || "";

const stripe = new Stripe(key, {
  apiVersion: "2023-08-16",
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
        billing_address_collection: "auto",
        shipping_options: [
          { shipping_rate: "shr_1NkOlPJiiFtN0i2AfQA5k7uS" },
          { shipping_rate: "shr_1NkOkvJiiFtN0i2AnQRSJ5LP" },
        ],
        line_items: body.products.map((item: any) => {
          return {
            price_data: {
              currency: "usd",
              unit_amount: (item.product_price * 100) / item.product_quantity,
              product_data: {
                name: item.product_title,
              },
            },
            quantity: item.product_quantity,
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
              maximum: 10,
            },
          };
        }),
        success_url: `${request.headers.get("origin")}/success`,
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
    return NextResponse.json(err.message);
  }
}
