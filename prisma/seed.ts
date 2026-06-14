import { PrismaClient, ProductSizes, ExtraIngredients, UserRole } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aldar.com" },
    update: {},
    create: {
      email: "admin@aldar.com",
      password: adminPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      phone: "+1234567890",
      city: "Riyadh",
      country: "Saudi Arabia",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@aldar.com" },
    update: {},
    create: {
      email: "customer@aldar.com",
      password: userPassword,
      name: "Test Customer",
      role: UserRole.USER,
    },
  });

  const classic = await prisma.category.upsert({
    where: { id: "seed-classic" },
    update: {},
    create: {
      id: "seed-classic",
      name: "Classic Pizzas",
      nameAr: "بيتزا كلاسيكية",
      description: "Traditional favorites",
      order: 1,
    },
  });

  const specialty = await prisma.category.upsert({
    where: { id: "seed-specialty" },
    update: {},
    create: {
      id: "seed-specialty",
      name: "Specialty Pizzas",
      nameAr: "بيتزا مميزة",
      description: "Chef's special creations",
      order: 2,
    },
  });

  const products = [
    {
      id: "seed-margherita",
      name: "Margherita",
      nameAr: "مارغريتا",
      description: "Fresh tomato, mozzarella, and basil",
      descriptionAr: "طماطم طازجة، موزاريلا، وريحان",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80b002?w=400",
      basePrice: 12.99,
      categoryId: classic.id,
      isFeatured: true,
      isNew: false,
    },
    {
      id: "seed-pepperoni",
      name: "Pepperoni",
      nameAr: "بيبروني",
      description: "Classic pepperoni with mozzarella",
      descriptionAr: "بيبروني كلاسيكي مع موزاريلا",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
      basePrice: 14.99,
      categoryId: classic.id,
      isFeatured: true,
      isNew: false,
    },
    {
      id: "seed-truffle",
      name: "Truffle Mushroom",
      nameAr: "فطر الكمأة",
      description: "Wild mushrooms with truffle oil",
      descriptionAr: "فطر بري مع زيت الكمأة",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      basePrice: 18.99,
      categoryId: specialty.id,
      isFeatured: true,
      isNew: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...p,
        sizes: {
          create: [
            { name: ProductSizes.SMALL, price: 0 },
            { name: ProductSizes.MEDIUM, price: 2 },
            { name: ProductSizes.LARGE, price: 4 },
          ],
        },
        extras: {
          create: [
            { name: ExtraIngredients.CHEESE, price: 1.5 },
            { name: ExtraIngredients.BACON, price: 2 },
          ],
        },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 20,
      maxUses: 1000,
    },
  });

  await prisma.setting.upsert({
    where: { key: "delivery_fee" },
    update: {},
    create: { key: "delivery_fee", value: "5" },
  });

  await prisma.setting.upsert({
    where: { key: "tax_rate" },
    update: {},
    create: { key: "tax_rate", value: "0.08" },
  });

  await prisma.review.createMany({
    data: [
      { userId: admin.id, rating: 5, comment: "Excellent food quality!", isApproved: true },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
