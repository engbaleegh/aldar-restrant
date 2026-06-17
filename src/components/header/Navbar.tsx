"use client";

import { Routes } from "@/constants/enums";
import Link from "../link";
import { Button } from "../ui/button";
import { useState } from "react";
import { Menu, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import AuthButtons from "./auth-buttons";
import LanguageSwitcher from "./language-switcher";
import ThemeToggle from "./theme-toggle";
import { Translations } from "@/types/translations";
import { Session } from "next-auth";
import { useClientSession } from "@/hooks/useClientSession";
import { UserRole } from "@/generated/prisma";
import { useLocale, localizedPath } from "@/hooks/useLocale";

const NAV_LINKS = [
  { titleKey: "home" as const, href: "" },
  { titleKey: "menu" as const, href: Routes.MENU },
  { titleKey: "about" as const, href: Routes.ABOUT },
  { titleKey: "contact" as const, href: Routes.CONTACT },
];

function Navbar({
  translations,
  initialSession,
}: {
  translations: Translations;
  initialSession: Session | null;
}) {
  const session = useClientSession(initialSession);
  const [openMenu, setOpenMenu] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();

  const links = NAV_LINKS.map((link) => ({
    ...link,
    title: translations.navbar[link.titleKey],
    href: link.href ? localizedPath(locale, link.href) : `/${locale}`,
  }));

  const isAdmin = session.data?.user.role === UserRole.ADMIN;

  return (
    <nav className="order-last lg:order-none">
      <Button
        variant="secondary"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpenMenu(true)}
        aria-label="Open menu"
      >
        <Menu className="!w-6 !h-6" />
      </Button>
      <ul
        className={`fixed lg:static ${
          openMenu ? "left-0 z-50" : "-left-full"
        } top-0 px-10 py-20 lg:p-0 bg-gray-200 dark:bg-gray-800 lg:bg-transparent transition-all duration-200 h-full lg:h-auto flex-col lg:flex-row w-full lg:w-auto flex items-start lg:items-center gap-10`}
      >
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-10 right-10 lg:hidden"
          onClick={() => setOpenMenu(false)}
          aria-label="Close menu"
        >
          <XIcon className="!w-6 !h-6" />
        </Button>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              onClick={() => setOpenMenu(false)}
              href={link.href}
              className={`hover:text-primary duration-200 transition-colors font-semibold ${
                pathname.startsWith(link.href)
                  ? "text-primary"
                  : "text-accent"
              }`}
            >
              {link.title}
            </Link>
          </li>
        ))}
        {session.data?.user && (
          <li>
            <Link
              href={
                isAdmin
                  ? localizedPath(locale, Routes.ADMIN)
                  : localizedPath(locale, Routes.PROFILE)
              }
              onClick={() => setOpenMenu(false)}
              className={`${
                pathname.startsWith(
                  isAdmin
                    ? localizedPath(locale, Routes.ADMIN)
                    : localizedPath(locale, Routes.PROFILE)
                )
                  ? "text-primary"
                  : "text-accent"
              } hover:text-primary duration-200 transition-colors font-semibold`}
            >
              {isAdmin
                ? translations.navbar.admin
                : translations.navbar.profile}
            </Link>
          </li>
        )}
        <li className="lg:hidden flex flex-col gap-4">
          <div onClick={() => setOpenMenu(false)}>
            <AuthButtons
              translations={translations}
              initialSession={initialSession}
            />
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
