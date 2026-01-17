import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}
const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-12-15.clover",
});
export async function POST(req: Request) {
  const body = await req.json();
  const { cart, subTotal, deliveryFee, totalPrice } = body;

  // تحويل عناصر Cart إلى Stripe line_items
  interface CartItem {
    id?: string;
    name: string;
    basePrice: number;
    quantity: number;
    [key: string]: unknown;
  }

  interface StripePriceData {
    currency: string;
    product_data: { name: string };
    unit_amount: number;
  }

  interface StripeLineItem {
    price_data: StripePriceData;
    quantity: number;
  }

  const typedCart = cart as CartItem[];
  const lineItems: StripeLineItem[] = typedCart.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name },
      unit_amount: item.basePrice * 100,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    // نرسل Session ID في success_url
    metadata: {
      cart: JSON.stringify(cart),
      subTotal: String(subTotal),
      deliveryFee: String(deliveryFee),
      totalPrice: String(totalPrice),
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/en/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/en/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
