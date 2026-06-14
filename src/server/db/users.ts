import { cache } from "@/lib/cache";
import { db } from "@/lib/prisma";

export const getUsers = cache(
  () => {
    return db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["users"],
  { revalidate: 60, tags: ["users"] }
);

export const getUser = cache(
  (userId: string) => {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phone: true,
        streetAddress: true,
        postalCode: true,
        city: true,
        country: true,
        createdAt: true,
      },
    });
  },
  ["user-detail"],
  { revalidate: 60, tags: ["users"] }
);

export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      products: {
        include: { Product: { select: { name: true, image: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
