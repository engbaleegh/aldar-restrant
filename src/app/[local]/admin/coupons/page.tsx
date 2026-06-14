import { Pages, Routes } from "@/constants/enums";
import { UserRole } from "@/generated/prisma";
import { Locale } from "@/i18n.config";
import { authOptions } from "@/server/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminCouponsPage({
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

  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main>
      <section className="section-gap">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Coupons</h1>
          <div className="grid gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <code className="font-bold text-primary">{c.code}</code>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
                <span>{c.discountValue}{c.discountType === "PERCENTAGE" ? "%" : "$"} off</span>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">
                No coupons. Run <code>npm run db:seed</code> to add sample data.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
