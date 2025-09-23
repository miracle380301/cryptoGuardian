import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "크립토가디언 - 암호화폐 사이트 보안 검증",
  description: "암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다",
  metadataBase: new URL('https://cryptoguardian.vercel.app'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "크립토가디언 - 암호화폐 사이트 보안 검증",
    description: "암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다",
    url: "https://cryptoguardian.vercel.app",
    siteName: "크립토가디언",
    locale: "ko_KR",
    images: [
      {
        url: "/police.png",
        width: 1024,
        height: 1024,
        alt: "크립토가디언 보안 검증 서비스",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "크립토가디언 - 암호화폐 사이트 보안 검증",
    description: "암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다",
    images: ["/police.png"],
    creator: "@cryptoguardian",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

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
      <body className={`${notoSansKR.className} antialiased min-h-screen flex flex-col bg-gray-50`}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
