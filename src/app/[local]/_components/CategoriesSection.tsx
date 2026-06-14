import Link from "@/components/link";
import { db } from "@/lib/prisma";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import Image from "next/image";

export default async function CategoriesSection() {
  const locale = await getCurrentLocale();
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 6,
    include: { _count: { select: { products: true } } },
  });

  if (categories.length === 0) return null;

  return (
    <section className="section-gap">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-10">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/menu?category=${cat.id}`}
              className="group p-4 rounded-xl border bg-card hover:border-primary transition-colors text-center"
            >
              {cat.image ? (
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover rounded-full" />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  🍽️
                </div>
              )}
              <h3 className="font-semibold group-hover:text-primary">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{cat._count.products} items</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
