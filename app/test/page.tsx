import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { TestRunner } from "../components/TestRunner";

export const metadata: Metadata = {
  title: "Тренировки и пробный экзамен ПДД",
  description:
    "Пробный экзамен с таймером, тематические тренировки, дорожные знаки и работа над ошибками.",
};

export default function TestPage() {
  return (
    <main className="site-shell inner-shell">
      <SiteHeader active="test" />
      <TestRunner />
    </main>
  );
}
