"use client";

import { useTranslations } from "next-intl";
import { StudyForm } from "@/components/study-form";

export default function PracticePage() {
  const t = useTranslations("practice");
  return <StudyForm mode="PRACTICE_SUBJECT" title={t("title")} body={t("body")} />;
}
