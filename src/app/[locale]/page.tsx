import Image from "next/image";
import { ArrowRight, Check, Clock3, Layers3, ListChecks, MessageCircleQuestion, MousePointer2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeDemo } from "@/components/home-demo";
import { SubjectPicker } from "@/components/subject-picker";
import { Link } from "@/i18n/navigation";
import demoQuestions from "../../../content/demo.json";
import { questionVocabulary } from "@/lib/vocabulary";
import { safeSvg } from "@/lib/exam";
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations("experience");
  const questions = demoQuestions.map(q => ({ ...q, diagramSvg: safeSvg(q.diagramSvg), vocabulary: questionVocabulary(q) }));
  return <div className="home-sections">
    <section className="hero-grid">
      <div className="hero-copy"><span className="eyebrow"><span className="status-dot" />{t("eyebrow")}</span><h1 className="hero-title">{t("heroTitle")}</h1><p className="hero-description">{t("heroBody")}</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/simulator" className="btn-primary">{t("simulate")}<ArrowRight size={18} /></Link><Link href="/practice" className="btn-secondary">{t("practice")}</Link></div><p className="mt-4 flex items-center gap-2 text-sm text-muted"><Check size={16} className="text-accent" />{t("free")} · EN / PT / ES</p>
      </div>
      <div className="hero-art"><Image src="/images/study-hero.jpg" alt={t("subjectImageAlt")} width={1536} height={1024} priority className="h-full w-full object-cover" /><div className="hero-art-caption"><span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={20} /></span><div><span className="block text-xs uppercase tracking-widest text-muted">ASVAB PREPLAB</span><p className="mt-1 text-sm font-medium">{t("heroCaption")}</p></div></div></div>
    </section>
    <section className="exam-overview">
      <div className="max-w-xl"><h2 className="text-xl font-semibold">{t("whatTitle")}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{t("whatBody")}</p><Link href="/about-asvab" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent">{t("allFormats")}<ArrowRight size={14} /></Link></div>
      <div className="grid grid-cols-3 gap-5">{[["135", "questions"], ["10", "sections"], ["197", "time"]].map(([number,key]) => <div key={key}><strong className="text-3xl font-medium tracking-tight md:text-4xl">{number}</strong><span className="mt-1 block max-w-24 text-xs text-muted">{t(key)}</span></div>)}</div>
      <p className="col-span-full text-xs leading-relaxed text-muted">{t("structureNote")} <a className="underline" href="https://www.officialasvab.com/applicants/cat-asvab/" target="_blank" rel="noreferrer">Official ASVAB ↗</a></p>
    </section>
    <section id="study-paths"><div className="section-heading"><div><span className="eyebrow">{t("waysEyebrow")}</span><h2 className="mt-3 text-3xl md:text-4xl">{t("waysTitle")}</h2></div></div>
      <div className="grid gap-5 md:grid-cols-2">
        <Link href="/simulator" className="path-card path-dark group"><Clock3 size={27} /><div className="mt-8 flex items-start justify-between gap-3"><h3 className="text-2xl">{t("simulate")}</h3><ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" /></div><p className="mt-3 text-sm leading-relaxed opacity-80">{t("fullBody")}</p><div className="mt-6 flex gap-3 text-xs opacity-75"><span>135 {t("questions")}</span><span>197 min</span><span>10 {t("sections")}</span></div></Link>
        <Link href="/practice" className="path-card group"><div className="flex items-center justify-between gap-2"><Layers3 size={27} className="text-accent" /><span className="pill">{t("recommended")}</span></div><div className="mt-8 flex items-start justify-between gap-3"><h3 className="text-2xl">{t("practice")}</h3><ArrowRight className="shrink-0 text-accent transition-transform group-hover:translate-x-1" /></div><p className="mt-3 text-sm leading-relaxed text-muted">{t("categoryBody")}</p></Link>
      </div>
    </section>
    <section><div className="overflow-hidden rounded-3xl"><Image src="/images/study-desk.jpg" alt="" width={1536} height={864} className="h-56 w-full object-cover md:h-72" /></div><h2 className="mt-8 text-3xl md:text-4xl">{t("howTitle")}</h2><div className="mt-8 grid gap-7 md:grid-cols-3">{[MousePointer2, ListChecks, MessageCircleQuestion].map((Icon, i) => <article key={i} className="how-step"><span className="mb-5 flex items-center gap-4"><span className="subject-icon"><Icon size={23} /></span><span className="text-xs tracking-widest text-muted">0{i + 1}</span></span><h3 className="text-lg font-semibold">{t(`step${i + 1}Title`)}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{t(`step${i + 1}Body`)}</p></article>)}</div></section>
    <HomeDemo questions={questions} />
    <section><div className="section-heading"><div><span className="eyebrow">10 {t("sections")}</span><h2 className="mt-3 text-3xl md:text-4xl">{t("guideTitle")}</h2><p className="mt-3 text-muted">{t("guideBody")}</p></div><Link href="/practice" className="btn-secondary">{t("practice")}<ArrowRight size={16} /></Link></div><SubjectPicker /></section>
    <section className="account-banner"><div><h2 className="max-w-2xl text-3xl">{t("accountTitle")}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("accountBody")}</p></div><div className="flex shrink-0 flex-wrap gap-3"><Link href="/register" className="btn-primary">{t("createAccount")}<ArrowRight size={16} /></Link><Link href="/login" className="btn-secondary">{t("login")}</Link></div></section>
  </div>;
}
