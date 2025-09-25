'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { useEffect, useState } from 'react'

// Count up hook
function useCountUp(target: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    if (!isStarted) return

    const startTime = Date.now() + delay
    const endTime = startTime + duration

    const updateCount = () => {
      const now = Date.now()
      if (now < startTime) {
        requestAnimationFrame(updateCount)
        return
      }

      const progress = Math.min((now - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setCount(Math.floor(target * easeOutQuart))

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(updateCount)
  }, [target, duration, delay, isStarted])

  const start = () => setIsStarted(true)

  return { count, start }
}

export function StatisticsSection() {
  const { t } = useTranslation()
  const [realData, setRealData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRealData(data.stats)
        }
      })
      .catch(err => console.error('Stats fetch error:', err))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Parse numeric values for count up
  const parseNumericValue = (value: string) => {
    const numericStr = value.replace(/[,%]/g, '')
    return parseInt(numericStr) || 0
  }

  const stats = [
    {
      value: realData?.totalValidations || '15,432',
      label: t.main.liveStats.sitesAnalyzed,
      numeric: parseNumericValue(realData?.totalValidations || '15432'),
      suffix: '',
      color: 'text-blue-600'
    },
    {
      value: realData?.detectionRate || '94%',
      label: t.main.liveStats.detectionRate,
      numeric: parseNumericValue(realData?.detectionRate || '94'),
      suffix: '%',
      color: 'text-gray-900'
    },
    {
      value: realData?.recentDetections || '823',
      label: t.main.liveStats.scamsDetected,
      numeric: parseNumericValue(realData?.recentDetections || '823'),
      suffix: '',
      color: 'text-red-600'
    },
    {
      value: '24/7',
      label: t.main.liveStats.monitoring,
      numeric: 24,
      suffix: '/7',
      isSpecial: true,
      color: 'text-gray-900'
    }
  ]

  // Count up hooks for each stat
  const countUps = [
    useCountUp(stats[0].numeric, 2000, 0),
    useCountUp(stats[1].numeric, 2000, 150),
    useCountUp(stats[2].numeric, 2000, 300),
    useCountUp(stats[3].numeric, 1000, 450)
  ]

  // Start count up when visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        countUps.forEach(countUp => countUp.start())
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const formatNumber = (num: number, index: number) => {
    if (stats[index].isSpecial) return `${num}/7`
    if (index === 0 || index === 2) return num.toLocaleString() + stats[index].suffix // 분석된 사이트와 감지된 스캠에 천단위 표시
    return num + stats[index].suffix
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-sm shadow-sm transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 animate-pulse"></div>
        <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">
          {t.main.liveStats.title}
        </h2>
        <div className="absolute top-2 right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center group transition-all duration-500 delay-${index * 100}`}
              style={{
                transitionDelay: `${index * 150}ms`
              }}
            >
              <div className={`text-2xl font-bold mb-2 transition-all duration-300 group-hover:scale-110 ${stats[index].color} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                {formatNumber(countUps[index].count, index)}
              </div>
              <div className={`text-sm text-gray-600 uppercase tracking-wide transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                {stat.label}
              </div>
              <div className="mt-2 h-0.5 bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}