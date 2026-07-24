import type { Metadata } from "next";
import { SignsGallery } from "../components/SignsGallery";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Все дорожные знаки",
  description:
    "Наглядный справочник дорожных знаков с краткими и подробными пояснениями.",
};

export default function SignsPage() {
  return (
    <main className="site-shell inner-shell">
      <SiteHeader active="signs" />
      <SignsGallery />
    </main>
  );
}
