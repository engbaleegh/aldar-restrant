/**
 * Server-side cart pricing. Prices always come from the database, never from
 * the client, and include the selected size and extras (the same formula the
 * cart page uses in `getItemUnitPrice`).
 *
 * Amounts are computed in cents to avoid floating-point drift.
 */

export type CheckoutCartItem = {
  id: string;
  quantity: number;
  sizeId?: string | null;
  extraIds?: string[] | null;
};

export type PricingProduct = {
  id: string;
  name: string;
  basePrice: number;
  sizes: { id: string; name: string; price: number }[];
  extras: { id: string; name: string; price: number }[];
};

export type PricedLine = {
  productId: string;
  /** Name shown on the Stripe checkout page, e.g. "Margherita (LARGE) + CHEESE". */
  displayName: string;
  unitAmountCents: number;
  quantity: number;
  sizeName: string | null;
  extras: string | null;
};

export type PricingResult =
  | { ok: true; lines: PricedLine[]; subTotalCents: number }
  | { ok: false; unavailableIds: string[] };

export const toCents = (amount: number) => Math.round(amount * 100);

export function priceCart(
  items: CheckoutCartItem[],
  products: PricingProduct[]
): PricingResult {
  const productsById = new Map(products.map((p) => [p.id, p]));
  const unavailable = new Set<string>();
  const lines: PricedLine[] = [];

  for (const item of items) {
    const product = productsById.get(item.id);
    if (!product) {
      unavailable.add(item.id);
      continue;
    }

    const size = item.sizeId
      ? product.sizes.find((s) => s.id === item.sizeId)
      : undefined;
    if (item.sizeId && !size) {
      // The size was removed or changed since the item was added to the cart.
      unavailable.add(item.id);
      continue;
    }

    const extraIds = [...new Set(item.extraIds ?? [])];
    const extras = extraIds.map((id) => product.extras.find((e) => e.id === id));
    if (extras.some((e) => !e)) {
      unavailable.add(item.id);
      continue;
    }
    const validExtras = extras as PricingProduct["extras"];

    const unitAmountCents =
      toCents(product.basePrice) +
      toCents(size?.price ?? 0) +
      validExtras.reduce((sum, e) => sum + toCents(e.price), 0);

    const extrasLabel = validExtras.map((e) => e.name).join(", ");
    let displayName = product.name;
    if (size) displayName += ` (${size.name})`;
    if (extrasLabel) displayName += ` + ${extrasLabel}`;

    lines.push({
      productId: product.id,
      displayName,
      unitAmountCents,
      quantity: item.quantity,
      sizeName: size?.name ?? null,
      extras: extrasLabel || null,
    });
  }

  if (unavailable.size > 0) {
    return { ok: false, unavailableIds: [...unavailable] };
  }

  const subTotalCents = lines.reduce(
    (sum, line) => sum + line.unitAmountCents * line.quantity,
    0
  );
  return { ok: true, lines, subTotalCents };
}
