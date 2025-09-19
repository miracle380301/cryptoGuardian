import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

interface MaliciousSiteEvidenceProps {
  checkKey: string
  check: any
  domain: string
  currentLang: string
}

export function MaliciousSiteEvidence({ checkKey, check, domain, currentLang }: MaliciousSiteEvidenceProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<{ [key: string]: number }>({})

  // Only render for maliciousSite checks that have evidence
  if (checkKey !== 'maliciousSite' || !check.details?.maliciousSite) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      {renderMaliciousSiteEvidence(check.details.maliciousSite, checkKey, expandedEvidence, setExpandedEvidence, currentLang, domain)}

      {/* Detection Sources Section */}
      {checkKey === 'maliciousSite' && check.details?.isReported && (
        <div className="space-y-2">

          {/* Clean databases message */}
          {!check.details?.isReported && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  {currentLang === 'ko' ? '모든 데이터베이스에서 안전' : 'Clean in all databases'}
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {currentLang === 'ko' ? '확인됨' : 'Checked'}: KISA, VirusTotal, PhishTank, CryptoScamDB, FCA, SEC
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function renderMaliciousSiteEvidence(evidenceList: any, checkKey: string, expandedEvidence: any, setExpandedEvidence: any, currentLang: string, domain: string) {
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
              {item.reportedBy && item.reportedBy !== 'KISA' && (
                <a
                  href={getEvidenceUrl({source: item.reportedBy}, domain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.reportedBy}
                </a>
              )}
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
  switch (detection.source) {
    case 'KISA':
      return detection.evidenceUrl || `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(domain)}`
    case 'VirusTotal':
      return `https://www.virustotal.com/gui/domain/${domain}`
   case 'CryptoScamDB':
      return `https://cryptoscamdb.org/search?${domain}`
    case 'URLhaus':
      return detection.evidenceUrl || `https://urlhaus.abuse.ch/browse.php?search=${domain}`
    case 'Google Safe Browsing':
      return detection.evidenceUrl || `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(`https://${domain}`)}`
    default:
      return detection.evidenceUrl || `https://www.google.com/search?q="${encodeURIComponent(domain)}"+security+report`
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
      case 'malicious': return '악성'
      case 'suspicious': return '의심스러움'
      case 'critical': return '매우 위험'
      case 'botnet': return '봇넷'
      case 'ransomware': return '랜섬웨어'
      case 'trojan': return '트로이목마'
      default: return riskLevel
    }
  } else {
    switch (riskLevel) {
      case 'phishing': return 'Phishing'
      case 'crypto-scam': return 'Crypto Scam'
      case 'malware': return 'Malware'
      case 'fraud': return 'Fraud'
      case 'malicious': return 'Malicious'
      case 'suspicious': return 'Suspicious'
      case 'critical': return 'Critical'
      case 'botnet': return 'Botnet'
      case 'ransomware': return 'Ransomware'
      case 'trojan': return 'Trojan'
      default: return riskLevel
    }
  }
}