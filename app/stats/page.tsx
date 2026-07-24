import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { StatsDashboard } from "../components/StatsDashboard";

export const metadata: Metadata = {
  title: "Готовность к экзамену и личная статистика",
  description:
    "Точность ответов по темам, история тренировок, слабые места и оценка готовности к экзамену ПДД.",
};

export default function StatsPage() {
  return (
    <main className="site-shell inner-shell">
      <SiteHeader active="stats" />
      <StatsDashboard />
    </main>
  );
}
