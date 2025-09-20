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
    <div className="flex justify-center items-center space-x-8 mb-16 text-sm">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`w-3 h-3 ${badge.color} rounded-full`}></div>
          <span className="text-gray-600">{badge.text}</span>
        </div>
      ))}
    </div>
  )
}