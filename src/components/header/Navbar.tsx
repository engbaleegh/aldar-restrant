"use client";

import { Routes } from "@/constants/enums";
import Link from "../link";
import { Button } from "../ui/button";
import { useState } from "react";
import { Menu, XIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import AuthButtons from "./auth-buttons";
// import LanguageSwitcher from "./language-switcher";
import { Translations } from "@/types/translations";
import { Session } from "next-auth";
import { useClientSession } from "@/hooks/useClientSession";
import { UserRole } from "@/generated/prisma";


function Navbar({
  translations,
  initialSession,
}: {
  translations: Translations;
  initialSession: Session | null;
}) {

    // const params = useParams();

  
  
  const session = useClientSession(initialSession);

  const [openMenu, setOpenMenu] = useState(false);
  const  {locale}  = useParams();
  const pathname = usePathname();

// console.log('جميع البارامترات:', params);
//   console.log('المسار الكامل:', pathname);

  const links = [
    {
      id: crypto.randomUUID(),
      title: translations.navbar.menu,
      href: Routes.MENU,
    },
    {
      id: crypto.randomUUID(),
      title: translations.navbar.about,
      href: Routes.ABOUT,
    },
    {
      id: crypto.randomUUID(),
      title: translations.navbar.contact,
      href: Routes.CONTACT,
    },
  ];
  const isAdmin = session.data?.user.role === UserRole.ADMIN;
  return (
    <nav className="order-last lg:order-none">
      <Button
        variant="secondary"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpenMenu(true)}
      >
        <Menu className="!w-6 !h-6" />
      </Button>
      <ul
        className={`fixed lg:static ${
          openMenu ? "left-0 z-50" : "-left-full"
        } top-0 px-10 py-20 lg:p-0 bg-background lg:bg-transparent transition-all duration-200 h-full lg:h-auto flex-col lg:flex-row w-full lg:w-auto flex items-start lg:items-center gap-10`}
      >
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-10 right-10 lg:hidden"
          onClick={() => setOpenMenu(false)}
        >
          <XIcon className="!w-6 !h-6" />
        </Button>
        {links.map((link) => (
          <li key={link.id}>
            <Link
              onClick={() => setOpenMenu(false)}
              href={`/${link.href}`}
              className={`hover:text-primary duration-200 transition-colors font-semibold ${
                pathname.startsWith(`/${locale}/${link.href}`)
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
                  ? `/${Routes.ADMIN}`
                  : `/${Routes.PROFILE}`
              }
              onClick={() => setOpenMenu(false)}
              className={`${
                pathname.startsWith(
                  isAdmin
                    ? `/${Routes.ADMIN}`
                    : `/${Routes.PROFILE}`
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
          {/* <LanguageSwitcher /> */}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
// "use client";

// import { Routes } from "@/constants/enums";
// import Link from "../link";
// import { Button } from "../ui/button";
// import { Menu, XIcon } from "lucide-react";
// import { useState } from "react";

// function Navbar() {
//   const [openMenu, setOpenMenu] = useState(false);
//   const links = [
//     {
//       id: crypto.randomUUID(),
//       title: "Menu",
//       href: Routes.MENU,
//     },
//     {
//       id: crypto.randomUUID(),
//       title: "About",
//       href: Routes.ABOUT,
//     },
//     {
//       id: crypto.randomUUID(),
//       title: "Contact",
//       href: Routes.CONTACT,
//     },
//   ];
//   return (
//     <nav className="flex-1 justify-end flex">
//       <Button
//         variant="secondary"
//         size="sm"
//         className="lg:hidden"
//         onClick={() => setOpenMenu(true)}
//       >
//         <Menu className="!w-6 !h-6" />
//       </Button>
//       <ul className={`fixed lg:static ${
//           openMenu ? "left-0 z-50" : "-left-full"
//         } top-0 px-10 py-20 lg:p-0 bg-gray-200 lg:bg-transparent transition-all duration-200 h-full lg:h-auto flex-col lg:flex-row w-full lg:w-auto flex items-start lg:items-center gap-10`}>
//                 <Button
//           variant="secondary"
//           size="sm"
//           className="absolute top-10 right-10 lg:hidden"
//           onClick={() => setOpenMenu(false)}
//         >
//           <XIcon className="!w-6 !h-6" />
//         </Button>
//         {links.map((link) => (
//           <li key={link.id}>
//             <Link
//               href={`/${link.href}`}
//               className="hover:text-primary duration-200 transition-colors font-semibold"
//             >
//               {link.title}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </nav>
//   );
// }

// export default Navbar;
