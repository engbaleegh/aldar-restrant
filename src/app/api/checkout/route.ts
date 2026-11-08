import { Languages } from "@/constants/enums";
import { OrderStatus } from "@/generated/prisma";
import { deliveryFee } from "@/lib/cart";
import { priceCart, toCents } from "@/lib/checkout-pricing";
import { db } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const cartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  size: z.object({ id: z.string().min(1) }).nullish(),
  extras: z.array(z.object({ id: z.string().min(1) })).nullish(),
});

const checkoutSchema = z.object({
  cart: z.array(cartItemSchema).min(1).max(50),
  locale: z.enum(Languages).catch(Languages.ENGLISH),
  customerInfo: z.object({
    phone: z.string().trim().min(1).max(30),
    streetAddress: z.string().trim().min(1).max(300),
    postalCode: z.string().trim().max(20).optional(),
    city: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
  }),
});

function errorResponse(status: number, code: string, error: string, extra?: object) {
  return NextResponse.json({ error, code, ...extra }, { status });
}

function getBaseUrl(req: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  return configured || new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return errorResponse(503, "PAYMENTS_NOT_CONFIGURED", "Payment processing is not configured.");
    }

    const body = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      const missingContact = parsed.error.issues.some((i) => i.path[0] === "customerInfo");
      return errorResponse(
        400,
        "INVALID_INPUT",
        missingContact
          ? "Please enter your phone number and delivery address."
          : "Your cart data is invalid. Please refresh the page and try again."
      );
    }
    const { cart, locale, customerInfo } = parsed.data;

    const productIds = [...new Set(cart.map((item) => item.id))];
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        basePrice: true,
        sizes: { select: { id: true, name: true, price: true } },
        extras: { select: { id: true, name: true, price: true } },
      },
    });

    const priced = priceCart(
      cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        sizeId: item.size?.id,
        extraIds: item.extras?.map((e) => e.id),
      })),
      products
    );
    if (!priced.ok) {
      return errorResponse(
        409,
        "ITEMS_UNAVAILABLE",
        "Some items in your cart are no longer available and were removed. Please review your cart and try again.",
        { unavailableIds: priced.unavailableIds }
      );
    }

    const session = await getServerSession(authOptions);
    const user = session?.user?.id
      ? await db.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, email: true },
        })
      : null;

    const deliveryFeeCents = toCents(deliveryFee);
    const lineItems = priced.lines.map((line) => ({
      price_data: {
        currency: "usd",
        product_data: { name: line.displayName },
        unit_amount: line.unitAmountCents,
      },
      quantity: line.quantity,
    }));
    if (deliveryFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery fee" },
          unit_amount: deliveryFeeCents,
        },
        quantity: 1,
      });
    }

    const baseUrl = getBaseUrl(req);
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: user?.email || undefined,
      // locale: language of the confirmation email sent after payment.
      metadata: user ? { locale, userId: user.id } : { locale },
      success_url: `${baseUrl}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/cancel`,
    });

    if (!checkoutSession.url) {
      throw new Error(`Stripe returned no checkout URL for session ${checkoutSession.id}`);
    }

    // Record the order now (unpaid). It is marked as paid by /api/create-order
    // once Stripe confirms the payment. Keeping the cart in our database instead
    // of Stripe metadata avoids Stripe's 500-character metadata limit.
    await db.order.create({
      data: {
        paid: false,
        status: OrderStatus.PENDING,
        subTotal: priced.subTotalCents / 100,
        deliveryFee: deliveryFeeCents / 100,
        totalPrice: (priced.subTotalCents + deliveryFeeCents) / 100,
        userEmail: user?.email ?? "",
        phone: customerInfo.phone,
        streetAddress: customerInfo.streetAddress,
        postalCode: customerInfo.postalCode ?? "",
        city: customerInfo.city ?? "",
        country: customerInfo.country ?? "",
        stripeSessionId: checkoutSession.id,
        userId: user?.id,
        products: {
          create: priced.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitAmountCents / 100,
            sizeName: line.sizeName,
            extras: line.extras,
            userId: user?.id,
          })),
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[api/checkout] failed to start checkout", error);
    return errorResponse(
      500,
      "CHECKOUT_FAILED",
      "We couldn't start the payment. Please try again in a moment."
    );
  }
}
