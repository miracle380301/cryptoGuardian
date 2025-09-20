'use client'

import { ValidationResult } from '@/types/api.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Shield, Globe, Calendar, TrendingUp } from 'lucide-react'

interface CryptoExchangeTableProps {
  result: ValidationResult
}

export function CryptoExchangeTable({ result }: CryptoExchangeTableProps) {
  const getStatusIcon = (passed: boolean) => {
    return passed ?
      <CheckCircle className="w-4 h-4 text-green-600" /> :
      <XCircle className="w-4 h-4 text-red-600" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800'
    if (score >= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  // Exchange specific data
  const exchangeData = result.checks.exchange?.details

  return (
    <div className="space-y-6">
      {/* Exchange Overview */}
      {exchangeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              거래소 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">거래소명</div>
                <div className="font-semibold text-lg">{exchangeData.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">신뢰도 점수</div>
                <div className="flex items-center gap-2">
                  <Badge className={getTrustScoreColor(exchangeData.trust_score)}>
                    {exchangeData.trust_score}/10
                  </Badge>
                  <span className="text-sm text-gray-600">#{exchangeData.trust_score_rank}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">24시간 거래량</div>
                <div className="font-semibold">
                  {exchangeData.trade_volume_24h_btc?.toLocaleString()} BTC
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">설립년도</div>
                <div className="font-semibold">
                  {exchangeData.established_year || 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">국가</div>
                <div className="font-semibold">{exchangeData.country || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">중앙화</div>
                <div className="flex items-center gap-1">
                  {exchangeData.centralized ?
                    <CheckCircle className="w-4 h-4 text-blue-600" /> :
                    <XCircle className="w-4 h-4 text-gray-400" />
                  }
                  <span>{exchangeData.centralized ? '중앙화' : '탈중앙화'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">검증 상태</div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(exchangeData.is_verified)}
                  <span>{exchangeData.is_verified ? '검증됨' : '미검증'}</span>
                </div>
              </div>
            </div>

            {exchangeData.url && (
              <div className="mt-4">
                <a
                  href={exchangeData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  공식 웹사이트 방문
                </a>
              </div>
            )}

            {(exchangeData.public_notice || exchangeData.alert_notice) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">주의사항</div>
                    {exchangeData.public_notice && (
                      <div className="text-sm text-yellow-700 mt-1">{exchangeData.public_notice}</div>
                    )}
                    {exchangeData.alert_notice && (
                      <div className="text-sm text-yellow-700 mt-1">{exchangeData.alert_notice}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Assessment Table */}
      <Card>
        <CardHeader>
          <CardTitle>보안 평가 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">검사 항목</th>
                  <th className="text-center py-3 px-4">상태</th>
                  <th className="text-center py-3 px-4">점수</th>
                  <th className="text-center py-3 px-4">가중치</th>
                  <th className="text-left py-3 px-4">세부 정보</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.checks).map(([key, check]) => (
                  <tr key={key} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium">{check.name}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusIcon(check.passed)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={getScoreColor(check.score)}>
                        {check.score}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm text-gray-600">
                        {(check.weight * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-700 max-w-md">
                        {check.message}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 w-32">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              check.score >= 80 ? 'bg-green-500' :
                              check.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${check.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Crypto-specific Security Checks */}
      {(result.checks.teamScam || result.checks.cryptoExchange || result.checks.koreanCryptoScam) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              암호화폐 보안 검사
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {result.checks.teamScam && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.checks.teamScam.passed)}
                    <div>
                      <div className="font-medium">팀 스캠 탐지</div>
                      <div className="text-sm text-gray-600">{result.checks.teamScam.message}</div>
                    </div>
                  </div>
                  <Badge className={getScoreColor(result.checks.teamScam.score)}>
                    {result.checks.teamScam.score}
                  </Badge>
                </div>
              )}

              {result.checks.cryptoExchange && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.checks.cryptoExchange.passed)}
                    <div>
                      <div className="font-medium">거래소 사칭 탐지</div>
                      <div className="text-sm text-gray-600">{result.checks.cryptoExchange.message}</div>
                    </div>
                  </div>
                  <Badge className={getScoreColor(result.checks.cryptoExchange.score)}>
                    {result.checks.cryptoExchange.score}
                  </Badge>
                </div>
              )}

              {result.checks.koreanCryptoScam && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.checks.koreanCryptoScam.passed)}
                    <div>
                      <div className="font-medium">한국형 암호화폐 스캠 탐지</div>
                      <div className="text-sm text-gray-600">{result.checks.koreanCryptoScam.message}</div>
                    </div>
                  </div>
                  <Badge className={getScoreColor(result.checks.koreanCryptoScam.score)}>
                    {result.checks.koreanCryptoScam.score}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}