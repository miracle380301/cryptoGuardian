'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Shield } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  {t.header.logo.replace('🛡️ ', '')}
                </h3>
                <p className="text-xs text-gray-600 hidden sm:block">{t.header.tagline}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              © 2025 크립토가디언. All rights reserved.
            </p>
          </div>


          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{/* Legal */}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}