import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payment processing is not configured" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId } = parsed.data;

  const existing = await db.order.findUnique({
    where: { stripeSessionId: sessionId },
  });
  if (existing) {
    return NextResponse.json({ order: existing, alreadyCreated: true });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 402 }
    );
  }

  const cart = JSON.parse(session.metadata?.cart || "[]") as Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    size?: { name: string };
    extras?: Array<{ name: string }>;
  }>;
  const customerInfo = JSON.parse(session.metadata?.customerInfo || "{}") as {
    email?: string;
    phone?: string;
    streetAddress?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };

  const subTotal = parseFloat(session.metadata?.subTotal || "0");
  const deliveryFee = parseFloat(session.metadata?.deliveryFee || "0");
  const totalPrice = parseFloat(session.metadata?.totalPrice || "0");

  const order = await db.order.create({
    data: {
      paid: true,
      status: OrderStatus.CONFIRMED,
      subTotal,
      deliveryFee,
      totalPrice,
      stripeSessionId: sessionId,
      userEmail:
        session.customer_details?.email ||
        customerInfo.email ||
        "guest@aldar.com",
      phone: customerInfo.phone || session.customer_details?.phone || "",
      streetAddress:
        customerInfo.streetAddress ||
        session.customer_details?.address?.line1 ||
        "",
      postalCode:
        customerInfo.postalCode ||
        session.customer_details?.address?.postal_code ||
        "",
      city:
        customerInfo.city || session.customer_details?.address?.city || "",
      country:
        customerInfo.country ||
        session.customer_details?.address?.country ||
        "",
      products: {
        create: cart.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.basePrice,
          sizeName: item.size?.name,
          extras: item.extras?.map((e) => e.name).join(", ") || null,
          productId: item.id,
        })),
      },
    },
    include: { products: true },
  });

  return NextResponse.json({ order });
}
