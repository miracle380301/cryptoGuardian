'use client'

import { useState, useEffect } from 'react'
import { X, Twitter, Facebook, Link, Copy } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface ShareModalProps {
  domain: string
  score: number
  status: string
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ domain, score, status, isOpen, onClose }: ShareModalProps) {
  const { t, language: currentLang } = useTranslation()
  const [copied, setCopied] = useState(false)

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

  if (!isOpen) return null

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const shareMessage = currentLang === 'ko'
    ? `${domain} 암호화폐 사이트 안전성 검사 결과: ${score}/100점 (${getStatusLabel(status, currentLang)})`
    : `${domain} crypto site security check result: ${score}/100 (${getStatusLabel(status, currentLang)})`

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}&hashtags=cryptocurrency,security,scam`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareMessage)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
  }


  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n${currentUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentLang === 'ko' ? '결과 공유하기' : 'Share Results'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {currentLang === 'ko' ? '공유할 내용:' : 'Share content:'}
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800">
              {shareMessage}
            </div>
          </div>

          <div className="space-y-3">
            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Twitter className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">
                {currentLang === 'ko' ? '트위터에 공유' : 'Share on Twitter'}
              </span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Facebook className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">
                {currentLang === 'ko' ? '페이스북에 공유' : 'Share on Facebook'}
              </span>
            </button>


            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                {copied ? <Copy className="w-4 h-4 text-white" /> : <Link className="w-4 h-4 text-white" />}
              </div>
              <span className="font-medium text-gray-900">
                {copied
                  ? (currentLang === 'ko' ? '복사됨!' : 'Copied!')
                  : (currentLang === 'ko' ? '링크 복사' : 'Copy Link')
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusLabel(status: string, currentLang: string): string {
  if (currentLang === 'ko') {
    switch (status) {
      case 'safe': return '안전'
      case 'warning': return '주의'
      case 'danger': return '위험'
      default: return status
    }
  } else {
    switch (status) {
      case 'safe': return 'Safe'
      case 'warning': return 'Warning'
      case 'danger': return 'Danger'
      default: return status
    }
  }
}