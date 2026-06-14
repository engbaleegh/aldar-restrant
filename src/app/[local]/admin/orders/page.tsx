import { OrderStatus, UserRole } from "@/generated/prisma";
import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import { authOptions } from "@/server/auth";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/formatters";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function AdminOrdersPage({
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

  const orders = await db.order.findMany({
    include: {
      products: {
        include: { Product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    total: orders.length,
    revenue: orders.filter((o) => o.paid).reduce((s, o) => s + o.totalPrice, 0),
    pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
  };

  return (
    <main>
      <section className="section-gap">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Orders</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                    <td className="p-3">{order.userEmail}</td>
                    <td className="p-3">{formatCurrency(order.totalPrice)}</td>
                    <td className="p-3">{order.status}</td>
                    <td className="p-3">{order.paid ? "Yes" : "No"}</td>
                    <td className="p-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminOrdersPage;
