"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function HomeDemo() {
  const t = useTranslations("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-sm" aria-labelledby="demo-title">
      <p className="text-sm uppercase tracking-[0.16em] text-brass">{t("demoKicker")}</p>
      <h2 id="demo-title" className="mt-2 text-3xl">
        {t("demoStem")}
      </h2>
      <p className="mt-3 max-w-2xl text-muted">{t("demoNote")}</p>
      <p className="mt-6 text-lg leading-relaxed">
        The word{" "}
        <button type="button" className="term px-1" aria-expanded={open} onClick={() => setOpen(true)}>
          abundant
        </button>{" "}
        most nearly means:
      </p>
      {open && (
        <div className="mt-3 max-w-md rounded-2xl border border-line bg-background p-4 shadow-lg" role="dialog" aria-label={t("demoWord")}>
          <div className="flex items-start justify-between gap-4">
            <strong>{t("demoWord")}</strong>
            <button type="button" className="text-sm text-muted" onClick={() => setOpen(false)}>
              {t("close")}
            </button>
          </div>
          <p className="mt-2">{t("demoMeaning")}</p>
          <p className="mt-1 text-muted">{t("demoContext")}</p>
        </div>
      )}
      <ul className="mt-4 grid gap-2">
        {[t("demoA"), t("demoB"), t("demoC"), t("demoD")].map((choice, index) => (
          <li key={choice} className="rounded-xl border border-line px-4 py-3">
            {String.fromCharCode(65 + index)}. {choice}
          </li>
        ))}
      </ul>
    </section>
  );
}
