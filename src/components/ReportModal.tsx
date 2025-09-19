'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface ReportModalProps {
  domain: string
  isOpen: boolean
  onClose: () => void
}

export function ReportModal({ domain, isOpen, onClose }: ReportModalProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already-reported'>('idle')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [formData, setFormData] = useState({
    reportType: '',
    description: '',
    reporterEmail: '',
    evidence: ''
  })

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const reportTypes = [
    'phishing',
    'scam',
    'malware',
    'fake-exchange',
    'other'
  ]

  const addImageUrl = () => {
    if (currentImageUrl.trim()) {
      // URL 형식 검증
      try {
        new URL(currentImageUrl.trim())
        setImageUrls(prev => [...prev, currentImageUrl.trim()])
        setCurrentImageUrl('')
      } catch (error) {
        alert('올바른 URL 형식이 아닙니다.')
      }
    }
  }

  const removeImageUrl = (urlToRemove: string) => {
    setImageUrls(prev => prev.filter(url => url !== urlToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const textEvidence = formData.evidence
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      // 중복 제거: 텍스트 증거와 이미지 URL 간 중복 제거
      const evidenceArray = Array.from(new Set([...textEvidence, ...imageUrls]))

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          reportType: formData.reportType,
          description: formData.description || undefined,
          reporterEmail: formData.reporterEmail,
          evidence: evidenceArray
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          onClose()
          setSubmitStatus('idle')
          setFormData({
            reportType: '',
            description: '',
            reporterEmail: '',
            evidence: ''
          })
          setImageUrls([])
          setCurrentImageUrl('')
        }, 2000)
      } else {
        if (result.error === 'ALREADY_REPORTED') {
          setSubmitStatus('already-reported')
        } else {
          setSubmitStatus('error')
        }
      }
    } catch (error) {
      console.error('Report submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t.results.report.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                {t.results.report.successMessage}
              </h3>
              <p className="text-green-700">
                {t.results.report.successDescription}
              </p>
            </div>
          ) : submitStatus === 'already-reported' ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                {t.results.report.alreadyReported || 'Already Reported'}
              </h3>
              <p className="text-orange-700">
                {t.results.report.alreadyReportedDescription || 'You have already reported this domain with this email address'}
              </p>
              <button
                onClick={() => {
                  onClose()
                  setSubmitStatus('idle')
                  setFormData({
                    reportType: '',
                    description: '',
                    reporterEmail: '',
                    evidence: ''
                  })
                  setImageUrls([])
                  setCurrentImageUrl('')
                }}
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                {t.results.report.okButton || 'OK'}
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                {t.results.report.description}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Domain (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.results.report.domain}
                  </label>
                  <input
                    type="text"
                    value={domain}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.results.report.reportType} *
                  </label>
                  <select
                    value={formData.reportType}
                    onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t.results.report.reportType}</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>
                        {t.results.report.reportTypes[type as keyof typeof t.results.report.reportTypes]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.results.report.reportDescription} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t.results.report.reportDescriptionPlaceholder}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Reporter Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.results.report.reporterEmail} *
                  </label>
                  <input
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                    placeholder={t.results.report.reporterEmailPlaceholder}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.results.report.evidence}
                  </label>

                  {/* Image URL Input */}
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                        placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        disabled={!currentImageUrl.trim()}
                        className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 disabled:bg-gray-50 disabled:text-gray-400 text-blue-800 rounded-lg transition-colors"
                      >
                        추가
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      imgur, 구글 드라이브, 드롭박스 등의 이미지 링크를 입력하세요
                    </p>
                  </div>

                  {/* Added Image URLs */}
                  {imageUrls.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                          <ImageIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800 flex-1 truncate" title={url}>
                            이미지 {index + 1}: {url.length > 40 ? url.substring(0, 40) + '...' : url}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImageUrl(url)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Evidence */}
                  <textarea
                    value={formData.evidence}
                    onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                    placeholder={t.results.report.evidencePlaceholder}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      {t.results.report.errorMessage}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {t.results.report.errorDescription}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {t.results.report.cancelButton}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.reportType || !formData.reporterEmail || !formData.description.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? t.results.report.submittingButton : t.results.report.submitButton}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}