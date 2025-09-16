'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Shield } from 'lucide-react'

export function Header() {
  const { t } = useTranslation()

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                CryptoGuardian
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">Crypto Site Security Checker</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              🏠 Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/api" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              API
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}