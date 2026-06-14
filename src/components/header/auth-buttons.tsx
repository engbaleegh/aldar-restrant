"use client";

import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { Translations } from "@/types/translations";
import { usePathname, useRouter } from "next/navigation";
import { Pages, Routes } from "@/constants/enums";
import { useClientSession } from "@/hooks/useClientSession";
import { Session } from "next-auth";
import { useLocale, localizedPath } from "@/hooks/useLocale";

function AuthButtons({
  initialSession,
  translations,
}: {
  initialSession: Session | null;
  translations: Translations;
}) {
  const session = useClientSession(initialSession);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const loginPath = localizedPath(locale, `${Routes.AUTH}/${Pages.LOGIN}`);
  const registerPath = localizedPath(
    locale,
    `${Routes.AUTH}/${Pages.Register}`
  );

  return (
    <div>
      {session.data?.user && (
        <div className="flex items-center gap-10">
          <Button
            className="!px-8 !rounded-full"
            size="lg"
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
          >
            {translations.navbar.signOut}
          </Button>
        </div>
      )}
      {!session.data?.user && (
        <div className="flex items-center gap-6">
          <Button
            className={`${
              pathname.startsWith(loginPath)
                ? "text-primary"
                : "text-accent"
            } hover:text-primary duration-200 transition-colors font-semibold hover:no-underline !px-0`}
            size="lg"
            variant="link"
            onClick={() => router.push(loginPath)}
          >
            {translations.navbar.login}
          </Button>
          <Button
            className="!px-8 !rounded-full"
            size="lg"
            onClick={() => router.push(registerPath)}
          >
            {translations.navbar.register}
          </Button>
        </div>
      )}
    </div>
  );
}

export default AuthButtons;
