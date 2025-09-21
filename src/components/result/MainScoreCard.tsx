import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Shield, CheckCircle, AlertTriangle, XCircle, Users } from 'lucide-react'
import { ValidationResult } from '@/types/api.types'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { translateSummary } from '@/lib/i18n/translateMessage'

interface MainScoreCardProps {
  result: ValidationResult
}

export function MainScoreCard({ result }: MainScoreCardProps) {
  const { t, language: currentLang } = useTranslation()

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'safe') return <CheckCircle className="w-6 h-6 text-green-600" />
    if (status === 'warning') return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    return <XCircle className="w-6 h-6 text-red-600" />
  }

  return (
    <Card className={`mb-8 ${getScoreBackground(result.finalScore)} border-2`}>
      <CardHeader className="text-center pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t.results.title} - {result.originalInput || result.domain}
        </h1>

        {/* User Reports Warning */}
        {result.checks?.userReports?.details?.userReports?.isReported && (
          <div className="mb-4 mx-auto max-w-lg">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-red-800">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currentLang === 'ko'
                    ? ` ${result.checks.userReports.details.userReports.reportCount}명의 사용자가 이 사이트를 신고했습니다`
                    : ` ${result.checks.userReports.details.userReports.reportCount} users reported this site`
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-6">
          {getStatusIcon(result.status)}
          <span className={`text-lg font-medium ${getScoreColor(result.finalScore)}`}>
            {result.status === 'safe' ? t.results.status.safe.toUpperCase() :
             result.status === 'warning' ? t.results.status.warning.toUpperCase() : t.results.status.danger.toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="text-center pb-8">
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg className="w-32 h-32">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="56"
              cx="64"
              cy="64"
            />
            <circle
              className={`${getScoreColor(result.finalScore)} animate-score-circle`}
              strokeWidth="8"
              strokeDasharray={351.86}
              strokeDashoffset={351.86 - (351.86 * result.finalScore) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="56"
              cx="64"
              cy="64"
              transform="rotate(-90 64 64)"
            />
          </svg>
          <style jsx global>{`
            @keyframes scoreCircleDraw {
              from {
                stroke-dashoffset: 351.86;
              }
              to {
                stroke-dashoffset: ${351.86 - (351.86 * result.finalScore) / 100};
              }
            }

            .animate-score-circle {
              animation: scoreCircleDraw 1.5s ease-out forwards;
            }
          `}</style>
          <div className="absolute">
            <div className={`text-3xl font-bold ${getScoreColor(result.finalScore)}`}>
              {result.finalScore}
            </div>
            <div className="text-sm text-gray-500">/ 100</div>
          </div>
        </div>

        <p className="text-gray-700 max-w-2xl mx-auto">
          {translateSummary(result.domain, result.finalScore, result.status, !!result.checks?.exchange, currentLang)}
        </p>

        {result.checks?.exchange && (
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">{t.results.checks.exchange.verified}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}