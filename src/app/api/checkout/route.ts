import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  cart: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      basePrice: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ),
  subTotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  totalPrice: z.number().positive(),
  locale: z.string().default("en"),
  customerInfo: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      streetAddress: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payment processing is not configured" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
  }

  const { cart, subTotal: _clientSubTotal, deliveryFee, totalPrice, locale, customerInfo } =
    parsed.data;

  const productIds = cart.map((item) => item.id);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, basePrice: true },
  });

  const priceMap = new Map(dbProducts.map((p) => [p.id, p]));

  for (const item of cart) {
    if (!priceMap.has(item.id)) {
      return NextResponse.json(
        { error: `Product not found: ${item.id}` },
        { status: 400 }
      );
    }
  }

  let serverSubTotal = 0;

  const lineItems = cart.map((item) => {
    const dbProduct = priceMap.get(item.id)!;
    const unitPrice = dbProduct.basePrice;
    serverSubTotal += unitPrice * item.quantity;
    return {
      price_data: {
        currency: "usd",
        product_data: { name: dbProduct.name },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: item.quantity,
    };
  });

  const serverTotal = serverSubTotal + deliveryFee;
  if (Math.abs(serverTotal - totalPrice) > 0.01) {
    return NextResponse.json(
      { error: "Price mismatch. Please refresh and try again." },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    customer_email: customerInfo?.email,
    metadata: {
      cart: JSON.stringify(cart),
      subTotal: String(serverSubTotal),
      deliveryFee: String(deliveryFee),
      totalPrice: String(serverTotal),
      customerInfo: JSON.stringify(customerInfo ?? {}),
    },
    success_url: `${baseUrl}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
