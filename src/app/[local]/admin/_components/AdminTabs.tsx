"use client";

import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Pages, Routes } from "@/constants/enums";
import { Translations } from "@/types/translations";
import { usePathname } from "next/navigation";
import { useLocale, localizedPath } from "@/hooks/useLocale";

const ADMIN_TABS = [
  { titleKey: "profile" as const, href: Routes.ADMIN },
  {
    titleKey: "categories" as const,
    href: `${Routes.ADMIN}/${Pages.CATEGORIES}`,
  },
  {
    titleKey: "menuItems" as const,
    href: `${Routes.ADMIN}/${Pages.MENU_ITEMS}`,
  },
  { titleKey: "users" as const, href: `${Routes.ADMIN}/${Pages.USERS}` },
  { titleKey: "orders" as const, href: `${Routes.ADMIN}/${Pages.ORDERS}` },
  {
    titleKey: "reservations" as const,
    href: `${Routes.ADMIN}/reservations`,
  },
  { titleKey: "coupons" as const, href: `${Routes.ADMIN}/coupons` },
  { titleKey: "settings" as const, href: `${Routes.ADMIN}/settings` },
];

function AdminTabs({ translations }: { translations: Translations }) {
  const pathname = usePathname();
  const locale = useLocale();

  const tabs = ADMIN_TABS.map((tab) => ({
    ...tab,
    title: translations.admin.tabs[tab.titleKey] ?? tab.titleKey,
    fullHref: localizedPath(locale, tab.href),
  }));

  const isActiveTab = (fullHref: string, href: string) => {
    if (href === Routes.ADMIN) {
      return pathname === fullHref;
    }
    return pathname.startsWith(fullHref);
  };

  return (
    <nav className="mt-20" aria-label="Admin navigation">
      <ul className="flex items-center flex-wrap gap-4 justify-center">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.fullHref}
              className={`hover:!bg-orange-600 ${
                isActiveTab(tab.fullHref, tab.href)
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "outline" })
              }`}
            >
              {tab.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default AdminTabs;
