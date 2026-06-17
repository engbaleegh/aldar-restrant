import Link from "@/components/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { Percent, Gift, Sparkles, Truck } from "lucide-react";

const OFFERS = [
  {
    icon: Percent,
    title: "20% Off First Order",
    description: "New customers save with code WELCOME10",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders over $30 within 5 miles",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Gift,
    title: "Family Combo",
    description: "2 large pizzas + sides for $39.99",
    color: "from-purple-500 to-indigo-500",
  },
];

export default async function SpecialOffers() {
  const locale = await getCurrentLocale();

  return (
    <section className="section-gap">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
            <Sparkles className="w-5 h-5" />
            Limited Time Offers
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Special Deals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${offer.color} text-white mb-4`}>
                <offer.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
              <p className="text-muted-foreground">{offer.description}</p>
              <Link
                href={`/${locale}/menu`}
                className="inline-block mt-4 text-primary font-semibold group-hover:underline"
              >
                Order Now →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
