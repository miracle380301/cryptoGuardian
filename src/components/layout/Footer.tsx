'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Shield, Github, Mail } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.header.logo}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              {t.header.tagline}
            </p>
            <p className="text-xs text-gray-500">
              {t.footer.disclaimer}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{/* Quick Links */}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t.header.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t.header.nav.about}
                </Link>
              </li>
            </ul>
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
              <li>
                <a href="mailto:cryptoguardian380301@gmail.com?subject=CryptoGuardian 문의" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t.footer.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            {t.footer.copyright}
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="mailto:cryptoguardian380301@gmail.com?subject=CryptoGuardian 문의"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}