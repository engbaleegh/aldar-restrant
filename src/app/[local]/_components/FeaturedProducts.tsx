import Menu from "@/components/menu";
import { getFeaturedProducts } from "@/server/db/products";
import Link from "@/components/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";

export default async function FeaturedProducts() {
  const locale = await getCurrentLocale();
  const products = await getFeaturedProducts(8);

  if (products.length === 0) return null;

  return (
    <section className="section-gap">
      <div className="container text-center">
        <h2 className="text-primary font-bold text-4xl italic mb-2">Featured</h2>
        <p className="text-muted-foreground mb-8">Hand-picked favorites from our kitchen</p>
        <Menu items={products} />
        <Link
          href={`/${locale}/menu`}
          className="inline-block mt-8 text-primary font-semibold hover:underline"
        >
          View Full Menu →
        </Link>
      </div>
    </section>
  );
}
