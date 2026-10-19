"use client";

import { use } from "react";
import { ExamPlayer } from "@/components/exam-player";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ExamPlayer id={id} />;
}
