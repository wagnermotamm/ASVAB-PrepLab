"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "@/lib/client";

export function ContactForm() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
        }),
      });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "SERVER");
    }
  }

  if (sent) return <p>{t("pages.sent")}</p>;
  return (
    <form onSubmit={submit} className="max-w-lg space-y-3">
      <p className="text-muted">{t("pages.contact")}</p>
      <input name="name" required minLength={2} className="w-full rounded-xl border border-line bg-card px-3 py-2" placeholder={t("auth.name")} />
      <input name="email" required type="email" className="w-full rounded-xl border border-line bg-card px-3 py-2" placeholder={t("auth.email")} />
      <textarea name="message" required minLength={10} className="w-full rounded-xl border border-line bg-card p-3" rows={5} />
      {error && <p className="text-danger">{error}</p>}
      <button className="rounded-full bg-accent px-4 py-2 text-accent-foreground" type="submit">{t("common.save")}</button>
    </form>
  );
}
