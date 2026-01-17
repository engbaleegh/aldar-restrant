import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import { getProduct, getProducts } from "@/server/db/products";
import { redirect } from "next/navigation";
import Form from "../../_components/Form";
import { getCategories } from "@/server/db/categories";
import getTrans from "@/lib/translation";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((product) => ({ productId: product.id }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
async function EditProductPage({
  params,
}: {
  params: Promise<{ local: string; productId: string }>;
}) {
  const { productId, local: localeStr } = await params;
  const locale = localeStr as Locale;
  const translations = await getTrans(locale);
  const product = await getProduct(productId);
  const categories = await getCategories();

  if (!product) {
    redirect(`/${locale}/${Routes.ADMIN}/${Pages.MENU_ITEMS}`);
  }

  return (
    <main>
      <section>
        <div className="container">
          <Form
            categories={categories}
            translations={translations}
            product={product}
          />
        </div>
      </section>
    </main>
  );
}

export default EditProductPage;
