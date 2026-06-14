import { Pages, Routes } from "@/constants/enums";
import { UserRole } from "@/generated/prisma";
import { Locale } from "@/i18n.config";
import { authOptions } from "@/server/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ local: string }>;
}) {
  const { local: localeStr } = await params;
  const locale = localeStr as Locale;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
  }

  const settings = await db.setting.findMany({ orderBy: { key: "asc" } });

  return (
    <main>
      <section className="section-gap">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="grid gap-4">
            {settings.map((s) => (
              <div key={s.id} className="p-4 border rounded-lg flex justify-between">
                <span className="font-medium">{s.key}</span>
                <span className="text-muted-foreground">{s.value}</span>
              </div>
            ))}
            {settings.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">
                No settings configured. Run seed to initialize defaults.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
