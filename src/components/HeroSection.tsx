import { useTranslation } from '@/lib/i18n/useTranslation'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-6">
        <div className="relative inline-block">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
        </div>
      </div>
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        {t.header.logo.replace('🛡️ ', '')}
      </h1>
      <p className="text-2xl text-gray-600 mb-4 font-medium">
        {t.main.title}
      </p>
      <p className="text-gray-500 max-w-4xl mx-auto text-lg leading-relaxed">
        {t.main.subtitle}
      </p>
    </div>
  )
}