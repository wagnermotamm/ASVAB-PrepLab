import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <article className="max-w-3xl space-y-4">
      <h1 className="text-4xl">{t("footer.how")}</h1>
      <p>{t("pages.how")}</p>
    </article>
  );
}
