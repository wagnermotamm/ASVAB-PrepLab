import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <article className="max-w-3xl space-y-4">
      <h1 className="text-4xl">{t("footer.about")}</h1>
      <p>{t("pages.about")}</p>
      <p className="text-sm text-muted">{t("footer.disclaimer")}</p>
    </article>
  );
}
