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
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-sm">
      <div className={`${bgColor} rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6`}>
        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  )
}