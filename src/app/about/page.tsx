'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'

export default function AboutPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* 문제점 섹션 */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {t.problem.title}
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>{t.problem.description1}</p>
            <p>{t.problem.description2}</p>
          </div>
        </section>

        {/* 솔루션 섹션 */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {t.solution.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-600">
                {t.solution.realtime.title}
              </h3>
              <p className="text-gray-600">
                {t.solution.realtime.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-600">
                {t.solution.exchange.title}
              </h3>
              <p className="text-gray-600">
                {t.solution.exchange.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-600">
                {t.solution.community.title}
              </h3>
              <p className="text-gray-600">
                {t.solution.community.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-blue-600">
                {t.solution.weekly.title}
              </h3>
              <p className="text-gray-600">
                {t.solution.weekly.description}
              </p>
            </div>
          </div>
        </section>

        {/* 데이터 소스 섹션 */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {t.partners.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-blue-600">KISA</div>
              <div className="text-sm text-gray-500">{t.partners.kisa}</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-green-600">VirusTotal</div>
              <div className="text-sm text-gray-500">Google Security</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-purple-600">CoinGecko</div>
              <div className="text-sm text-gray-500">{t.partners.exchange}</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-orange-600">URLhaus</div>
              <div className="text-sm text-gray-500">{t.partners.malicious}</div>
            </div>
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">
            {t.stats.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">15,000+</div>
              <div className="text-blue-100">{t.stats.blocked}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-100">{t.stats.verified}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Real-time</div>
              <div className="text-blue-100">{t.stats.monitoring}</div>
            </div>
          </div>
        </section>

        {/* 사용 방법 섹션 */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {t.howto.title}
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                1
              </span>
              <div>
                <div className="font-semibold">{t.howto.step1.title}</div>
                <div className="text-gray-600">{t.howto.step1.description}</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                2
              </span>
              <div>
                <div className="font-semibold">{t.howto.step2.title}</div>
                <div className="text-gray-600">{t.howto.step2.description}</div>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                3
              </span>
              <div>
                <div className="font-semibold">{t.howto.step3.title}</div>
                <div className="text-gray-600">{t.howto.step3.description}</div>
              </div>
            </li>
          </ol>
        </section>

        {/* 우리의 목표 */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {t.mission.title}
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>{t.mission.description1}</p>
            <p>{t.mission.description2}</p>
          </div>
        </section>

        {/* 왜 만들었나 */}
        <section className="mb-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {t.mission.whyTitle}
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>{t.mission.whyDescription1}</p>
            <p>{t.mission.whyDescription2}</p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <p className="text-sm">
                <strong>{t.mission.disclaimer.split(':')[0]}:</strong> {t.mission.disclaimer.split(':')[1]}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </div>
  )
}