import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <article className="space-y-4">
      <h1 className="text-4xl">{t("footer.contact")}</h1>
      <ContactForm />
    </article>
  );
}
