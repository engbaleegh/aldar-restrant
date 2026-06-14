"use client";

import { i18n, Locale } from "@/i18n.config";
import { useParams } from "next/navigation";

export function useLocale(): Locale {
  const params = useParams();
  const local = params?.local as string | undefined;
  if (local && i18n.locales.includes(local as Locale)) {
    return local as Locale;
  }
  return i18n.defaultLocale;
}

export function localizedPath(locale: string, path: string): string {
  const normalized = path.replace(/^\//, "");
  if (!normalized) return `/${locale}`;
  return `/${locale}/${normalized}`;
}
