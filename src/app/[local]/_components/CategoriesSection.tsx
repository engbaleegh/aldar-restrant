import Link from "@/components/link";
import { DEMO_CATEGORIES } from "@/constants/demo-data";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { db } from "@/lib/prisma";

export default async function CategoriesSection() {
  const locale = await getCurrentLocale();

  let categories: Array<{ id: string; name: string; count: number; emoji?: string }> = [];

  try {
    const dbCategories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 6,
      include: { _count: { select: { products: true } } },
    });
    categories = dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c._count.products,
    }));
  } catch {
    // DB unavailable — use demo data
  }

  if (categories.length === 0) {
    categories = DEMO_CATEGORIES;
  }

  return (
    <section className="section-gap bg-muted/30">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Browse Our Menu
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/menu?category=${cat.id}`}
              className="group p-6 rounded-2xl border bg-card hover:border-primary hover:shadow-lg transition-all duration-300 text-center hover:-translate-y-1"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.emoji || "🍽️"}
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {cat.count} items
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
