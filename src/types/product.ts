import { Prisma } from "@/generated/prisma";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    sizes: true;
    extras: true;
  };
}>;
