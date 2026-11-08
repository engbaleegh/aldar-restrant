import { Languages } from "@/constants/enums";
import { OrderStatus } from "@/generated/prisma";
import { db } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/server/order-confirmation-email";
import { NextResponse } from "next/server";
import { z } from "zod";

const confirmOrderSchema = z.object({
  sessionId: z.string().startsWith("cs_").max(255),
});

/**
 * Called by the success page after Stripe redirects back. Verifies the payment
 * with Stripe and marks the order created by /api/checkout as paid.
 * Safe to call more than once for the same session.
 */
export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payment processing is not configured." },
        { status: 503 }
      );
    }

    const parsed = confirmOrderSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { sessionId } = parsed.data;

    const order = await db.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true, paid: true, userEmail: true, phone: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.paid) {
      return NextResponse.json({ orderId: order.id, alreadyConfirmed: true });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
    }

    const details = session.customer_details;
    // Only the request that actually flips paid=false → true continues, so the
    // confirmation email is sent once even if this endpoint is called twice.
    const { count } = await db.order.updateMany({
      where: { id: order.id, paid: false },
      data: {
        paid: true,
        status: OrderStatus.CONFIRMED,
        userEmail: order.userEmail || details?.email || "",
        phone: order.phone || details?.phone || "",
      },
    });
    if (count === 0) {
      return NextResponse.json({ orderId: order.id, alreadyConfirmed: true });
    }

    // The address the customer typed on the Stripe payment page.
    const customerEmail = details?.email || order.userEmail;
    const locale = Object.values(Languages).includes(session.metadata?.locale as Languages)
      ? (session.metadata!.locale as Languages)
      : Languages.ENGLISH;
    const email = customerEmail
      ? await sendOrderConfirmationEmail(order.id, customerEmail, locale)
      : "skipped";

    return NextResponse.json({ orderId: order.id, email });
  } catch (error) {
    console.error("[api/create-order] failed to confirm order", error);
    return NextResponse.json(
      { error: "Could not confirm the order." },
      { status: 500 }
    );
  }
}
