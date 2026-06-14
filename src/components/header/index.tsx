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
    <header className="py-4 md:py-6">
      <div className="container flex items-center justify-between gap-6 lg:gap-10 shadow-md py-2">
        <Link
          href={`/${locale}`}
          className="text-primary font-semibold text-2xl"
        >
          ALDAR
        </Link>
        <Navbar translations={translations} initialSession={initialSession} />
        <div className="flex items-center gap-6 flex-1 justify-end">
          <div className="hidden lg:flex lg:items-center lg:gap-6 ">
            <AuthButtons
              translations={translations}
              initialSession={initialSession}
            />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <CartButton />
        </div>
      </div>
    </header>
  );
}

export default Header;

// import { Routes } from "@/constants/enums";
// import Link from "../link"
// import Navbar from "./Navbar";
// import CartButton from "./cart-button";
// async function Header() {

//   return (
//     <header className="py-4 md:py-6">
//       <div className="container flex items-center justify-between gap-6 lg:gap-10">
//         <Link
//           href={Routes.ROOT}
//           className="text-primary font-semibold text-2xl"
//         >
//           🍕 Pizza
//         </Link>
//         <Navbar />
//         <CartButton />
//       </div>
//     </header>
//   );
// }

// export default Header;
