import { useState } from 'react'
import { ChevronDown, ChevronUp, Users, Flag, AlertTriangle, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface UserReport {
  reportType: string
  description: string | null
  createdAt: Date
  status: string
  evidence: string[]
  reporterEmail: string
}

interface UserReportsSectionProps {
  checkKey: string
  check: any
  domain: string
  currentLang: string
}

export function UserReportsSection({ checkKey, check, domain, currentLang }: UserReportsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only render for userReports checks that have reports
  if (checkKey !== 'userReports' || !check.details?.userReports) {
    return null
  }

  const userReportsData = check.details.userReports

  return (
    <div className="mt-3 space-y-2">
      {userReportsData.isReported ? (
        <div className="border rounded-lg shadow-sm overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div
            className="p-3 cursor-pointer hover:bg-opacity-80 transition-colors border-l-4 border-orange-500"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {currentLang === 'ko' ? '사용자 신고' : 'User Reports'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-200 text-orange-900">
                    {userReportsData.reportCount}건
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-700">
                  {currentLang === 'ko' ? '최근 30일' : 'Last 30 days'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>

            {!isExpanded && (
              <div className="mt-2 text-xs text-orange-700">
                {currentLang === 'ko'
                  ? `${userReportsData.reportCount}명의 사용자가 이 사이트를 신고했습니다`
                  : `${userReportsData.reportCount} users reported this site`
                }
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="p-4 bg-white border-t">
              <div className="space-y-3">
                {userReportsData.recentReports.slice(0, 3).map((report: UserReport, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flag className="w-3 h-3 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">
                          {getReportTypeLabel(report.reportType, currentLang)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'confirmed'
                            ? 'bg-red-100 text-red-800'
                            : report.status === 'reviewing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'pending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusLabel(report.status, currentLang)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString(
                            currentLang === 'ko' ? 'ko-KR' : 'en-US'
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {currentLang === 'ko' ? '신고자: ' : 'Reporter: '}
                          {maskEmail(report.reporterEmail)}
                        </div>
                      </div>
                    </div>

                    {report.description && (
                      <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                        {report.description}
                      </p>
                    )}

                    {/* Evidence (Screenshots and URLs) */}
                    {report.evidence && report.evidence.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          {currentLang === 'ko' ? '증거 자료:' : 'Evidence:'}
                        </p>
                        <div className="space-y-2">
                          {(() => {
                            let screenshotCount = 0;
                            return report.evidence.map((evidenceItem, evidenceIndex) => (
                              <div key={evidenceIndex}>
                                {isImageUrl(evidenceItem) ? (
                                  // Screenshot
                                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ImageIcon className="w-3 h-3 text-gray-600" />
                                      <span className="text-xs text-gray-700">
                                        {currentLang === 'ko' ? '스크린샷' : 'Screenshot'} {++screenshotCount}
                                      </span>
                                    </div>
                                  <div className="relative group">
                                    <img
                                      src={evidenceItem}
                                      alt={`Evidence ${evidenceIndex + 1}`}
                                      className="w-full max-w-xs h-auto rounded border cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(evidenceItem, '_blank')}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <ExternalLink className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Text evidence or URL
                                <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                  {evidenceItem.startsWith('http') ? (
                                    <a
                                      href={evidenceItem}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline break-all"
                                    >
                                      {evidenceItem}
                                    </a>
                                  ) : (
                                    <span className="break-words">{evidenceItem}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {userReportsData.reportCount > 3 && (
                  <div className="text-center">
                    <span className="text-xs text-orange-600">
                      {currentLang === 'ko'
                        ? `외 ${userReportsData.reportCount - 3}건 더`
                        : `+${userReportsData.reportCount - 3} more reports`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-green-800">
              {currentLang === 'ko' ? '신고 없음' : 'No Reports'}
            </p>
          </div>
          <p className="text-xs text-green-700 mt-1">
            {currentLang === 'ko'
              ? '최근 30일간 사용자 신고가 없습니다'
              : 'No user reports in the last 30 days'
            }
          </p>
        </div>
      )}
    </div>
  )
}

function isImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Check if it's a URL starting with /uploads/ (our uploaded files)
  if (url.startsWith('/uploads/')) return true;

  // Check if it's an image URL by extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

function getReportTypeLabel(reportType: string, currentLang: string): string {
  if (currentLang === 'ko') {
    switch (reportType) {
      case 'phishing': return '피싱'
      case 'scam': return '스캠'
      case 'malware': return '악성코드'
      case 'fake-exchange': return '가짜 거래소'
      case 'other': return '기타'
      default: return reportType
    }
  } else {
    switch (reportType) {
      case 'phishing': return 'Phishing'
      case 'scam': return 'Scam'
      case 'malware': return 'Malware'
      case 'fake-exchange': return 'Fake Exchange'
      case 'other': return 'Other'
      default: return reportType
    }
  }
}

function getStatusLabel(status: string, currentLang: string): string {
  if (currentLang === 'ko') {
    switch (status) {
      case 'pending': return 'Pending'
      case 'reviewing': return '조사중'
      case 'confirmed': return '확인됨'
      case 'rejected': return '반려됨'
      default: return status
    }
  } else {
    switch (status) {
      case 'pending': return 'Pending'
      case 'reviewing': return 'Reviewing'
      case 'confirmed': return 'Confirmed'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;

  const [localPart, domain] = email.split('@');

  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }

  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
}