'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import Link from 'next/link'

export default function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t.terms.title}
          </h1>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.purpose.title}
              </h2>
              <p>{t.terms.sections.purpose.content}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.service.title}
              </h2>
              <p className="mb-3">{t.terms.sections.service.description}</p>
              <ul className="list-disc ml-6 space-y-1">
                {t.terms.sections.service.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.usage.title}
              </h2>
              {t.terms.sections.usage.items.map((item: string, index: number) => (
                <p key={index}>{index + 1}. {item}</p>
              ))}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.disclaimer.title}
              </h2>
              {t.terms.sections.disclaimer.items.map((item: string, index: number) => (
                <p key={index} className="mb-3">{index + 1}. {item}</p>
              ))}
              <p className="mb-3">{t.terms.sections.disclaimer.notLiable}</p>
              <ul className="list-disc ml-6 space-y-1">
                {t.terms.sections.disclaimer.notLiableItems.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.intellectual.title}
              </h2>
              {t.terms.sections.intellectual.items.map((item: string, index: number) => (
                <p key={index}>{index + 1}. {item}</p>
              ))}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.obligations.title}
              </h2>
              <p className="mb-3">{t.terms.sections.obligations.description}</p>
              <ul className="list-disc ml-6 space-y-1">
                {t.terms.sections.obligations.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.changes.title}
              </h2>
              {t.terms.sections.changes.items.map((item: string, index: number) => (
                <p key={index}>{index + 1}. {item}</p>
              ))}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.compensation.title}
              </h2>
              <p>{t.terms.sections.compensation.content}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.dispute.title}
              </h2>
              {t.terms.sections.dispute.items.map((item: string, index: number) => (
                <p key={index}>{index + 1}. {item}</p>
              ))}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {t.terms.sections.amendment.title}
              </h2>
              {t.terms.sections.amendment.items.map((item: string, index: number) => (
                <p key={index}>{index + 1}. {item}</p>
              ))}
            </section>

            <section className="pt-4 border-t">
              <p className="text-sm">{t.terms.sections.dates.effective}</p>
              <p className="text-sm">{t.terms.sections.dates.lastModified}</p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              {t.terms.backToHome}
            </Link>
          </div>
      </div>
    </div>
  )
}