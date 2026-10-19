import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function SourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <article className="max-w-3xl space-y-4">
      <h1 className="text-4xl">{t("footer.sources")}</h1>
      <p>{t("pages.sources")}</p>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li>
          <a href="https://www.officialasvab.com/applicants/what-to-expect/">officialasvab.com — What to Expect</a>
        </li>
        <li>
          <a href="https://www.officialasvab.com/applicants/sample-questions/">officialasvab.com — Sample Questions</a>
        </li>
        <li>
          <a href="https://www.asvabprogram.com/">asvabprogram.com</a>
        </li>
      </ul>
    </article>
  );
}
