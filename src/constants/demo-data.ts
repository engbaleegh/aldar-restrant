export const DEMO_PRODUCTS = [
  {
    id: "demo-margherita",
    name: "Margherita Supreme",
    description: "Fresh mozzarella, basil, and San Marzano tomatoes on our signature crust.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80b002?w=600&h=600&fit=crop",
    basePrice: 14.99,
    sizes: [
      { id: "s1", name: "SMALL" as const, price: 0, productId: "demo-margherita" },
      { id: "s2", name: "MEDIUM" as const, price: 2, productId: "demo-margherita" },
      { id: "s3", name: "LARGE" as const, price: 4, productId: "demo-margherita" },
    ],
    extras: [
      { id: "e1", name: "CHEESE" as const, price: 1.5, productId: "demo-margherita" },
      { id: "e2", name: "BACON" as const, price: 2, productId: "demo-margherita" },
    ],
  },
  {
    id: "demo-pepperoni",
    name: "Pepperoni Classic",
    description: "Double pepperoni, melted mozzarella, and our house tomato sauce.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=600&fit=crop",
    basePrice: 16.99,
    sizes: [
      { id: "s4", name: "SMALL" as const, price: 0, productId: "demo-pepperoni" },
      { id: "s5", name: "MEDIUM" as const, price: 2, productId: "demo-pepperoni" },
      { id: "s6", name: "LARGE" as const, price: 4, productId: "demo-pepperoni" },
    ],
    extras: [
      { id: "e3", name: "CHEESE" as const, price: 1.5, productId: "demo-pepperoni" },
    ],
  },
  {
    id: "demo-truffle",
    name: "Truffle Mushroom",
    description: "Wild mushrooms, truffle oil, and aged parmesan on a thin crust.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop",
    basePrice: 19.99,
    sizes: [
      { id: "s7", name: "SMALL" as const, price: 0, productId: "demo-truffle" },
      { id: "s8", name: "MEDIUM" as const, price: 3, productId: "demo-truffle" },
      { id: "s9", name: "LARGE" as const, price: 5, productId: "demo-truffle" },
    ],
    extras: [],
  },
  {
    id: "demo-bbq",
    name: "BBQ Chicken",
    description: "Grilled chicken, smoky BBQ sauce, red onions, and cilantro.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop",
    basePrice: 17.99,
    sizes: [
      { id: "s10", name: "MEDIUM" as const, price: 0, productId: "demo-bbq" },
      { id: "s11", name: "LARGE" as const, price: 3, productId: "demo-bbq" },
    ],
    extras: [
      { id: "e4", name: "ONION" as const, price: 1, productId: "demo-bbq" },
    ],
  },
];

export const DEMO_CATEGORIES = [
  { id: "cat-classic", name: "Classic Pizzas", count: 12, emoji: "🍕" },
  { id: "cat-specialty", name: "Specialty", count: 8, emoji: "⭐" },
  { id: "cat-pasta", name: "Pasta", count: 6, emoji: "🍝" },
  { id: "cat-salads", name: "Fresh Salads", count: 5, emoji: "🥗" },
  { id: "cat-drinks", name: "Beverages", count: 10, emoji: "🥤" },
  { id: "cat-desserts", name: "Desserts", count: 7, emoji: "🍰" },
];
