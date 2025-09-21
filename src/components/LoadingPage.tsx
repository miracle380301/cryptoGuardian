'use client'

import { useEffect, useState } from 'react'
import { Shield, Search, Database, Lock, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface LoadingPageProps {
  domain?: string
}

export function LoadingPage({ domain }: LoadingPageProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentPoliceImage, setCurrentPoliceImage] = useState(0)

  const policeImages = ['/police.png', '/police1.png']

  const steps = [
    {
      icon: Search,
      title: t.main.loading.steps.domainInfo.title,
      description: t.main.loading.steps.domainInfo.description
    },
    {
      icon: Database,
      title: t.main.loading.steps.securityDatabase.title,
      description: t.main.loading.steps.securityDatabase.description
    },
    {
      icon: Lock,
      title: t.main.loading.steps.sslVerification.title,
      description: t.main.loading.steps.sslVerification.description
    },
    {
      icon: Shield,
      title: t.main.loading.steps.reputationAnalysis.title,
      description: t.main.loading.steps.reputationAnalysis.description
    },
    {
      icon: CheckCircle,
      title: t.main.loading.steps.finalResults.title,
      description: t.main.loading.steps.finalResults.description
    }
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 2000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + Math.random() * 3 : prev))
    }, 150)

    const policeImageInterval = setInterval(() => {
      setCurrentPoliceImage((prev) => (prev + 1) % policeImages.length)
    }, 3000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearInterval(policeImageInterval)
    }
  }, [])

  const CurrentIcon = steps[currentStep]?.icon || Shield

  return (
    <div className="space-y-6">
      {/* Main score card placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        {/* Domain being checked */}
        {domain && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{domain}</h1>
            <p className="text-gray-600">{t.main.loading.subtitle}</p>
          </div>
        )}

        {/* Main loading indicator */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <Image
                src={policeImages[currentPoliceImage]}
                alt={t.main.loading.title}
                width={128}
                height={128}
                className="transition-opacity duration-500"
                priority
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {steps[currentStep]?.title || t.main.loading.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
            {steps[currentStep]?.description || t.main.loading.subtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{t.main.loading.progress}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-2 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Check details placeholder cards */}
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex items-center gap-4">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}