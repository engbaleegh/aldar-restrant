import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import AdminTabs from "./_components/AdminTabs";

async function AdminLayout({
  params,
  children,
}: {
  params: Promise<{ local: string }>;
  children: React.ReactNode;
}) {
  const { local: localeStr } = await params;
  const locale = localeStr as Locale;
  const translations = await getTrans(locale);
  return (
    <>
      <AdminTabs translations={translations} />
      {children}
    </>
  );
}

export default AdminLayout;
