'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                {t.header.logo.replace('🛡️ ', '')}
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">{t.header.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.header.nav.home}
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.header.nav.about}
            </Link>
            <Link href="/faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.header.nav.faq}
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <LanguageSwitcher />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.nav.home}
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.nav.about}
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.nav.faq}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}