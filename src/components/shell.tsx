"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/client";

type Account = { user: { id: string; name: string; role: "STUDENT" | "ADMIN"; locale: string } | null };

const locales = [
  { id: "en", label: "EN" },
  { id: "br", label: "PT" },
  { id: "es", label: "ES" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [account, setAccount] = useState<Account["user"]>(null);
  const [open, setOpen] = useState(false);
  const exam = pathname.startsWith("/exam/");

  useEffect(() => {
    api<Account>("/api/auth/me")
      .then((data) => setAccount(data.user))
      .catch(() => setAccount(null));
  }, [pathname]);

  function switchLocale(next: "en" | "br" | "es") {
    router.replace(pathname, { locale: next });
    if (account) {
      void api("/api/auth/me", { method: "PATCH", body: JSON.stringify({ locale: next }) });
    }
  }

  const links = [
    { href: "/practice", label: t("nav.practice") },
    { href: "/simulator", label: t("nav.simulator") },
    { href: "/bank", label: t("nav.bank") },
    { href: "/review", label: t("nav.review") },
    { href: "/dashboard", label: t("nav.dashboard") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="font-display text-xl tracking-tight">
            ASVAB PrepLab
          </Link>
          {!exam && (
            <nav className="ml-4 hidden items-center gap-4 text-sm md:flex" aria-label="Primary">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={pathname === link.href ? "text-accent" : "text-muted hover:text-foreground"}>
                  {link.label}
                </Link>
              ))}
              {account?.role === "ADMIN" && (
                <Link href="/admin" className="text-muted hover:text-foreground">
                  {t("nav.admin")}
                </Link>
              )}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-full border border-line p-0.5 text-xs" role="group" aria-label={t("nav.language")}>
              {locales.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={locale === item.id}
                  className={`rounded-full px-2 py-1 ${locale === item.id ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => switchLocale(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full border border-line p-2"
              aria-label={t("nav.theme")}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <Sun className="hidden size-4 dark:block" />
              <Moon className="size-4 dark:hidden" />
            </button>
            {!exam && account && (
              <button
                type="button"
                className="hidden text-sm text-muted md:inline"
                onClick={async () => {
                  await api("/api/auth/logout", { method: "POST" });
                  setAccount(null);
                  router.push("/");
                }}
              >
                {t("nav.logout")}
              </button>
            )}
            {!exam && !account && (
              <Link href="/login" className="hidden text-sm md:inline">
                {t("nav.login")}
              </Link>
            )}
            <button type="button" className="p-2 md:hidden" aria-label="Menu" onClick={() => setOpen((value) => !value)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && !exam && (
          <nav className="flex flex-col gap-2 border-t border-line px-4 py-3 md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href={account ? "/dashboard" : "/login"} onClick={() => setOpen(false)}>
              {account ? account.name : t("nav.login")}
            </Link>
          </nav>
        )}
      </header>
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      {!exam && (
        <footer className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm text-muted md:grid-cols-[2fr_1fr]">
            <p>{t("footer.disclaimer")}</p>
            <nav className="flex flex-col gap-1">
              <Link href="/about">{t("footer.about")}</Link>
              <Link href="/how-it-works">{t("footer.how")}</Link>
              <Link href="/about-asvab">{t("footer.asvab")}</Link>
              <Link href="/privacy">{t("footer.privacy")}</Link>
              <Link href="/terms">{t("footer.terms")}</Link>
              <Link href="/contact">{t("footer.contact")}</Link>
              <Link href="/sources">{t("footer.sources")}</Link>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
}
