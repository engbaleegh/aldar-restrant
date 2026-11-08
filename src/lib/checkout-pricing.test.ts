import { describe, expect, it } from "vitest";
import { getItemUnitPrice, getSubTotal } from "@/lib/cart";
import { priceCart, type PricingProduct } from "@/lib/checkout-pricing";
import type { CartItem } from "@/redux/features/cart/cartSlice";

const pizza: PricingProduct = {
  id: "pizza",
  name: "Margherita",
  basePrice: 14.99,
  sizes: [
    { id: "small", name: "SMALL", price: 0 },
    { id: "large", name: "LARGE", price: 4 },
  ],
  extras: [
    { id: "cheese", name: "CHEESE", price: 1.5 },
    { id: "bacon", name: "BACON", price: 2 },
  ],
};
const salad: PricingProduct = {
  id: "salad",
  name: "Salad",
  basePrice: 5.1,
  sizes: [],
  extras: [],
};

describe("priceCart", () => {
  it("includes size and extras in the unit price", () => {
    const result = priceCart(
      [{ id: "pizza", quantity: 2, sizeId: "large", extraIds: ["cheese", "bacon"] }],
      [pizza]
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines[0]).toMatchObject({
      unitAmountCents: 1499 + 400 + 150 + 200,
      quantity: 2,
      sizeName: "LARGE",
      extras: "CHEESE, BACON",
      displayName: "Margherita (LARGE) + CHEESE, BACON",
    });
    expect(result.subTotalCents).toBe((1499 + 400 + 150 + 200) * 2);
  });

  it("matches the amount shown on the cart page", () => {
    const cart: CartItem[] = [
      {
        id: "pizza",
        name: "Margherita",
        image: "/p.png",
        basePrice: 14.99,
        quantity: 3,
        size: { ...pizza.sizes[1], productId: "pizza" } as CartItem["size"],
        extras: [{ ...pizza.extras[0], productId: "pizza" }] as CartItem["extras"],
      },
      { id: "salad", name: "Salad", image: "/s.png", basePrice: 5.1, quantity: 1 },
    ];
    const result = priceCart(
      [
        { id: "pizza", quantity: 3, sizeId: "large", extraIds: ["cheese"] },
        { id: "salad", quantity: 1 },
      ],
      [pizza, salad]
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.subTotalCents).toBe(Math.round(getSubTotal(cart) * 100));
    expect(getItemUnitPrice(cart[0])).toBeCloseTo(20.49);
  });

  it("ignores duplicated extras", () => {
    const result = priceCart(
      [{ id: "pizza", quantity: 1, extraIds: ["cheese", "cheese"] }],
      [pizza]
    );
    expect(result.ok && result.subTotalCents).toBe(1499 + 150);
  });

  it("reports products that are not in the database (e.g. demo items)", () => {
    const result = priceCart(
      [
        { id: "demo-margherita", quantity: 1 },
        { id: "salad", quantity: 1 },
      ],
      [salad]
    );
    expect(result).toEqual({ ok: false, unavailableIds: ["demo-margherita"] });
  });

  it("reports items whose size or extra no longer exists", () => {
    const result = priceCart(
      [
        { id: "pizza", quantity: 1, sizeId: "deleted-size" },
        { id: "salad", quantity: 1, extraIds: ["deleted-extra"] },
      ],
      [pizza, salad]
    );
    expect(result).toEqual({ ok: false, unavailableIds: ["pizza", "salad"] });
  });
});
