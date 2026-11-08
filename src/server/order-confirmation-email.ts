import { Languages } from "@/constants/enums";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { buildOrderConfirmationEmail } from "@/lib/order-email";
import { db } from "@/lib/prisma";

/**
 * Emails the customer that the payment succeeded, with the order details.
 * Never throws: a failed email must not fail the order confirmation.
 */
export type OrderEmailResult = {
  status: "sent" | "skipped" | "failed";
  /** Only in test mode (Ethereal): where the sent email can be viewed. */
  previewUrl?: string;
};

export async function sendOrderConfirmationEmail(
  orderId: string,
  to: string,
  locale: Languages
): Promise<OrderEmailResult> {
  if (!isEmailConfigured()) {
    console.warn("[email] SMTP is not configured; order confirmation email skipped", { orderId });
    return { status: "skipped" };
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        products: {
          orderBy: { id: "asc" },
          include: { Product: { select: { name: true, nameAr: true } } },
        },
      },
    });
    if (!order) throw new Error(`Order ${orderId} not found`);

    const message = buildOrderConfirmationEmail(
      {
        ...order,
        items: order.products.map((line) => ({
          name: line.Product.name,
          nameAr: line.Product.nameAr,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          sizeName: line.sizeName,
          extras: line.extras,
        })),
      },
      locale
    );

    const { previewUrl } = await sendEmail({ to, ...message });
    console.info("[email] order confirmation sent", { orderId, previewUrl });
    return { status: "sent", previewUrl };
  } catch (error) {
    console.error("[email] failed to send order confirmation", { orderId, error });
    return { status: "failed" };
  }
}
