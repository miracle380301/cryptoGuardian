'use client'

import { LanguageProvider } from "@/lib/i18n/useTranslation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </LanguageProvider>
  );
}