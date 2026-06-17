import Link from "../link";
import Navbar from "./Navbar";
import CartButton from "./cart-button";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import ThemeToggle from "./theme-toggle";
import LanguageSwitcher from "./language-switcher";
import AuthButtons from "./auth-buttons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

async function Header() {
  const locale = await getCurrentLocale();
  const initialSession = await getServerSession(authOptions);
  const translations = await getTrans(locale);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between gap-4 py-3 md:py-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl">🍽️</span>
          <span className="text-primary font-bold text-xl md:text-2xl tracking-tight group-hover:opacity-80 transition-opacity">
            ALDAR
          </span>
        </Link>

        <Navbar translations={translations} initialSession={initialSession} />

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${locale}/reservations`}
            className="hidden md:inline-flex text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Reserve
          </Link>
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <AuthButtons
              translations={translations}
              initialSession={initialSession}
            />
          </div>
          <CartButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
