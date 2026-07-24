import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { StatsDashboard } from "../components/StatsDashboard";

export const metadata: Metadata = {
  title: "Личная статистика",
  description:
    "Статистика выполненных тестов, правильных ответов и общей точности.",
};

export default function StatsPage() {
  return (
    <main className="site-shell inner-shell">
      <SiteHeader active="stats" />
      <StatsDashboard />
    </main>
  );
}
