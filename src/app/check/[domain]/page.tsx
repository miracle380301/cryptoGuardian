'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw, Share2, Shield, AlertTriangle, XCircle, CheckCircle, Info, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { ValidationResult } from '@/types/api.types'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { translateMessage, translateSummary, translateRecommendation } from '@/lib/i18n/translateMessage'

export default function CheckResultPage() {
  const { t, language: currentLang } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const domain = decodeURIComponent(params.domain as string)
  const verificationType = searchParams.get('type') || 'general'

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedEvidence, setExpandedEvidence] = useState<{[key: string]: number}>({}) // checkKey: expandedIndex

  useEffect(() => {
    checkDomain()
  }, [domain])

  const checkDomain = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          type: verificationType
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
    }
  }

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

  const getCheckIcon = (passed: boolean) => {
    return passed ?
      <CheckCircle className="w-5 h-5 text-green-600" /> :
      <XCircle className="w-5 h-5 text-red-600" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.results.backButton}
            </Button>

            <Card className="mb-8 animate-pulse">
              <CardHeader className="text-center pb-8">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-24 bg-gray-200 rounded-full w-24 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
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
                variant="outline"
                size="sm"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t.results.details.shareButton}
              </Button>
            </div>
          </div>

          {/* Main Score Card */}
          <Card className={`mb-8 ${getScoreBackground(result.finalScore)} border-2`}>
            <CardHeader className="text-center pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t.results.title} - {result.domain}
              </h1>
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
                {translateSummary(result.domain, result.finalScore, result.status, !!result.checks.exchange, currentLang)}
              </p>

              {result.checks.exchange && (
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.results.checks.exchange.verified}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exchange Information (crypto only) */}
          {verificationType === 'crypto' && result.checks.exchange && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t.results.exchangeInfo.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.exchangeName}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-3">
                            {result.checks.exchange.details?.image && (
                              <img
                                src={result.checks.exchange.details.image}
                                alt={result.checks.exchange.details.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <span>{result.checks.exchange.details?.name || 'N/A'}</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.verificationStatus}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.checks.exchange.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.checks.exchange.passed ? t.results.exchangeInfo.verified : t.results.exchangeInfo.notVerified}
                          </span>
                        </td>
                      </tr>
                      {result.checks.exchange.details?.country && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.country}</td>
                          <td className="py-2">{result.checks.exchange.details.country}</td>
                        </tr>
                      )}
                      {result.checks.exchange.details?.year_established && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.establishedYear}</td>
                          <td className="py-2">{result.checks.exchange.details.year_established}</td>
                        </tr>
                      )}
                      {result.checks.exchange.details?.url && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.officialWebsite}</td>
                          <td className="py-2">
                            <a
                              href={result.checks.exchange.details.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                            >
                              {result.checks.exchange.details.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      )}
                      {/* CryptoCompare additional data */}
                      {result.checks.exchange.details?.totalVolume24h && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">24시간 총 거래량</td>
                          <td className="py-2">
                            <span className="text-gray-900 font-medium">
                              ${result.checks.exchange.details.totalVolume24h.toLocaleString()}
                            </span>
                            {result.checks.exchange.details?.totalTrades24h && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({result.checks.exchange.details.totalTrades24h.toLocaleString()} 거래)
                              </span>
                            )}
                          </td>
                        </tr>
                      )}

                      {result.checks.exchange.details?.totalPairs && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">거래 쌍 수</td>
                          <td className="py-2">
                            <span className="text-gray-900">
                              {result.checks.exchange.details.totalPairs.toLocaleString()}개
                            </span>
                            {result.checks.exchange.details?.cryptocompareGrade && (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                result.checks.exchange.details.cryptocompareGrade === 'A' ? 'bg-green-100 text-green-800' :
                                result.checks.exchange.details.cryptocompareGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                                result.checks.exchange.details.cryptocompareGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                등급 {result.checks.exchange.details.cryptocompareGrade}
                              </span>
                            )}
                          </td>
                        </tr>
                      )}

                      {result.checks.exchange.details?.alert_notice && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.alert}</td>
                          <td className="py-2 text-orange-600">{result.checks.exchange.details.alert_notice}</td>
                        </tr>
                      )}
                      <tr className="border-b">
                        <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.dataSource}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-2">
                            {/* Primary data source */}
                            {result.checks.exchange.details?.dataSource && (
                              <div>
                                {result.checks.exchange.details?.refer_url ? (
                                  <a
                                    href={result.checks.exchange.details.refer_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                                  >
                                    {result.checks.exchange.details.dataSource === 'coingecko' ? 'CoinGecko' :
                                     result.checks.exchange.details.dataSource === 'cryptocompare' ? 'CryptoCompare' :
                                     result.checks.exchange.details.dataSource}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {result.checks.exchange.details.dataSource === 'coingecko' ? 'CoinGecko' :
                                     result.checks.exchange.details.dataSource === 'cryptocompare' ? 'CryptoCompare' :
                                     result.checks.exchange.details.dataSource}
                                    <Info className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            )}


                            {/* Additional data sources */}
                            {result.checks.exchange.details?.dataSources &&
                             result.checks.exchange.details.dataSources
                               .filter(source => source !== result.checks.exchange.details?.dataSource && source !== 'cryptocompare')
                               .map((source, index) => (
                              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                {source}
                                <Info className="w-3 h-3" />
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {result.checks.exchange.details?.batchDate && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.dataCollectionDate}</td>
                          <td className="py-2">
                            <span className="text-gray-600">
                              {new Date(result.checks.exchange.details.batchDate).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </td>
                        </tr>
                      )}
                      {result.checks.exchange.details?.lastUpdatedAt && (
                        <tr className="border-b">
                          <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.lastUpdate}</td>
                          <td className="py-2">
                            <span className="text-gray-600">
                              {new Date(result.checks.exchange.details.lastUpdatedAt).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Checks */}
          <div className="grid gap-4 mb-8">
            {Object.entries(result.checks)
              .filter(([key, check]) => {
                // Exchange는 별도 테이블로 표시
                if (key === 'exchange') return false;

                // weight가 0인 체크들은 스킵된 체크이므로 표시하지 않음
                if (check.weight === 0) {
                  return false;
                }

                // 스킵된 체크들은 표시하지 않음 (message에 'Skipped'가 포함된 경우)
                if (check.message && check.message.includes('Skipped')) {
                  return false;
                }

                return true;
              })
              .sort(([keyA], [keyB]) => {
                // Malicious Site Check를 맨 위로
                if (keyA === 'maliciousSite') return -1;
                if (keyB === 'maliciousSite') return 1;

                // reputation (backward compatibility)을 그 다음으로
                if (keyA === 'reputation') return -1;
                if (keyB === 'reputation') return 1;

                // 나머지는 기본 순서 유지
                return 0;
              })
              .map(([key, check]) => (
                <Card key={key} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getCheckIcon(check.passed)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {t.results.checkNames?.[check.name as keyof typeof t.results.checkNames] || check.name}
                            </h3>
                            <div className="flex gap-2">
                              {key === 'whois' && (
                                <a
                                  href={`https://www.whois.com/whois/${result.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{t.results.hardcodedTexts.viewWhois}</span>
                                </a>
                              )}
                              {key === 'ssl' && (
                                <div className="flex gap-2">
                                  <a
                                    href={`https://www.ssllabs.com/ssltest/analyze.html?d=${result.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    title="Qualys SSL Labs Test"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{t.results.hardcodedTexts.sslLabs}</span>
                                  </a>
                                  <a
                                    href={`https://crt.sh/?q=${result.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    title="Certificate Transparency Logs"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{t.results.hardcodedTexts.ctLogs}</span>
                                  </a>
                                  <a
                                    href={`https://transparencyreport.google.com/https/certificates?domain=${result.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    title="Google Certificate Transparency"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{t.results.hardcodedTexts.googleCT}</span>
                                  </a>
                                </div>
                              )}
                              {key === 'safeBrowsing' && (
                                <div className="flex gap-2">
                                  <a
                                    href={`https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent('http://' + result.domain)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    title="Google Safe Browsing Status"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{t.results.hardcodedTexts.safeBrowsing}</span>
                                  </a>
                                  <a
                                    href={`https://sitecheck.sucuri.net/results/${result.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    title="Sucuri Website Security Check"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{t.results.hardcodedTexts.sucuri}</span>
                                  </a>
                                  <a
                                    href={`https://www.urlvoid.com/scan/${result.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    title="URLVoid Malware Scanner"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{t.results.hardcodedTexts.urlVoid}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                            {translateMessage(check.message, currentLang)}
                          </p>

                          {/* Show BlacklistedDomain evidence if available */}
                          {(key === 'reputation' || key === 'maliciousSite') && check.details?.blacklistEvidence && (() => {
                            // blacklistEvidence를 배열로 처리 (향후 여러 증거 지원)
                            const evidenceList = Array.isArray(check.details.blacklistEvidence)
                              ? check.details.blacklistEvidence
                              : [check.details.blacklistEvidence];

                            const currentExpanded = expandedEvidence[key] ?? 0;

                            return (
                              <div className="mt-3 space-y-2">
                                {evidenceList.map((evidence: any, index: number) => {
                                  const isExpanded = currentExpanded === index;
                                  const isFirst = index === 0;

                                  return (
                                    <div
                                      key={index}
                                      className={`border rounded-lg shadow-sm overflow-hidden ${
                                        isFirst ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' : 'bg-gray-50 border-gray-200'
                                      }`}
                                    >
                                      {/* 헤더 - 클릭 가능 */}
                                      <div
                                        className={`p-3 cursor-pointer hover:bg-opacity-80 transition-colors ${
                                          isFirst ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-400'
                                        }`}
                                        onClick={() => setExpandedEvidence(prev => ({
                                          ...prev,
                                          [key]: isExpanded ? -1 : index
                                        }))}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                              isFirst ? 'bg-red-500' : 'bg-gray-400'
                                            }`}></div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-800">
                                                {evidence.reportedBy || (currentLang === 'ko' ? '보안 데이터베이스' : 'Security Database')}
                                              </span>
                                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                evidence.severity === 'critical' ? 'bg-red-200 text-red-900' :
                                                evidence.severity === 'high' ? 'bg-red-200 text-red-900' :
                                                evidence.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                                                'bg-gray-200 text-gray-900'
                                              }`}>
                                                {currentLang === 'ko' ? (
                                                  evidence.severity === 'high' ? '높음' :
                                                  evidence.severity === 'medium' ? '중간' :
                                                  evidence.severity === 'low' ? '낮음' :
                                                  evidence.severity === 'critical' ? '매우 높음' :
                                                  evidence.severity
                                                ) : (
                                                  evidence.severity === 'high' ? 'High' :
                                                  evidence.severity === 'medium' ? 'Medium' :
                                                  evidence.severity === 'low' ? 'Low' :
                                                  evidence.severity === 'critical' ? 'Critical' :
                                                  evidence.severity
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {evidenceList.length > 1 && (
                                              <span className="text-xs text-gray-500">
                                                {index + 1}/{evidenceList.length}
                                              </span>
                                            )}
                                            {isExpanded ? (
                                              <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                          </div>
                                        </div>

                                        {!isExpanded && (
                                          <div className="mt-2 text-xs text-gray-600">
                                            {currentLang === 'ko' ? (
                                              evidence.riskLevel === 'phishing' ? '피싱' :
                                              evidence.riskLevel === 'crypto-scam' ? '암호화폐 스캠' :
                                              evidence.riskLevel === 'malware' ? '악성코드' :
                                              evidence.riskLevel === 'fraud' ? '사기' :
                                              evidence.riskLevel
                                            ) : (
                                              evidence.riskLevel === 'phishing' ? 'Phishing' :
                                              evidence.riskLevel === 'crypto-scam' ? 'Crypto Scam' :
                                              evidence.riskLevel === 'malware' ? 'Malware' :
                                              evidence.riskLevel === 'fraud' ? 'Fraud' :
                                              evidence.riskLevel
                                            )} • {evidence.reportDate ? new Date(evidence.reportDate).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US') : (currentLang === 'ko' ? '신고일 미상' : 'Report date unknown')}
                                          </div>
                                        )}
                                      </div>

                                      {/* 상세 내용 - 펼쳐졌을 때만 표시 */}
                                      {isExpanded && (
                                        <div className="p-4 bg-white border-t">
                                          <div className="grid gap-3">
                                            {evidence.targetBrand && (
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                <span className="text-sm text-gray-700">
                                                  <strong>{currentLang === 'ko' ? '사칭 대상:' : 'Impersonated Brand:'}</strong> <span className="text-orange-700 font-medium">{evidence.targetBrand}</span>
                                                </span>
                                              </div>
                                            )}

                                            {evidence.riskLevel && (
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                <span className="text-sm text-gray-700">
                                                  <strong>{currentLang === 'ko' ? '위험 유형:' : 'Risk Type:'}</strong>
                                                  <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                    {currentLang === 'ko' ? (
                                                      evidence.riskLevel === 'phishing' ? '피싱' :
                                                      evidence.riskLevel === 'crypto-scam' ? '암호화폐 스캠' :
                                                      evidence.riskLevel === 'malware' ? '악성코드' :
                                                      evidence.riskLevel === 'fraud' ? '사기' :
                                                      evidence.riskLevel
                                                    ) : (
                                                      evidence.riskLevel === 'phishing' ? 'Phishing' :
                                                      evidence.riskLevel === 'crypto-scam' ? 'Crypto Scam' :
                                                      evidence.riskLevel === 'malware' ? 'Malware' :
                                                      evidence.riskLevel === 'fraud' ? 'Fraud' :
                                                      evidence.riskLevel
                                                    )}
                                                  </span>
                                                </span>
                                              </div>
                                            )}

                                            {evidence.reportDate && (
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-gray-700">
                                                  <strong>{currentLang === 'ko' ? '신고일:' : 'Report Date:'}</strong> {new Date(evidence.reportDate).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US')}
                                                </span>
                                              </div>
                                            )}

                                            {evidence.description && (
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                <span className="text-sm text-gray-700">
                                                  <strong>{currentLang === 'ko' ? '신고 내용:' : 'Report Details:'}</strong> {evidence.description}
                                                </span>
                                              </div>
                                            )}

                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Show detection sources if reported */}
                          {(key === 'reputation' || key === 'maliciousSite') && check.details?.details && (
                            <div className="mt-3 space-y-2">
                              {check.details.details
                                .filter((d: any) => d.isReported)
                                .map((detection: any, idx: number) => {
                                  // Choose color based on risk level
                                  const bgColor = detection.riskLevel === 'malicious' ? 'bg-red-50 border-red-200' :
                                                detection.riskLevel === 'suspicious' ? 'bg-yellow-50 border-yellow-200' :
                                                'bg-gray-50 border-gray-200';
                                  const textColor = detection.riskLevel === 'malicious' ? 'text-red-800' :
                                                  detection.riskLevel === 'suspicious' ? 'text-yellow-800' :
                                                  'text-gray-800';

                                  // Get evidence URL
                                  let evidenceUrl = detection.evidenceUrl;
                                  let linkText = detection.source;

                                  // Set specific URLs for each source
                                  switch (detection.source) {
                                    case 'KISA':
                                      evidenceUrl = `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(result.domain)}`;
                                      linkText = 'KISA';
                                      break;
                                    case 'VirusTotal':
                                      evidenceUrl = `https://www.virustotal.com/gui/domain/${result.domain}`;
                                      linkText = 'VirusTotal';
                                      break;
                                    case 'PhishTank':
                                      evidenceUrl = `https://phishtank.org/check_url.php`;
                                      linkText = 'PhishTank';
                                      break;
                                    case 'CryptoScamDB':
                                      evidenceUrl = `https://cryptoscamdb.org/search`;
                                      linkText = 'CryptoScamDB';
                                      break;
                                    case 'FCA':
                                      evidenceUrl = `https://register.fca.org.uk/s/search?q=${encodeURIComponent(result.domain)}`;
                                      linkText = 'FCA';
                                      break;
                                    case 'SEC':
                                      evidenceUrl = `https://www.sec.gov/edgar/searchedgar/companysearch?q=${encodeURIComponent(result.domain)}`;
                                      linkText = 'SEC';
                                      break;
                                  }

                                  return (
                                    <div key={idx} className={`p-3 ${bgColor} border rounded-lg`}>
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className={`text-sm font-semibold ${textColor}`}>
                                            {t.results.hardcodedTexts.detectedIn} {detection.source}
                                          </p>
                                        </div>
                                        <a
                                          href={evidenceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          <span>{linkText}</span>
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}

                              {/* Show clean databases if no threats */}
                              {!check.details.details.some((d: any) => d.isReported) && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-green-800">
                                        {t.results.hardcodedTexts.cleanInAllDatabases}
                                      </p>
                                      <p className="text-xs text-green-700 mt-1">
                                        {t.results.hardcodedTexts.checked}: KISA, VirusTotal, PhishTank, CryptoScamDB, FCA, SEC
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
                  {result.recommendations && result.recommendations.length > 0 ?
                    result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="text-gray-700">{translateRecommendation(rec, currentLang)}</span>
                      </li>
                    )) :
                    <li className="text-gray-500">권장사항이 없습니다.</li>
                  }
                </ul>
              </CardContent>
            </Card>
          )}



          {/* Footer info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>{t.results.hardcodedTexts.lastChecked}: {new Date(result.timestamp).toLocaleString()}</p>
            {result.cached && (
              <p className="mt-1">{t.results.hardcodedTexts.resultsFromCache}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}