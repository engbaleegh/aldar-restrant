"use client";

import { i18n } from "@/i18n.config";
import { useLocale } from "@/hooks/useLocale";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || `/${newLocale}`);
  };

  return (
    <div className="flex gap-2" role="group" aria-label="Language switcher">
      {i18n.locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? "default" : "outline"}
          size="sm"
          onClick={() => switchLocale(loc)}
          aria-pressed={locale === loc}
        >
          {loc.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
