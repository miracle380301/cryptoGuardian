import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface CheckEvidenceProps {
  checkKey: string
  check: any
  domain: string
  currentLang: string
}

export function CheckEvidence({ checkKey, check, domain, currentLang }: CheckEvidenceProps) {
  const { t } = useTranslation()
  const [expandedEvidence, setExpandedEvidence] = useState<{ [key: string]: number }>({})

  // Only render for checks that have evidence/details sections
  if (!shouldShowEvidence(checkKey, check)) {
    return null
  }

  return (
    <>
      {/* Blacklist Evidence Section */}
      {(checkKey === 'blacklist' || checkKey === 'reputation' || checkKey === 'maliciousSite') && check.details?.blacklistEvidence && (
        <div className="mt-3 space-y-2">
          {renderBlacklistEvidence(check.details.blacklistEvidence, checkKey, expandedEvidence, setExpandedEvidence, currentLang)}
        </div>
      )}

      {/* Detection Sources Section */}
      {(checkKey === 'reputation' || checkKey === 'maliciousSite') && check.details?.details && (
        <div className="mt-3 space-y-2">
          {check.details.details
            .filter((d: any) => d.isReported)
            .map((detection: any, idx: number) => (
              <div key={idx} className={`p-3 rounded-lg border ${getDetectionBgColor(detection.riskLevel)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getDetectionDotColor(detection.riskLevel)}`}></div>
                    <span className={`text-sm font-medium ${getDetectionTextColor(detection.riskLevel)}`}>
                      {detection.source}
                    </span>
                    {detection.detections > 0 && (
                      <span className="text-xs text-gray-500">
                        ({detection.detections} {currentLang === 'ko' ? '탐지' : 'detections'})
                      </span>
                    )}
                  </div>
                  {getEvidenceUrl(detection, domain) && (
                    <a
                      href={getEvidenceUrl(detection, domain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {currentLang === 'ko' ? '증거 보기' : 'View Evidence'}
                    </a>
                  )}
                </div>
                {detection.message && (
                  <p className="mt-2 text-xs text-gray-600">{detection.message}</p>
                )}
              </div>
            ))}

          {/* Clean databases message */}
          {!check.details.details.some((d: any) => d.isReported) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  {t.results.hardcodedTexts.cleanInAllDatabases}
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {t.results.hardcodedTexts.checked}: KISA, VirusTotal, PhishTank, CryptoScamDB, FCA, SEC
              </p>
            </div>
          )}
        </div>
      )}

      {/* WHOIS Details */}
      {checkKey === 'whois' && check.details && (
        <div className="mt-3 space-y-2">
          {/* Domain Age */}
          {check.details.domain_age_days !== undefined && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  {currentLang === 'ko' ? '도메인 나이' : 'Domain Age'}
                </span>
              </div>
              <p className="text-xs text-blue-700">
                {check.details.domain_age_days > 365
                  ? `${Math.floor(check.details.domain_age_days / 365)} ${currentLang === 'ko' ? '년' : 'years'} (${check.details.domain_age_days} ${currentLang === 'ko' ? '일' : 'days'})`
                  : `${check.details.domain_age_days} ${currentLang === 'ko' ? '일' : 'days'}`
                }
              </p>
              {check.details.creation_date && (
                <p className="text-xs text-blue-600 mt-1">
                  {currentLang === 'ko' ? '등록일: ' : 'Registered: '}
                  {new Date(check.details.creation_date).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US')}
                </p>
              )}
            </div>
          )}

          {/* Domain Status */}
          {check.details.status && check.details.status.length > 0 && (
            <div className={`p-3 rounded-lg border ${getDomainStatusColor(check.details.status).bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${getDomainStatusColor(check.details.status).dot}`}></div>
                <span className={`text-sm font-medium ${getDomainStatusColor(check.details.status).text}`}>
                  {currentLang === 'ko' ? '도메인 상태' : 'Domain Status'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {check.details.status.map((status: string, idx: number) => (
                  <span key={idx} className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(status)}`}>
                    {getDomainStatusLabel(status, currentLang)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Registrar Info */}
          {check.details.registrar && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-800">
                  {currentLang === 'ko' ? '등록 기관' : 'Registrar'}
                </span>
              </div>
              <p className="text-xs text-gray-700">{check.details.registrar}</p>
            </div>
          )}
        </div>
      )}

      {/* Domain Age/Registration Details (legacy) */}
      {checkKey === 'domain' && check.details?.domainAge && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">
              {currentLang === 'ko' ? '도메인 등록일' : 'Domain Registration'}
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {check.details.domainAge} {currentLang === 'ko' ? '일 전 등록됨' : 'days ago'}
          </p>
        </div>
      )}

      {/* SSL Certificate Details */}
      {checkKey === 'ssl' && check.details?.certificate && (
        <div className="mt-3 space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {currentLang === 'ko' ? 'SSL 인증서 유효' : 'SSL Certificate Valid'}
              </span>
            </div>
            {check.details.certificate.expiryDate && (
              <p className="text-xs text-green-700 mt-1">
                {currentLang === 'ko' ? '만료일' : 'Expires'}: {new Date(check.details.certificate.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Safe Browsing Details */}
      {checkKey === 'safeBrowsing' && check.details?.safeBrowsing?.threats && check.details.safeBrowsing.threats.length > 0 && (
        <div className="mt-3 space-y-2">
          {check.details.safeBrowsing.threats.map((threat: any, idx: number) => (
            <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {getThreatTypeLabel(threat.threatType, currentLang) || (currentLang === 'ko' ? '위험 탐지' : 'Threat Detected')}
                </span>
              </div>
              {threat.platformType && (
                <p className="text-xs text-red-700 mt-1">
                  <strong>{currentLang === 'ko' ? '플랫폼:' : 'Platform:'}</strong> {threat.platformType}
                </p>
              )}
              {threat.threatEntryType && (
                <p className="text-xs text-red-700 mt-1">
                  <strong>{currentLang === 'ko' ? '탐지 대상:' : 'Entry Type:'}</strong> {threat.threatEntryType}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// Helper functions
function shouldShowEvidence(checkKey: string, check: any): boolean {
  return (
    (checkKey === 'blacklist' || checkKey === 'reputation' || checkKey === 'maliciousSite') &&
    (check.details?.blacklistEvidence || check.details?.details)
  ) || (
    checkKey === 'whois' && check.details
  ) || (
    checkKey === 'domain' && check.details?.domainAge
  ) || (
    checkKey === 'ssl' && check.details?.certificate
  ) || (
    checkKey === 'safeBrowsing' && check.details?.safeBrowsing?.threats
  )
}

function renderBlacklistEvidence(evidenceList: any, checkKey: string, expandedEvidence: any, setExpandedEvidence: any, currentLang: string) {
  const evidence = Array.isArray(evidenceList) ? evidenceList : [evidenceList]
  const currentExpanded = expandedEvidence[checkKey] ?? -1

  return evidence.map((item: any, index: number) => {
    const isExpanded = currentExpanded === index
    const isFirst = index === 0

    return (
      <div
        key={index}
        className={`border rounded-lg shadow-sm overflow-hidden ${
          isFirst ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div
          className={`p-3 cursor-pointer hover:bg-opacity-80 transition-colors ${
            isFirst ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-400'
          }`}
          onClick={() => setExpandedEvidence((prev: any) => ({
            ...prev,
            [checkKey]: isExpanded ? -1 : index
          }))}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isFirst ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {item.reportedBy || (currentLang === 'ko' ? '보안 데이터베이스' : 'Security Database')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSeverityBadgeColor(item.severity)}`}>
                  {getSeverityLabel(item.severity, currentLang)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {evidence.length > 1 && (
                <span className="text-xs text-gray-500">
                  {index + 1}/{evidence.length}
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
              {getRiskLevelLabel(item.riskLevel, currentLang)} • {
                item.reportDate ?
                new Date(item.reportDate).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US') :
                (currentLang === 'ko' ? '신고일 미상' : 'Report date unknown')
              }
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="p-4 bg-white border-t">
            <div className="grid gap-3">
              {item.targetBrand && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    <strong>{currentLang === 'ko' ? '사칭 대상:' : 'Impersonated Brand:'}</strong>{' '}
                    <span className="text-orange-700 font-medium">{item.targetBrand}</span>
                  </span>
                </div>
              )}

              {item.riskLevel && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    <strong>{currentLang === 'ko' ? '위험 유형:' : 'Risk Type:'}</strong>
                    <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {getRiskLevelLabel(item.riskLevel, currentLang)}
                    </span>
                  </span>
                </div>
              )}

              {item.reportDate && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    <strong>{currentLang === 'ko' ? '신고일:' : 'Report Date:'}</strong>{' '}
                    {new Date(item.reportDate).toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US')}
                  </span>
                </div>
              )}

              {item.description && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    <strong>{currentLang === 'ko' ? '신고 내용:' : 'Report Details:'}</strong> {item.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  })
}

function getDetectionBgColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'malicious': return 'bg-red-50 border-red-200'
    case 'suspicious': return 'bg-yellow-50 border-yellow-200'
    default: return 'bg-gray-50 border-gray-200'
  }
}

function getDetectionDotColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'malicious': return 'bg-red-500'
    case 'suspicious': return 'bg-yellow-500'
    default: return 'bg-gray-400'
  }
}

function getDetectionTextColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'malicious': return 'text-red-800'
    case 'suspicious': return 'text-yellow-800'
    default: return 'text-gray-800'
  }
}

function getEvidenceUrl(detection: any, domain: string): string {
  if (detection.evidenceUrl) return detection.evidenceUrl

  switch (detection.source) {
    case 'KISA':
      return `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(domain)}`
    case 'VirusTotal':
      return `https://www.virustotal.com/gui/domain/${domain}`
    case 'URLhaus':
      return `https://urlhaus.abuse.ch/browse.php?search=${domain}`
    case 'Google Safe Browsing':
      return `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(`https://${domain}`)}`
    default:
      return `https://www.google.com/search?q="${encodeURIComponent(domain)}"+security+report`
  }
}

function getSeverityBadgeColor(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'bg-red-200 text-red-900'
    case 'medium':
      return 'bg-yellow-200 text-yellow-900'
    default:
      return 'bg-gray-200 text-gray-900'
  }
}

function getSeverityLabel(severity: string, currentLang: string): string {
  if (currentLang === 'ko') {
    switch (severity) {
      case 'critical': return '매우 높음'
      case 'high': return '높음'
      case 'medium': return '중간'
      case 'low': return '낮음'
      default: return severity
    }
  } else {
    switch (severity) {
      case 'critical': return 'Critical'
      case 'high': return 'High'
      case 'medium': return 'Medium'
      case 'low': return 'Low'
      default: return severity
    }
  }
}

function getRiskLevelLabel(riskLevel: string, currentLang: string): string {
  if (currentLang === 'ko') {
    switch (riskLevel) {
      case 'phishing': return '피싱'
      case 'crypto-scam': return '암호화폐 스캠'
      case 'malware': return '악성코드'
      case 'fraud': return '사기'
      default: return riskLevel
    }
  } else {
    switch (riskLevel) {
      case 'phishing': return 'Phishing'
      case 'crypto-scam': return 'Crypto Scam'
      case 'malware': return 'Malware'
      case 'fraud': return 'Fraud'
      default: return riskLevel
    }
  }
}

function getThreatTypeLabel(threatType: string, currentLang: string): string {
  if (currentLang === 'ko') {
    switch (threatType) {
      case 'MALWARE': return '악성코드'
      case 'SOCIAL_ENGINEERING': return '피싱/사회공학'
      case 'UNWANTED_SOFTWARE': return '원치 않는 소프트웨어'
      case 'POTENTIALLY_HARMFUL_APPLICATION': return '잠재적 유해 애플리케이션'
      default: return threatType
    }
  } else {
    switch (threatType) {
      case 'MALWARE': return 'Malware'
      case 'SOCIAL_ENGINEERING': return 'Social Engineering'
      case 'UNWANTED_SOFTWARE': return 'Unwanted Software'
      case 'POTENTIALLY_HARMFUL_APPLICATION': return 'Potentially Harmful Application'
      default: return threatType
    }
  }
}

function getDomainStatusLabel(status: string, currentLang: string): string {
  if (currentLang === 'ko') {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'ok':
      case 'active': return '정상'
      case 'clienttransferprohibited': return '전송 보호'
      case 'servertransferprohibited': return '서버 전송 보호'
      case 'clientdeleteprohibited': return '삭제 보호'
      case 'serverdeleteprohibited': return '서버 삭제 보호'
      case 'clientupdateprohibited': return '업데이트 보호'
      case 'serverupdateprohibited': return '서버 업데이트 보호'
      case 'clienthold': return '클라이언트 보류 (정지)'
      case 'serverhold': return '서버 보류 (정지)'
      case 'redemptionperiod': return '복구 기간 (만료됨)'
      case 'pendingdelete': return '삭제 대기'
      default: return status
    }
  } else {
    return status
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }
}

function getStatusBadgeColor(status: string): string {
  const lowerStatus = status.toLowerCase();

  // 위험 상태 - 빨간색
  if (lowerStatus.includes('hold') ||
      lowerStatus.includes('redemption') ||
      lowerStatus.includes('pendingdelete')) {
    return 'bg-red-100 text-red-800 border border-red-300';
  }

  // 보호 기능 - 파란색
  if (lowerStatus.includes('prohibited')) {
    return 'bg-blue-100 text-blue-800 border border-blue-300';
  }

  // 정상 상태 - 녹색
  return 'bg-green-100 text-green-800 border border-green-300';
}

function getDomainStatusColor(statuses: string[]): { bg: string; dot: string; text: string } {
  const hasError = statuses.some(s => {
    const lower = s.toLowerCase();
    return lower.includes('hold') || lower.includes('redemption') || lower.includes('pendingdelete');
  });

  if (hasError) {
    return {
      bg: 'bg-red-50 border-red-200',
      dot: 'bg-red-500',
      text: 'text-red-800'
    };
  }

  return {
    bg: 'bg-green-50 border-green-200',
    dot: 'bg-green-500',
    text: 'text-green-800'
  };
}