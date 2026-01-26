import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDatabase } from "../../../lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  console.log("[Webhook] Received Stripe event");
  console.log("[Webhook] Signature:", signature ? "Present" : "Missing");
  console.log("[Webhook] Webhook Secret Configured:", webhookSecret ? "Yes" : "No");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("[Webhook] Event verified successfully, type:", event.type);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: err.message, received: false },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    console.log("[Webhook] Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const db = await getDatabase();
      const usersCollection = db.collection("users");
      const ordersCollection = db.collection("orders");
      const cartCollection = db.collection("cart");

      // Get customer details from the session
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const customerPhone = session.customer_details?.phone;
      const customerCity = session.customer_details?.address?.city;
      const customerCountry = session.customer_details?.address?.country;
      const customerPostalCode = session.customer_details?.address?.postal_code;
      const customerState = session.customer_details?.address?.state;
      const customerLine1 = session.customer_details?.address?.line1;
      const customerLine2 = session.customer_details?.address?.line2;
      const shippingAddress = session.shipping_details?.address;
      const billingAddress = session.customer_details?.address;
      const sessionUserId = session.metadata?.session_user_id;

      console.log("[Webhook] Session data:", {
        email: customerEmail,
        name: customerName,
        sessionUserId: sessionUserId,
      });

      // Create or update user in MongoDB with email as unique identifier
      if (customerEmail) {
        console.log("[Webhook] Creating/updating user with email:", customerEmail);
        
        const userResult = await usersCollection.updateOne(
          { email: customerEmail }, // Email is unique user ID
          {
            $set: {
              email: customerEmail,
              name: customerName || "",
              phone: customerPhone || "",
              session_user_id: sessionUserId,
              shipping_address: shippingAddress,
              billing_address: billingAddress,
              address: {
                line1: customerLine1 || "",
                line2: customerLine2 || "",
                city: customerCity || "",
                state: customerState || "",
                postal_code: customerPostalCode || "",
                country: customerCountry || "",
              },
              last_order_date: new Date(),
              updated_at: new Date(),
            },
            $setOnInsert: {
              created_at: new Date(),
              order_count: 0,
            },
          },
          { upsert: true }
        );

        console.log("[Webhook] User upserted:", {
          matched: userResult.matchedCount,
          upserted: userResult.upsertedCount,
          modifiedCount: userResult.modifiedCount,
        });

        // Get cart items for this user to include in order
        const cartItems = await cartCollection
          .find({ user_id: sessionUserId })
          .toArray();
        
        console.log("[Webhook] Found", cartItems.length, "cart items for user");

        // Create order record with complete Stripe data and cart reference
        console.log("[Webhook] Creating order record");
        const orderResult = await ordersCollection.insertOne({
          // User reference
          user_email: customerEmail,
          session_user_id: sessionUserId,
          
          // Stripe reference
          stripe_session_id: session.id,
          payment_status: session.payment_status,
          payment_method_types: session.payment_method_types,
          
          // Order totals
          amount_total: session.amount_total,
          amount_subtotal: session.amount_subtotal,
          currency: session.currency,
          
          // Customer details (from Stripe)
          customer_details: {
            name: customerName || "",
            email: customerEmail,
            phone: customerPhone || "",
            address: {
              line1: customerLine1 || "",
              line2: customerLine2 || "",
              city: customerCity || "",
              state: customerState || "",
              postal_code: customerPostalCode || "",
              country: customerCountry || "",
            },
          },
          
          // Shipping & Billing details
          shipping_details: session.shipping_details,
          billing_address: billingAddress,
          
          // Cart reference - link to cart items used
          cart_items: cartItems,
          cart_item_count: cartItems.length,
          
          // Timestamps
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log("[Webhook] Order created successfully:", orderResult.insertedId);
        console.log("[Webhook] Order linked to", cartItems.length, "cart items");
        
        // Increment user's order count
        await usersCollection.updateOne(
          { email: customerEmail },
          { $inc: { order_count: 1 } }
        );
      } else {
        console.warn("[Webhook] Missing required customer email");
      }
    } catch (error) {
      console.error("[Webhook] Error creating user/order:", error);
      return NextResponse.json(
        { 
          error: "Failed to create user/order",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } else {
    console.log("[Webhook] Ignoring event type:", event.type);
  }

  return NextResponse.json({ received: true });
}
