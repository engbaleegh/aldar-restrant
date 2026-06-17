import { db } from "@/lib/prisma";
import { Star } from "lucide-react";

const FALLBACK_REVIEWS = [
  { name: "Sarah M.", rating: 5, comment: "Best pizza in town! Fresh ingredients and fast delivery." },
  { name: "Ahmed K.", rating: 5, comment: "Amazing flavors and excellent service. Highly recommended!" },
  { name: "John D.", rating: 4, comment: "Great atmosphere and delicious food. Will come again." },
  { name: "Fatima A.", rating: 5, comment: "The truffle mushroom pizza is absolutely divine!" },
  { name: "Michael R.", rating: 5, comment: "Fast delivery, hot food, perfect every time." },
  { name: "Layla H.", rating: 4, comment: "Love the family combo deal. Great value!" },
];

export default async function ReviewsSection() {
  let display = FALLBACK_REVIEWS;

  try {
    const reviews = await db.review.findMany({
      where: { isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    if (reviews.length > 0) {
      display = reviews.map((r) => ({
        name: r.user.name,
        rating: r.rating,
        comment: r.comment || "",
      }));
    }
  } catch {
    // use fallback
  }

  return (
    <section className="section-gap bg-gradient-to-b from-muted/30 to-transparent">
      <div className="container">
        <div className="text-center mb-10">
          <p className="text-primary font-semibold uppercase tracking-wider mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((review, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                &ldquo;{review.comment}&rdquo;
              </p>
              <p className="font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
