"use client";

import { useTranslations } from "next-intl";
import { StudyForm } from "@/components/study-form";

export default function ReviewPage() {
  const t = useTranslations("review");
  return <StudyForm mode="MISTAKES" title={t("title")} body={t("body")} />;
}
