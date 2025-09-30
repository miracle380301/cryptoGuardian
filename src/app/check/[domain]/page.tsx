'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw, Share2, Shield, XCircle, CheckCircle, Info, ExternalLink, Flag } from 'lucide-react'
import { ValidationResult } from '@/types/validation.types'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { translateRecommendation, translateMessage } from '@/lib/i18n/translateMessage'
import { MainScoreCard } from '@/components/result/MainScoreCard'
import { MaliciousSiteEvidence } from '@/components/result/MaliciousSiteEvidence'
import { UserReportsSection } from '@/components/result/UserReportsSection'
import { ExchangeInformation } from '@/components/result/ExchangeInformation'
import { CheckEvidence } from '@/components/CheckEvidence'
import CheckExternalLinks from '@/components/CheckExternalLinks'
import { ReportModal } from '@/components/ReportModal'
import { ShareModal } from '@/components/ShareModal'
import { LoadingPage } from '@/components/LoadingPage'

export default function CheckResultPage() {
  const { t, language: currentLang } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const domain = decodeURIComponent(params.domain as string)
  const verificationType = searchParams.get('type') || 'general'
  // Get full URL from query parameter, fallback to domain if not provided
  const fullUrl = searchParams.get('url') ? decodeURIComponent(searchParams.get('url')!) : domain

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false)

  useEffect(() => {
    if (!isCheckingInProgress) {
      checkDomain()
    }
  }, [fullUrl])

  const checkDomain = async () => {
    if (isCheckingInProgress) {
      console.log('🚫 중복 요청 방지: 이미 검사 중입니다.')
      return
    }

    console.log('🚀 API 호출 시작:', fullUrl)
    setIsCheckingInProgress(true)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: fullUrl,  // Send full URL instead of just domain
          type: verificationType,
          language: currentLang
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      setIsCheckingInProgress(false)
      console.log('✅ API 호출 완료:', fullUrl)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.results.backButton}
            </Button>

            {/* Loading content that matches result page structure */}
            <LoadingPage domain={domain} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.results.backButton}
            </Button>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-900 mb-2">{t.results.hardcodedTexts.error}</h2>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={checkDomain}
                  className="mt-6"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t.results.hardcodedTexts.tryAgain}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  // Rename 'reputation' key to 'maliciousSite' if it exists
  if (result.checks?.reputation && !result.checks?.maliciousSite) {
    result.checks.maliciousSite = { ...result.checks.reputation }
    // Also move blacklistEvidence to maliciousSite if it exists
    if (result.checks.reputation.details?.blacklistEvidence) {
      result.checks.maliciousSite.details = {
        ...result.checks.maliciousSite.details,
        maliciousSite: result.checks.reputation.details.blacklistEvidence
      }
    }
    delete result.checks.reputation
  }

  // Debug logging
  // console.log('maliciousSite check exists:', !!result.checks?.maliciousSite)
  // console.log('All check keys:', Object.keys(result.checks))
  // console.log('maliciousSite data:', result.checks?.maliciousSite)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.results.backButton}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 font-semibold shadow-lg cursor-pointer"
              >
                <Flag className="mr-2 h-4 w-4" />
                {t.results.details.reportButton}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
                className="cursor-pointer"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t.results.details.shareButton}
              </Button>
            </div>
          </div>

          {/* Main Score Card */}
          <MainScoreCard result={result} />

          {/* Exchange Information (crypto only) */}
          <ExchangeInformation
            result={result}
            verificationType={verificationType}
          />

          {/* Malicious Site Evidence Section */}
          {result.checks?.maliciousSite && (
            <Card className="mb-4 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {result.checks.maliciousSite.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {t.results.checkNames?.[result.checks.maliciousSite.name as keyof typeof t.results.checkNames] || result.checks.maliciousSite.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                        {translateMessage(result.checks.maliciousSite.message, currentLang)}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${result.checks.maliciousSite.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {t.results.hardcodedTexts.score}: {result.checks.maliciousSite.score}/100
                        </span>
                        <span className="text-gray-400">
                          {t.results.hardcodedTexts.weight}: {((result.checks.maliciousSite.weight || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.checks.maliciousSite.score >= 80 ? 'bg-green-500' :
                        result.checks.maliciousSite.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.checks.maliciousSite.score}%` }}
                    />
                  </div>
                </div>

                {/* Malicious Site Evidence */}
                <MaliciousSiteEvidence
                  checkKey="maliciousSite"
                  check={result.checks.maliciousSite}
                  domain={result.domain}
                  currentLang={currentLang}
                />
              </CardContent>
            </Card>
          )}

          {/* User Reports Section */}
          {result.checks?.userReports && (
            <Card className="mb-4 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {result.checks.userReports.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {t.results.checkNames?.[result.checks.userReports.name as keyof typeof t.results.checkNames] || result.checks.userReports.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                        {translateMessage(result.checks.userReports.message, currentLang)}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${result.checks.userReports.passed ? 'text-green-600' : 'text-orange-600'}`}>
                          {t.results.hardcodedTexts.score}: {result.checks.userReports.score}/100
                        </span>
                        <span className="text-gray-400">
                          {t.results.hardcodedTexts.weight}: {((result.checks.userReports.weight || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.checks.userReports.score >= 80 ? 'bg-green-500' :
                        result.checks.userReports.score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${result.checks.userReports.score}%` }}
                    />
                  </div>
                </div>

                {/* User Reports Evidence */}
                <UserReportsSection
                  checkKey="userReports"
                  check={result.checks.userReports}
                  domain={result.domain}
                  currentLang={currentLang}
                />
              </CardContent>
            </Card>
          )}

          {/* Detailed Checks */}
          <div className="grid gap-4 mb-8">
            {Object.entries(result.checks)
              .filter(([key, check]) => {
                // Exchange는 별도 테이블로 표시
                if (key === 'exchange') return false;

                // maliciousSite는 별도 섹션으로 표시
                if (key === 'maliciousSite') return false;

                // userReports는 별도 섹션으로 표시
                if (key === 'userReports') return false;

                // weight가 0인 체크들은 스킵된 체크이므로 표시하지 않음
                if (check.weight === 0) {
                  return false;
                }

                // 스킵된 체크들은 표시하지 않음
                if (check.message && (check.message.includes('Skipped') || check.message.includes('Not needed'))) {
                  return false;
                }

                return true;
              })
              .sort(([keyA], [keyB]) => {
                // 검사 항목 순서 정의
                const order = [
                  'maliciousSite',    // 1. 악성 사이트 검사
                  'whois',           // 2. 도메인 등록 정보
                  'ssl',             // 3. SSL 인증서
                  'aiPhishing',      // 4. AI 피싱 패턴 분석
                  'aiSuspiciousDomain', // 5. AI 의심 도메인 탐지
                  'safeBrowsing',    // 6. 안전 브라우징
                  'userReports',     // 7. 사용자 신고
                  'exchange'         // 8. 거래소 검증
                ];

                const indexA = order.indexOf(keyA);
                const indexB = order.indexOf(keyB);

                // 정의된 순서가 있으면 해당 순서로, 없으면 맨 뒤로
                const priorityA = indexA !== -1 ? indexA : 999;
                const priorityB = indexB !== -1 ? indexB : 999;

                return priorityA - priorityB;
              })
              .map(([key, check]) => (
                <Card key={key} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {check.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {t.results.checkNames?.[check.name as keyof typeof t.results.checkNames] || check.name}
                            </h3>
                            <CheckExternalLinks
                              checkType={key as 'whois' | 'ssl' | 'safeBrowsing'}
                              domain={result.domain}
                              translations={t.results.hardcodedTexts}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                            {translateMessage(check.message, currentLang)}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`font-medium ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {t.results.hardcodedTexts.score}: {check.score}/100
                            </span>
                            <span className="text-gray-400">
                              {t.results.hardcodedTexts.weight}: {(check.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            check.score >= 80 ? 'bg-green-500' :
                            check.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${check.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Evidence Details */}
                    <CheckEvidence
                      checkKey={key}
                      check={check}
                      domain={result.domain}
                      currentLang={currentLang}
                    />

                  </CardContent>
                </Card>
              ))}
            </div>

          {/* Recommendations */}
          {(true) && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  {t.results.hardcodedTexts.recommendations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations && result.recommendations.length > 0 ? (
                    result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="text-gray-700">{translateRecommendation(rec, currentLang)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">권장사항이 없습니다.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Report Modal */}
          <ReportModal
            domain={result.domain}
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
          />

          {/* Share Modal */}
          <ShareModal
            domain={result.domain}
            score={result.finalScore}
            status={result.status}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
