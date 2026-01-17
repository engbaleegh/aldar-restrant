import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}
const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  // الحصول على بيانات الجلسة من Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  // استخراج البيانات الضرورية من الـ metadata
  // const cart = JSON.parse(session.metadata?.cart || "[]");
  const subTotal = parseFloat(session.metadata?.subTotal || "0");
  const deliveryFee = parseFloat(session.metadata?.deliveryFee || "0");
  const totalPrice = parseFloat(session.metadata?.totalPrice || "2");

  // هنا ننشئ الطلب في Prisma
  const order = await db.order.create({
    data: {
      paid: true,
      subTotal: subTotal || 10, // تجريبي
      deliveryFee: deliveryFee || 5, // تجريبي
      totalPrice: totalPrice || 15, // تجريبي
      userEmail: session.customer_details?.email || "test@example.com",
      phone: "",
      streetAddress: "",
      postalCode: "",
      city: "",
      country: "",
    },
  });

  return NextResponse.json({ order });
}
