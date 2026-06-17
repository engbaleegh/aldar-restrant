import Menu from "@/components/menu";
import { DEMO_PRODUCTS } from "@/constants/demo-data";
import { getFeaturedProducts } from "@/server/db/products";
import Link from "@/components/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import type { Product, Size, Extra } from "@/generated/prisma";

type MenuProduct = Product & { sizes: Size[]; extras: Extra[] };

export default async function FeaturedProducts() {
  const locale = await getCurrentLocale();
  let products: MenuProduct[] = DEMO_PRODUCTS.slice(0, 4) as unknown as MenuProduct[];

  try {
    const dbProducts = await getFeaturedProducts(4);
    if (dbProducts.length > 0) products = dbProducts;
  } catch {
    // use demo data
  }

  return (
    <section className="section-gap">
      <div className="container">
        <div className="text-center mb-10">
          <p className="text-primary font-semibold uppercase tracking-wider mb-2">
            Chef&apos;s Picks
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">Featured Dishes</h2>
        </div>
        <Menu items={products} />
        <div className="text-center mt-10">
          <Link
            href={`/${locale}/menu`}
            className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
          >
            View Full Menu →
          </Link>
        </div>
      </div>
    </section>
  );
}
