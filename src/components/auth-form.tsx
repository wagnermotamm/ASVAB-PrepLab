"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password, locale }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (reason) {
      const code = reason instanceof ApiError ? reason.message : "SERVER";
      setError(t.has(`common.errors.${code}`) ? t(`common.errors.${code}`) : code);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
      <h1 className="text-4xl">{mode === "login" ? t("auth.login") : t("auth.register")}</h1>
      {mode === "register" && (
        <label className="block text-sm">
          {t("auth.name")}
          <input required className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
      )}
      <label className="block text-sm">
        {t("auth.email")}
        <input required type="email" className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="block text-sm">
        {t("auth.password")}
        <input required type="password" minLength={8} className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error && <p className="text-danger">{error}</p>}
      <button className="rounded-full bg-accent px-5 py-2 text-accent-foreground" type="submit">
        {mode === "login" ? t("auth.login") : t("auth.register")}
      </button>
      <p className="text-sm text-muted">{t("auth.demo")}</p>
      <Link href={mode === "login" ? "/register" : "/login"} className="text-sm text-accent">
        {mode === "login" ? t("nav.register") : t("nav.login")}
      </Link>
    </form>
  );
}
