import { describe, expect, it } from "vitest";
import { Languages } from "@/constants/enums";
import { buildOrderConfirmationEmail, type OrderEmailData } from "@/lib/order-email";

const order: OrderEmailData = {
  id: "3f2a9c1be4d84f0aa1b2c3d4e5f60718",
  createdAt: new Date("2026-11-08T18:30:00Z"),
  subTotal: 31,
  deliveryFee: 5,
  totalPrice: 36,
  phone: "+966500000000",
  streetAddress: "King Fahd Rd <b>Bldg 7</b>",
  postalCode: "12345",
  city: "Riyadh",
  country: "",
  items: [
    { name: "Burger", nameAr: "برجر", quantity: 2, unitPrice: 8, sizeName: "LARGE", extras: "CHEESE, PEPPER" },
    { name: "Salad", nameAr: null, quantity: 1, unitPrice: 15, sizeName: null, extras: null },
  ],
};

describe("buildOrderConfirmationEmail", () => {
  it("builds the English email with order details and totals", () => {
    const email = buildOrderConfirmationEmail(order, Languages.ENGLISH, "Asia/Riyadh");
    expect(email.subject).toBe("Payment confirmed – Order #3f2a9c1b | Aldar Restaurant");
    expect(email.html).toContain('dir="ltr"');
    for (const s of ["Your payment was successful", "#3f2a9c1b", "Burger", "Size: Large", "Extras: Cheese, Pepper", "$16.00", "$15.00", "$31.00", "$5.00", "$36.00", "+966500000000"]) {
      expect(email.html).toContain(s);
    }
    expect(email.text).toContain("- Burger × 2 (Size: Large · Extras: Cheese, Pepper): $16.00");
    expect(email.text).toContain("Total paid: $36.00");
    // 18:30 UTC is 21:30 in Riyadh
    expect(email.text).toMatch(/November 8, 2026.*9:30\sPM/);
  });

  it("builds the Arabic email right-to-left with translated names", () => {
    const email = buildOrderConfirmationEmail(order, Languages.ARABIC, "Asia/Riyadh");
    expect(email.subject).toBe("مطعم الدار – تم تأكيد الدفع لطلبك رقم ‎3f2a9c1b");
    expect(email.text).toContain("رقم الطلب: ‎3f2a9c1b\n");
    expect(email.html).toContain('dir="rtl"');
    for (const s of ["شكراً لك! تم الدفع بنجاح", "برجر", "الحجم: كبير", "الإضافات: جبن، فلفل", "Salad", "الإجمالي المدفوع", "$36.00"]) {
      expect(email.html).toContain(s);
    }
  });

  it("escapes customer-provided text in the HTML", () => {
    const email = buildOrderConfirmationEmail(order, Languages.ENGLISH);
    expect(email.html).not.toContain("<b>Bldg 7</b>");
    expect(email.html).toContain("&lt;b&gt;Bldg 7&lt;/b&gt;");
    // empty address parts are not printed as stray commas
    expect(email.text).toContain("Address: King Fahd Rd <b>Bldg 7</b>, Riyadh, 12345\n");
  });
});
