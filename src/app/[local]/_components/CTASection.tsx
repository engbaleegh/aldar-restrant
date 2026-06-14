import Link from "@/components/link";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { Button } from "@/components/ui/button";

export default async function CTASection() {
  const locale = await getCurrentLocale();

  return (
    <section className="section-gap bg-primary text-primary-foreground">
      <div className="container text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
        <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
          Fresh ingredients, authentic flavors, delivered to your door. Order now or reserve your table.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href={`/${locale}/menu`}>View Menu</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href={`/${locale}/reservations`}>Book a Table</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
