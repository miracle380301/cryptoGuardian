'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function AboutPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            {t.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            {t.subtitle}
          </p>
        </div>

        {/* 문제점 섹션 */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            {t.problem.title}
          </h2>
          <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base">
            <p>{t.problem.description1}</p>
            <p>{t.problem.description2}</p>
          </div>
        </section>

        {/* 솔루션 섹션 */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            {t.solution.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-600">
                {t.solution.realtime.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {t.solution.realtime.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-600">
                {t.solution.exchange.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {t.solution.exchange.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-600">
                {t.solution.community.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {t.solution.community.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-600">
                {t.solution.weekly.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {t.solution.weekly.description}
              </p>
            </div>
          </div>
        </section>

        {/* 데이터 소스 섹션 */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            {t.partners.title}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">KISA</div>
              <div className="text-xs sm:text-sm text-gray-500">{t.partners.kisa}</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">VirusTotal</div>
              <div className="text-xs sm:text-sm text-gray-500">Google Security</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">CoinGecko</div>
              <div className="text-xs sm:text-sm text-gray-500">{t.partners.exchange}</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">URLhaus</div>
              <div className="text-xs sm:text-sm text-gray-500">{t.partners.malicious}</div>
            </div>
          </div>
        </section>


        {/* 사용 방법 섹션 */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            {t.howto.title}
          </h2>
          <ol className="space-y-6 sm:space-y-8">
            <li>
              <div className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                1. {t.howto.step1.title}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {t.howto.step1.description}
              </div>
            </li>
            <li>
              <div className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                2. {t.howto.step2.title}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {t.howto.step2.description}
              </div>
            </li>
            <li>
              <div className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                3. {t.howto.step3.title}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {t.howto.step3.description}
              </div>
            </li>
          </ol>
        </section>

        {/* 우리의 목표 */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            {t.mission.title}
          </h2>
          <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base">
            <p>{t.mission.description1}</p>
            <p>{t.mission.description2}</p>
          </div>
        </section>

        {/* 왜 만들었나 */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
            {t.mission.whyTitle}
          </h2>
          <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base">
            <p>{t.mission.whyDescription1}</p>
            <p>{t.mission.whyDescription2}</p>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <p className="text-xs sm:text-sm">
                <strong>{t.mission.disclaimer.split(':')[0]}:</strong> {t.mission.disclaimer.split(':')[1]}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.cta}
          </Link>
        </div>
      </div>
    </div>
  )
}