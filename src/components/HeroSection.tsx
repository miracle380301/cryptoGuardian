import { useTranslation } from '@/lib/i18n/useTranslation'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto">
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="relative inline-block">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500 sm:w-16 sm:h-16"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
        {t.header.logo.replace('🛡️ ', '')}
      </h1>
      <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-3 sm:mb-4 font-medium px-4">
        {t.main.title}
      </p>
      <p className="text-gray-500 text-base sm:text-lg leading-relaxed px-4">
        {t.main.subtitle}
      </p>
    </div>
  )
}