import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "127.0.0.1:5173";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("127.0.0.1") || host.includes("localhost")
      ? "http"
      : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Дорожный кодекс — тренажёр дорожных знаков",
      template: "%s · Дорожный кодекс",
    },
    description:
      "Подготовка к экзамену ПДД: теория, дорожные знаки, работа над ошибками, практический чек-лист и личная статистика.",
    openGraph: {
      title: "Дорожный кодекс",
      description: "Теория, знаки и практика — в одном тренажёре.",
      type: "website",
      locale: "ru_RU",
      images: [{ url: `${origin}/og-v2.png`, width: 1728, height: 919 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Дорожный кодекс",
      description: "Теория, знаки и практика — в одном тренажёре.",
      images: [`${origin}/og-v2.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
