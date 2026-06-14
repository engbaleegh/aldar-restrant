import type { Metadata } from "next";
import { Locale } from "@/i18n.config";
import { Directions, Languages } from "@/constants/enums";

import { Toaster } from "@/components/ui/toaster";
import NextAuthSessionProvider from "@/providers/NextAuthSessionProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

export async function generateStaticParams() {
  return [{ local: Languages.ARABIC }, { local: Languages.ENGLISH }];
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ local: string }>;
}): Promise<Metadata> {
  const { local } = await params;
  const isAr = local === Languages.ARABIC;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://aldar-restaurant.vercel.app";

  return {
    title: {
      default: isAr ? "مطعم الدار | طلب أونلاين" : "Aldar Restaurant | Order Online",
      template: isAr ? "%s | مطعم الدار" : "%s | Aldar Restaurant",
    },
    description: isAr
      ? "اطلب أشهى الأطباق من مطعم الدار. توصيل سريع وحجز طاولات."
      : "Order delicious food from Aldar Restaurant. Fast delivery and table reservations.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: "Aldar Restaurant",
      description: "Premium restaurant & online ordering",
      type: "website",
      locale: isAr ? "ar_SA" : "en_US",
      siteName: "Aldar Restaurant",
    },
    twitter: {
      card: "summary_large_image",
      title: "Aldar Restaurant",
      description: "Premium restaurant & online ordering",
    },
    alternates: {
      canonical: `/${local}`,
      languages: {
        en: "/en",
        ar: "/ar",
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ local: string }>;
}>) {
  const locale = (await params).local as Locale;
  return (
    <html
      lang={locale}
      dir={locale === Languages.ARABIC ? Directions.RTL : Directions.LTR}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: "Aldar Restaurant",
              servesCuisine: "International",
              url: process.env.NEXT_PUBLIC_BASE_URL,
              priceRange: "$$",
            }),
          }}
        />
      </head>
      <body>
        <NextAuthSessionProvider>
          <ThemeProvider>
            <ReduxProvider>
              <Header />
              {children}
              <Footer />
              <Toaster />
            </ReduxProvider>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
