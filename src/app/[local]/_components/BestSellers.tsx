import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { DEMO_PRODUCTS } from "@/constants/demo-data";
import { getBestSellers, getProducts } from "@/server/db/products";
import type { Product, Size, Extra } from "@/generated/prisma";

type MenuProduct = Product & { sizes: Size[]; extras: Extra[] };

async function BestSellers() {
  let bestSellers: MenuProduct[] = DEMO_PRODUCTS as unknown as MenuProduct[];

  try {
    let dbProducts: MenuProduct[] = await getBestSellers(3);
    // No orders yet: show real products rather than demo ones (demo products
    // cannot be purchased).
    if (dbProducts.length === 0) dbProducts = (await getProducts()).slice(0, 3);
    if (dbProducts.length > 0) bestSellers = dbProducts;
  } catch {
    // use demo data
  }

  return (
    <section className="section-gap">
      <div className="container">
        <div className="text-center mb-10">
          <MainHeading subTitle="Customer Favorites" title="Best Sellers" />
        </div>
        <Menu items={bestSellers} />
      </div>
    </section>
  );
}

export default BestSellers;
