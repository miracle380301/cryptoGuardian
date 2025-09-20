'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { useEffect, useState } from 'react'

export function StatisticsSection() {
  const { t } = useTranslation()
  const [realData, setRealData] = useState<any>(null)

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

  const stats = [
    {
      value: realData?.totalBlacklisted || '15,432',
      label: t.main.liveStats.sitesAnalyzed,
      color: 'text-blue-600'
    },
    {
      value: realData?.detectionRate || '94%',
      label: t.main.liveStats.detectionRate,
      color: 'text-green-600'
    },
    {
      value: realData?.recentDetections || '823',
      label: t.main.liveStats.scamsDetected,
      color: 'text-red-600'
    },
    {
      value: '24/7',
      label: t.main.liveStats.monitoring,
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
        {t.main.liveStats.title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className={`text-4xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-gray-600 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}