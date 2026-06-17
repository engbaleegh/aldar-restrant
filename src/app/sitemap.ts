import type { MetadataRoute } from "next";
import { i18n } from "@/i18n.config";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://aldar-restrant.vercel.app";

const routes = ["", "menu", "about", "contact", "cart", "reservations", "auth/signin", "auth/signup"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of i18n.locales) {
    for (const route of routes) {
      entries.push({
        url: `${baseUrl}/${locale}${route ? `/${route}` : ""}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
