import { Pages, Routes } from "@/constants/enums";
import { UserRole } from "@/generated/prisma";
import { Locale } from "@/i18n.config";
import { authOptions } from "@/server/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function AdminReservationsPage({
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

  const reservations = await db.reservation.findMany({
    orderBy: { date: "asc" },
    take: 100,
  });

  return (
    <main>
      <section className="section-gap">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Reservations</h1>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Guest</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Party</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3">{r.guestName}</td>
                    <td className="p-3">{r.guestEmail}</td>
                    <td className="p-3">{r.guestPhone}</td>
                    <td className="p-3">{r.partySize}</td>
                    <td className="p-3">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{r.time}</td>
                    <td className="p-3">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reservations.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">
                No reservations yet
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminReservationsPage;
