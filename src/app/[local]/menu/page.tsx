import Menu from "@/components/menu";
import { DEMO_PRODUCTS } from "@/constants/demo-data";
import { getProductsByCategory } from "@/server/db/products";
import { Locale } from "@/i18n.config";

async function MenuPage({
  params,
}: {
  params: Promise<{ local: string }>;
}) {
  const { local } = await params;
  const locale = local as Locale;

  let categories: Awaited<ReturnType<typeof getProductsByCategory>> = [];

  try {
    categories = await getProductsByCategory();
  } catch {
    // DB unavailable
  }

  if (categories.length === 0) {
    return (
      <main>
        <section className="section-gap">
          <div className="container text-center">
            <h1 className="text-primary font-bold text-4xl italic mb-2">
              Our Menu
            </h1>
            <p className="text-muted-foreground mb-10">
              Explore our delicious selection
            </p>
            <Menu items={DEMO_PRODUCTS as Parameters<typeof Menu>[0]["items"]} />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {categories.map((category) => (
        <section key={category.id} className="section-gap">
          <div className="container text-center">
            <h1 className="text-primary font-bold text-4xl italic mb-6">
              {category.name}
            </h1>
            <Menu items={category.products} />
          </div>
        </section>
      ))}
    </main>
  );
}

export default MenuPage;
