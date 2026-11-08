import { Languages } from "@/constants/enums";
import { formatCurrency } from "@/lib/formatters";
import type { EmailMessage } from "@/lib/email";

export type OrderEmailData = {
  id: string;
  createdAt: Date;
  subTotal: number;
  deliveryFee: number;
  totalPrice: number;
  phone: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  items: {
    name: string;
    nameAr?: string | null;
    quantity: number;
    unitPrice: number;
    sizeName: string | null;
    /** Comma-separated extra names, as stored on OrderProduct. */
    extras: string | null;
  }[];
};

const BRAND_COLOR = "#ec370a";
const LRM = "‎"; // left-to-right mark (invisible)

const STRINGS = {
  [Languages.ENGLISH]: {
    dir: "ltr",
    restaurant: "Aldar Restaurant",
    subject: (n: string) => `Payment confirmed – Order #${n} | Aldar Restaurant`,
    heading: "Thank you! Your payment was successful",
    intro: "We've received your order and your payment. Here are your order details:",
    orderNumber: "Order number",
    date: "Date",
    item: "Item",
    qty: "Qty",
    amount: "Amount",
    size: "Size",
    extras: "Extras",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total paid",
    deliveryDetails: "Delivery details",
    address: "Address",
    phone: "Phone",
    footer: "We're preparing your order now. If you have any questions, simply reply to this email.",
  },
  [Languages.ARABIC]: {
    dir: "rtl",
    restaurant: "مطعم الدار",
    // The Latin order reference goes last and has no "#": between Arabic words
    // it gets reordered by mail clients that show subjects left-to-right. The
    // invisible LRM keeps a reference starting with a digit (e.g. "7b1e4c2a")
    // in one piece.
    subject: (n: string) => `مطعم الدار – تم تأكيد الدفع لطلبك رقم ${LRM}${n}`,
    heading: "شكراً لك! تم الدفع بنجاح",
    intro: "استلمنا طلبك ودفعتك بنجاح. هذه تفاصيل طلبك:",
    orderNumber: "رقم الطلب",
    date: "التاريخ",
    item: "الصنف",
    qty: "الكمية",
    amount: "المبلغ",
    size: "الحجم",
    extras: "الإضافات",
    subtotal: "المجموع الفرعي",
    delivery: "رسوم التوصيل",
    total: "الإجمالي المدفوع",
    deliveryDetails: "بيانات التوصيل",
    address: "العنوان",
    phone: "الهاتف",
    footer: "نقوم الآن بتحضير طلبك. إذا كان لديك أي استفسار، يمكنك الرد على هذه الرسالة.",
  },
} as const;

const ARABIC_OPTION_NAMES: Record<string, string> = {
  SMALL: "صغير",
  MEDIUM: "وسط",
  LARGE: "كبير",
  CHEESE: "جبن",
  BACON: "بيكون",
  TOMATO: "طماطم",
  ONION: "بصل",
  PEPPER: "فلفل",
};

const ENGLISH_OPTION_NAMES: Record<string, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  CHEESE: "Cheese",
  BACON: "Bacon",
  TOMATO: "Tomato",
  ONION: "Onion",
  PEPPER: "Pepper",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

/** Short order reference, the same one shown in the admin orders table. */
export function orderReference(orderId: string): string {
  return orderId.slice(0, 8);
}

