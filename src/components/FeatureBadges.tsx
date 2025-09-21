import { useTranslation } from '@/lib/i18n/useTranslation'

export function FeatureBadges() {
  const { t } = useTranslation()

  const badges = [
    {
      color: 'bg-green-500',
      text: t.main.features.trusted
    },
    {
      color: 'bg-blue-500',
      text: t.main.features.instant
    },
    {
      color: 'bg-purple-500',
      text: t.main.features.secure
    }
  ]

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${badge.color} rounded-full`}></div>
          <span className="text-gray-600">{badge.text}</span>
        </div>
      ))}
    </div>
  )
}