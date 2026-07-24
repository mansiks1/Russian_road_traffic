import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { TestRunner } from "../components/TestRunner";

export const metadata: Metadata = {
  title: "Тест по дорожным знакам",
  description:
    "Проверьте знание дорожных знаков: 10 вопросов с близкими по смыслу вариантами ответа.",
};

export default function TestPage() {
  return (
    <main className="site-shell inner-shell">
      <SiteHeader active="test" />
      <TestRunner />
    </main>
  );
}