export function buildOrderConfirmationEmail(
  order: OrderEmailData,
  locale: Languages,
  timeZone = process.env.RESTAURANT_TIMEZONE || "Asia/Riyadh"
): Omit<EmailMessage, "to"> {
  const t = STRINGS[locale] ?? STRINGS[Languages.ENGLISH];
  const isAr = locale === Languages.ARABIC;
  const optionNames = isAr ? ARABIC_OPTION_NAMES : ENGLISH_OPTION_NAMES;
  const optionName = (name: string) => optionNames[name.trim()] ?? name.trim();
  const ref = orderReference(order.id);
  const refLabel = isAr ? `${LRM}${ref}` : `#${ref}`;
  const align = isAr ? "right" : "left";
  // Keep numbers, prices and phone numbers left-to-right inside Arabic text.
  const ltr = (value: string) =>
    `<span dir="ltr" style="direction:ltr;unicode-bidi:embed;">${escapeHtml(value)}</span>`;
  const alignEnd = isAr ? "left" : "right";

  const date = new Intl.DateTimeFormat(isAr ? "ar-u-nu-latn" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone,
  }).format(order.createdAt);

  const address = [order.streetAddress, order.city, order.postalCode, order.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(isAr ? "، " : ", ");

  const items = order.items.map((item) => {
    const name = (isAr && item.nameAr) || item.name;
    const options: string[] = [];
    if (item.sizeName) options.push(`${t.size}: ${optionName(item.sizeName)}`);
    if (item.extras) {
      const extras = item.extras.split(",").map(optionName).join(isAr ? "، " : ", ");
      options.push(`${t.extras}: ${extras}`);
    }
    return {
      name,
      options: options.join(" · "),
      quantity: item.quantity,
      lineTotal: formatCurrency(item.unitPrice * item.quantity),
    };
  });

  // ─── Plain-text version ────────────────────────────────────────────────────
  const text = [
    t.heading,
    "",
    t.intro,
    "",
    `${t.orderNumber}: ${refLabel}`,
    `${t.date}: ${date}`,
    "",
    ...items.map(
      (i) => `- ${i.name} × ${i.quantity}${i.options ? ` (${i.options})` : ""}: ${i.lineTotal}`
    ),
    "",
    `${t.subtotal}: ${formatCurrency(order.subTotal)}`,
    `${t.delivery}: ${formatCurrency(order.deliveryFee)}`,
    `${t.total}: ${formatCurrency(order.totalPrice)}`,
    "",
    `${t.deliveryDetails}:`,
    `${t.address}: ${address}`,
    `${t.phone}: ${order.phone}`,
    "",
    t.footer,
    "",
    t.restaurant,
  ].join("\n");

  // ─── HTML version (inline styles + tables for email-client support) ────────
  const cell = `padding:10px 0;border-bottom:1px solid #eeeeee;vertical-align:top;`;
  const itemRows = items
    .map(
      (i) => `
        <tr>
          <td style="${cell}text-align:${align};">
            <div style="font-weight:600;color:#111111;">${escapeHtml(i.name)}</div>
            ${i.options ? `<div style="font-size:13px;color:#6b7280;margin-top:2px;">${escapeHtml(i.options)}</div>` : ""}
          </td>
          <td style="${cell}text-align:center;white-space:nowrap;color:#374151;">${i.quantity}</td>
          <td style="${cell}text-align:${alignEnd};white-space:nowrap;color:#111111;">${ltr(i.lineTotal)}</td>
        </tr>`
    )
    .join("");

  /** `valueHtml` must already be escaped. */
  const summaryRow = (label: string, valueHtml: string, strong = false) => `
        <tr>
          <td style="padding:4px 0;text-align:${align};color:${strong ? "#111111" : "#6b7280"};${strong ? "font-weight:700;font-size:16px;" : ""}">${label}</td>
          <td style="padding:4px 0;text-align:${alignEnd};color:#111111;${strong ? "font-weight:700;font-size:16px;" : ""}">${valueHtml}</td>
        </tr>`;

  const html = `<!doctype html>
<html lang="${locale}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(t.subject(ref))}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="${t.dir}" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Tahoma,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111111;">
        <tr>
          <td style="background:${BRAND_COLOR};padding:20px 24px;text-align:center;color:#ffffff;font-size:22px;font-weight:700;">
            ${t.restaurant}
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px 8px;text-align:center;">
            <div style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background:#dcfce7;color:#16a34a;font-size:26px;">&#10003;</div>
            <h1 style="margin:12px 0 6px;font-size:22px;color:#111111;">${t.heading}</h1>
            <p style="margin:0;color:#4b5563;">${t.intro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;border-radius:8px;padding:12px 16px;">
              ${summaryRow(t.orderNumber, ltr(refLabel))}
              ${summaryRow(t.date, escapeHtml(date))}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <th style="padding:8px 0;border-bottom:2px solid #e5e7eb;text-align:${align};font-size:13px;color:#6b7280;font-weight:600;">${t.item}</th>
                <th style="padding:8px 0;border-bottom:2px solid #e5e7eb;text-align:center;font-size:13px;color:#6b7280;font-weight:600;">${t.qty}</th>
                <th style="padding:8px 0;border-bottom:2px solid #e5e7eb;text-align:${alignEnd};font-size:13px;color:#6b7280;font-weight:600;">${t.amount}</th>
              </tr>
              ${itemRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 24px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${summaryRow(t.subtotal, ltr(formatCurrency(order.subTotal)))}
              ${summaryRow(t.delivery, ltr(formatCurrency(order.deliveryFee)))}
              ${summaryRow(t.total, ltr(formatCurrency(order.totalPrice)), true)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px 24px;">
            <div style="font-weight:700;margin-bottom:6px;color:#111111;">${t.deliveryDetails}</div>
            <div style="color:#374151;">${t.address}: ${escapeHtml(address).replace(/\r?\n/g, "<br>")}</div>
            <div style="color:#374151;">${t.phone}: ${ltr(order.phone)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;color:#6b7280;font-size:13px;text-align:center;border-top:1px solid #f0f0f0;">
            ${t.footer}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: t.subject(ref), html, text };
}
