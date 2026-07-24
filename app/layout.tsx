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
      "Интерактивный тренажёр российских дорожных знаков с тестами, справочником и личной статистикой.",
    openGraph: {
      title: "Дорожный кодекс",
      description: "Знаки, которые остаются в памяти.",
      type: "website",
      locale: "ru_RU",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Дорожный кодекс",
      description: "Знаки, которые остаются в памяти.",
      images: [`${origin}/og.png`],
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
