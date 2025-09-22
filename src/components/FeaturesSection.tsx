import { Database, Shield, CheckCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

export function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Database,
      iconColor: 'text-green-600',
      bgColor: '',
      title: t.main.featuresDetailed.realtime.title,
      description: t.main.featuresDetailed.realtime.description
    },
    {
      icon: Shield,
      iconColor: 'text-green-600',
      bgColor: '',
      title: t.main.featuresDetailed.ssl.title,
      description: t.main.featuresDetailed.ssl.description
    },
    {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: '',
      title: t.main.featuresDetailed.trustScore.title,
      description: t.main.featuresDetailed.trustScore.description
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <div key={index} className="text-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4 mx-auto">
              <Icon className={`h-12 w-12 ${feature.iconColor}`} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        )
      })}
    </div>
  )
}