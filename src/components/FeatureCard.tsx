import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  iconColor: string
  bgColor: string
  title: string
  description: string
}

export function FeatureCard({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  description
}: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
      <div className={`${bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-xl mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}