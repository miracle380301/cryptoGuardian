'use client'

import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/lib/i18n/useTranslation";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta property="og:title" content="크립토가디언 - 암호화폐 사이트 보안 검증" />
        <meta property="og:description" content="암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다" />
        <meta property="og:image" content="/police.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cryptoguardian.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="크립토가디언 - 암호화폐 사이트 보안 검증" />
        <meta name="twitter:description" content="암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다" />
        <meta name="twitter:image" content="/police.png" />
      </head>
      <body className={`${notoSansKR.className} antialiased min-h-screen flex flex-col bg-gray-50`}>
        <LanguageProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
