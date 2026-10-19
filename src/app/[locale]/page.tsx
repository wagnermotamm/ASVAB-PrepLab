import { BookOpen, Clock3, Languages, LineChart } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeDemo } from "@/components/home-demo";
import { Link } from "@/i18n/navigation";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const sections = [
    ["s1t", "s1b"],
    ["s2t", "s2b"],
    ["s3t", "s3b"],
    ["s4t", "s4b"],
    ["s5t", "s5b"],
    ["s6t", "s6b"],
    ["s7t", "s7b"],
    ["s8t", "s8b"],
    ["s9t", "s9b"],
  ] as const;
  const actions = [
    ["/practice", t("ctaPractice")],
    ["/simulator", t("ctaSim")],
    ["/practice", t("ctaSubject")],
    ["/bank", t("ctaBank")],
    ["/review", t("ctaReview")],
  ] as const;

  return (
    <div className="space-y-14">
      <section className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-accent">{t("eyebrow")}</p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] md:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map(([href, label]) => (
              <Link key={label} href={href} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <ul className="grid gap-3 text-sm">
          {[
            { Icon: Languages, label: t("s7t") },
            { Icon: Clock3, label: t("s8t") },
            { Icon: BookOpen, label: t("s6t") },
            { Icon: LineChart, label: t("s9t") },
          ].map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
              <Icon className="size-5 text-accent" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </section>
      <HomeDemo />
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map(([title, body]) => (
          <article key={title} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-2xl">{t(title)}</h2>
            <p className="mt-2 text-muted">{t(body)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
