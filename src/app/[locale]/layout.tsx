import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import { routing } from "@/i18n/routing";
import { htmlLang } from "@/lib/locale";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const languages = { en: "/en", "pt-BR": "/br", es: "/es" };
  return {
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    alternates: { canonical: `/${locale}`, languages },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "br" | "es")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={htmlLang(locale)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Shell>{children}</Shell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
