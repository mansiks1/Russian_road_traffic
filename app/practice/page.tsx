import type { Metadata } from "next";
import { PracticeCoach } from "../components/PracticeCoach";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Подготовка к практическому экзамену",
  description:
    "Чек-лист водительских навыков, типичные ошибки и персональный план занятия перед практическим экзаменом.",
};

export default function PracticePage() {
  return (
    <main className="site-shell inner-shell">
      <SiteHeader active="practice" />
      <PracticeCoach />
    </main>
  );
}
