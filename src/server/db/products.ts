import { cache } from "@/lib/cache";
import { db } from "@/lib/prisma";

export const getProductsByCategory = cache(
  () => {
    return db.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            sizes: true,
            extras: true,
            images: { orderBy: { order: "asc" } },
          },
        },
      },
    });
  },
  ["products-by-category"],
  { revalidate: 60, tags: ["products"] }
);

export const getBestSellers = cache(
  (limit = 6) => {
    return db.product.findMany({
      where: {
        isActive: true,
        orders: { some: {} },
      },
      orderBy: {
        orders: { _count: "desc" },
      },
      include: {
        sizes: true,
        extras: true,
      },
      take: limit,
    });
  },
  ["best-sellers"],
  { revalidate: 60, tags: ["products"] }
);

export const getFeaturedProducts = cache(
  (limit = 8) => {
    return db.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { order: "asc" },
      include: { sizes: true, extras: true },
      take: limit,
    });
  },
  ["featured-products"],
  { revalidate: 60, tags: ["products"] }
);

export const getNewArrivals = cache(
  (limit = 8) => {
    return db.product.findMany({
      where: { isActive: true, isNew: true },
      orderBy: { createdAt: "desc" },
      include: { sizes: true, extras: true },
      take: limit,
    });
  },
  ["new-arrivals"],
  { revalidate: 60, tags: ["products"] }
);

export const getProducts = cache(
  () => {
    return db.product.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { sizes: true, extras: true, Category: true },
    });
  },
  ["products"],
  { revalidate: 60, tags: ["products"] }
);

export const getProduct = cache(
  (id: string) => {
    return db.product.findUnique({
      where: { id },
      include: {
        sizes: true,
        extras: true,
        images: true,
        Category: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, image: true } } },
          take: 10,
        },
      },
    });
  },
  ["product-detail"],
  { revalidate: 60, tags: ["products"] }
);

export async function searchProducts(query: string, categoryId?: string) {
  return db.product.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { nameAr: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { sizes: true, extras: true, Category: true },
    orderBy: { order: "asc" },
  });
}
