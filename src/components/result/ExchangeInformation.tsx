import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ExternalLink, Info } from 'lucide-react'
import { ValidationResult } from '@/types/validation.types'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface ExchangeInformationProps {
  result: ValidationResult
  verificationType: string
}

export function ExchangeInformation({ result, verificationType }: ExchangeInformationProps) {
  const { t, language: currentLang } = useTranslation()

  // Only render for crypto verification type and when exchange is verified
  if (verificationType !== 'crypto' || !result.checks?.exchange || !result.checks.exchange.passed) {
    return null
  }

  return (
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
                    {result.checks?.exchange?.details?.image && (
                      <img
                        src={result.checks?.exchange?.details?.image}
                        alt={result.checks?.exchange?.details?.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span>{result.checks?.exchange?.details?.name || 'N/A'}</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.verificationStatus}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    result.checks?.exchange?.passed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.checks?.exchange?.passed ? t.results.exchangeInfo.verified : t.results.exchangeInfo.notVerified}
                  </span>
                </td>
              </tr>
              {result.checks?.exchange?.details?.country && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.country}</td>
                  <td className="py-2">{result.checks?.exchange?.details?.country}</td>
                </tr>
              )}
              {result.checks?.exchange?.details?.year_established && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.establishedYear}</td>
                  <td className="py-2">{result.checks?.exchange?.details?.year_established}</td>
                </tr>
              )}
              {result.checks?.exchange?.details?.url && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.officialWebsite}</td>
                  <td className="py-2">
                    <a
                      href={result.checks?.exchange?.details?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                    >
                      {result.checks?.exchange?.details?.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              )}
              {/* CryptoCompare additional data */}
              {result.checks?.exchange?.details?.totalVolume24h && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">24시간 총 거래량</td>
                  <td className="py-2">
                    <span className="text-gray-900 font-medium">
                      ${result.checks?.exchange?.details?.totalVolume24h?.toLocaleString()}
                    </span>
                    {result.checks?.exchange?.details?.totalTrades24h && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({result.checks?.exchange?.details?.totalTrades24h?.toLocaleString()} 거래)
                      </span>
                    )}
                  </td>
                </tr>
              )}

              {result.checks?.exchange?.details?.totalPairs && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">거래 쌍 수</td>
                  <td className="py-2">
                    <span className="text-gray-900">
                      {result.checks?.exchange?.details?.totalPairs?.toLocaleString()}개
                    </span>
                    {result.checks?.exchange?.details?.cryptocompareGrade && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        result.checks?.exchange?.details?.cryptocompareGrade === 'A' ? 'bg-green-100 text-green-800' :
                        result.checks?.exchange?.details?.cryptocompareGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                        result.checks?.exchange?.details?.cryptocompareGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        등급 {result.checks?.exchange?.details?.cryptocompareGrade}
                      </span>
                    )}
                  </td>
                </tr>
              )}

              {result.checks?.exchange?.details?.alert_notice && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.alert}</td>
                  <td className="py-2 text-orange-600">{result.checks?.exchange?.details?.alert_notice}</td>
                </tr>
              )}
              <tr className="border-b">
                <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.dataSource}</td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Primary data source */}
                    {result.checks?.exchange?.details?.dataSource && (
                      <div>
                        {result.checks?.exchange?.details?.refer_url ? (
                          <a
                            href={result.checks?.exchange?.details?.refer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                          >
                            {result.checks?.exchange?.details?.dataSource === 'coingecko' ? 'CoinGecko' :
                             result.checks?.exchange?.details?.dataSource === 'cryptocompare' ? 'CryptoCompare' :
                             result.checks?.exchange?.details?.dataSource}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {result.checks?.exchange?.details?.dataSource === 'coingecko' ? 'CoinGecko' :
                             result.checks?.exchange?.details?.dataSource === 'cryptocompare' ? 'CryptoCompare' :
                             result.checks?.exchange?.details?.dataSource}
                            <Info className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    )}

                    {/* Additional data sources */}
                    {result.checks?.exchange?.details?.dataSources &&
                     result.checks?.exchange?.details?.dataSources
                       .filter((source: string) => source !== result.checks?.exchange?.details?.dataSource && source !== 'cryptocompare')
                       .map((source: string, index: number) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {source}
                        <Info className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
              {result.checks?.exchange?.details?.batchDate && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.dataCollectionDate}</td>
                  <td className="py-2">
                    <span className="text-gray-600">
                      {new Date(result.checks?.exchange?.details?.batchDate).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                </tr>
              )}
              {result.checks?.exchange?.details?.lastUpdatedAt && (
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">{t.results.exchangeInfo.lastUpdate}</td>
                  <td className="py-2">
                    <span className="text-gray-600">
                      {new Date(result.checks?.exchange?.details?.lastUpdatedAt).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', {
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
  )
}