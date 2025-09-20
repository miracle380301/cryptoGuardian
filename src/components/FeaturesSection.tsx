import { Globe, Lock, TrendingUp } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { FeatureCard } from './FeatureCard'

export function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Globe,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: t.main.featuresDetailed.realtime.title,
      description: t.main.featuresDetailed.realtime.description
    },
    {
      icon: Lock,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      title: t.main.featuresDetailed.ssl.title,
      description: t.main.featuresDetailed.ssl.description
    },
    {
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: t.main.featuresDetailed.trustScore.title,
      description: t.main.featuresDetailed.trustScore.description
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          iconColor={feature.iconColor}
          bgColor={feature.bgColor}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  )
}