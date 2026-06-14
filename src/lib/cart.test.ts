import { describe, it, expect } from "vitest";
import { getSubTotal, deliveryFee, getTotalAmount } from "@/lib/cart";
import type { CartItem } from "@/redux/features/cart/cartSlice";

const sampleCart: CartItem[] = [
  {
    id: "1",
    name: "Pizza",
    image: "/test.jpg",
    basePrice: 10,
    quantity: 2,
  },
  {
    id: "2",
    name: "Salad",
    image: "/test2.jpg",
    basePrice: 5,
    quantity: 1,
  },
];

describe("cart utilities", () => {
  it("calculates subtotal correctly", () => {
    expect(getSubTotal(sampleCart)).toBe(25);
  });

  it("calculates total with delivery fee", () => {
    expect(getTotalAmount(sampleCart)).toBe(25 + deliveryFee);
  });

  it("handles empty cart", () => {
    expect(getSubTotal([])).toBe(0);
    expect(getTotalAmount([])).toBe(deliveryFee);
  });
});
