'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import Link from 'next/link'

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.privacy.title}
          </h1>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.collection.title}
              </h2>
              <p className="mb-3">{t.privacy.sections.collection.description}</p>
              <ul className="list-disc ml-6 space-y-1">
                {t.privacy.sections.collection.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.report.title}
              </h2>
              <p className="mb-3">{t.privacy.sections.report.description}</p>
              <ul className="list-disc ml-6 space-y-1">
                {t.privacy.sections.report.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-3">{t.privacy.sections.report.note}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.cookies.title}
              </h2>
              <p>{t.privacy.sections.cookies.description}</p>
              <ul className="list-disc ml-6 space-y-1 mt-3">
                {t.privacy.sections.cookies.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.security.title}
              </h2>
              <p>{t.privacy.sections.security.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.thirdParty.title}
              </h2>
              <p>{t.privacy.sections.thirdParty.description}</p>
              <ul className="list-disc ml-6 space-y-1 mt-3">
                {t.privacy.sections.thirdParty.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.rights.title}
              </h2>
              <p>{t.privacy.sections.rights.description}</p>
              <ul className="list-disc ml-6 space-y-1 mt-3">
                {t.privacy.sections.rights.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-3">{t.privacy.sections.rights.note}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.officer.title}
              </h2>
              <p>{t.privacy.sections.officer.email}</p>
              <p className="mt-2">{t.privacy.sections.officer.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.privacy.sections.revision.title}
              </h2>
              <p>{t.privacy.sections.revision.effectiveDate}</p>
              <p className="mt-2">{t.privacy.sections.revision.description}</p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              {t.privacy.backToHome}
            </Link>
          </div>
      </div>
    </div>
  )
}