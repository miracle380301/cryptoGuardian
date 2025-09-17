'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw, Share2, Shield, AlertTriangle, XCircle, CheckCircle, Info, ExternalLink } from 'lucide-react'
import { ValidationResult } from '@/types/api.types'

export default function CheckResultPage() {
  const params = useParams()
  const router = useRouter()
  const domain = decodeURIComponent(params.domain as string)

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        body: JSON.stringify({ domain }),
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
              Back to Check
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
              Back to Check
            </Button>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={checkDomain}
                  className="mt-6"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
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
              Check Another Site
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkDomain}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recheck
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Main Score Card */}
          <Card className={`mb-8 ${getScoreBackground(result.finalScore)} border-2`}>
            <CardHeader className="text-center pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Security Analysis for {result.domain}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                {getStatusIcon(result.status)}
                <span className={`text-lg font-medium ${getScoreColor(result.finalScore)}`}>
                  {result.status === 'safe' ? 'SAFE' :
                   result.status === 'warning' ? 'CAUTION' : 'DANGER'}
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
                {result.summary}
              </p>

              {result.checks.exchange && (
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified Exchange</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Checks */}
          <div className="grid gap-4 mb-8">
            {Object.entries(result.checks).map(([key, check]) => (
              <Card key={key} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getCheckIcon(check.passed)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {check.name}
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
                                <span>View WHOIS</span>
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
                                  <span>SSL Labs</span>
                                </a>
                                <a
                                  href={`https://crt.sh/?q=${result.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                  title="Certificate Transparency Logs"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>CT Logs</span>
                                </a>
                                <a
                                  href={`https://transparencyreport.google.com/https/certificates?domain=${result.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                  title="Google Certificate Transparency"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Google CT</span>
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
                                  <span>Safe Browsing</span>
                                </a>
                                <a
                                  href={`https://sitecheck.sucuri.net/results/${result.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                  title="Sucuri Website Security Check"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Sucuri</span>
                                </a>
                                <a
                                  href={`https://www.urlvoid.com/scan/${result.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                  title="URLVoid Malware Scanner"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>URLVoid</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                          {check.message}
                        </p>

                        {/* Show detection sources if reported */}
                        {key === 'reputation' && check.details?.details && (
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
                                          Detected in {detection.source}
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
                                      Clean in all databases
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">
                                      Checked: KISA, VirusTotal, PhishTank, CryptoScamDB, FCA, SEC
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-medium ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                            Score: {check.score}/100
                          </span>
                          <span className="text-gray-400">
                            Weight: {(check.weight * 100).toFixed(0)}%
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
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}



          {/* Footer info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last checked: {new Date(result.timestamp).toLocaleString()}</p>
            {result.cached && (
              <p className="mt-1">Results from cache</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}