import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Routes } from "@/constants/enums";
import { ArrowRight, Clock, Star, Truck } from "lucide-react";
import Image from "next/image";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";

async function Hero() {
  const locale = await getCurrentLocale();
  const t = await getTrans(locale);

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-orange-950/20 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl -z-10" />

      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
              <Star className="w-4 h-4 fill-primary" />
              Premium Restaurant &amp; Delivery
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-primary">Aldar</span> Restaurant
              <br />
              <span className="text-foreground/80 text-3xl md:text-4xl lg:text-5xl">
                {t.home.hero.title}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t.home.hero.description}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 py-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">30 min</p>
                  <p className="text-xs text-muted-foreground">Fast Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">4.9/5</p>
                  <p className="text-xs text-muted-foreground">2,000+ Reviews</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">11am–11pm</p>
                  <p className="text-xs text-muted-foreground">Open Daily</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/${locale}/${Routes.MENU}`}
                className={`${buttonVariants({ size: "lg" })} !px-8 !rounded-full gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow`}
              >
                {t.home.hero.orderNow}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/reservations`}
                className={`${buttonVariants({ variant: "outline", size: "lg" })} !px-8 !rounded-full`}
              >
                Book a Table
              </Link>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-150">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-4 bg-primary/20 rounded-3xl rotate-6" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                <Image
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=800&fit=crop"
                  alt="Aldar Restaurant premium pizza"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border">
                <p className="text-sm text-muted-foreground">Today&apos;s Special</p>
                <p className="text-2xl font-bold text-primary">20% OFF</p>
                <p className="text-xs text-muted-foreground">Use code WELCOME10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
