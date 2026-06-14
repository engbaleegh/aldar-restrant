import { db } from "@/lib/prisma";
import { Star } from "lucide-react";

export default async function ReviewsSection() {
  const reviews = await db.review.findMany({
    where: { isApproved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const fallback = [
    { name: "Sarah M.", rating: 5, comment: "Best pizza in town! Fresh ingredients and fast delivery." },
    { name: "Ahmed K.", rating: 5, comment: "Amazing flavors and excellent service. Highly recommended!" },
    { name: "John D.", rating: 4, comment: "Great atmosphere and delicious food. Will come again." },
  ];

  const display = reviews.length > 0
    ? reviews.map((r) => ({ name: r.user.name, rating: r.rating, comment: r.comment || "" }))
    : fallback;

  return (
    <section className="section-gap">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {display.map((review, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card shadow-sm">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">&ldquo;{review.comment}&rdquo;</p>
              <p className="font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
