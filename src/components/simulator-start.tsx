"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowRight, Clock3, FileText, Gauge } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/client";
const modes = [["FULL_CAT", "cat", 135, 197, 10, Clock3], ["CAT_ADAPTIVE", "adaptive", 135, 197, 10, Gauge], ["PAPER_PENCIL", "paper", 225, 149, 9, FileText]] as const;
export function SimulatorStart() {
  const t = useTranslations(); const x = useTranslations("experience"); const router = useRouter();
  const [error, setError] = useState(""); const [busy, setBusy] = useState<string | null>(null);
  async function start(mode: (typeof modes)[number][0]) {
    if (busy) return; setBusy(mode); setError("");
    try { const created = await api<{ id: string }>("/api/sessions", { method: "POST", body: JSON.stringify({ mode, origins: ["ORIGINAL"] }) }); router.push(`/exam/${created.id}`); }
    catch (reason) { const code = reason instanceof Error ? reason.message : "SERVER"; setError(t.has(`common.errors.${code}`) ? t(`common.errors.${code}`) : t("common.errors.SERVER")); setBusy(null); }
  }
  return <div className="space-y-8">
    <div className="grid items-center gap-8 md:grid-cols-[1.4fr_.6fr]"><div><span className="eyebrow">ASVAB / {x("free")}</span><h1 className="mt-4 max-w-2xl text-4xl md:text-5xl">{x("simTitle")}</h1><p className="mt-4 max-w-2xl leading-relaxed text-muted">{x("simBody")}</p></div><Image src="/images/study-focus.jpg" alt="" width={720} height={960} className="hidden h-56 w-full rounded-2xl object-cover md:block" /></div>
    {error && <p role="alert" className="text-danger">{error}</p>}
    <div className="grid gap-5 lg:grid-cols-3">{modes.map(([mode,key,count,minutes,sections,Icon]) => <article key={mode} className={`flex flex-col rounded-2xl border bg-card p-7 ${mode === "FULL_CAT" ? "border-accent" : "border-line"}`}>
      <Icon size={26} className="text-accent" /><h2 className="mt-6 text-2xl">{x(`${key}Title`)}</h2><p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{x(`${key}Body`)}</p>
      <div className="my-6 grid grid-cols-3 gap-3 border-y border-line py-5">{[[count,"questions"],[minutes,"minutes"],[sections,"sections"]].map(([value,label]) => <div key={label}><strong className="block text-2xl font-medium">{value}</strong><span className="text-xs text-muted">{x(String(label))}</span></div>)}</div>
      <button type="button" className="btn-primary" disabled={Boolean(busy)} onClick={() => void start(mode)}>{busy === mode ? x("starting") : t("common.start")}<ArrowRight size={16} /></button>
    </article>)}</div>
    <div className="rounded-2xl border border-line p-5 text-sm leading-relaxed text-muted"><p>{x("structureNote")}</p><p className="mt-2">{x("helpWarning")}</p></div>
    <p className="max-w-3xl text-sm leading-relaxed text-muted">{x("accountBody")} <Link href="/login" className="font-semibold text-accent">{x("login")} ↗</Link></p>
  </div>;
}
