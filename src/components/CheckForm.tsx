'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Shield, Globe, Bitcoin } from 'lucide-react'

export function CheckForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [searchType, setSearchType] = useState('general') // 'general' or 'crypto'
  const [loading, setLoading] = useState(false)

  // Reset loading state when component unmounts or user navigates back
  useEffect(() => {
    const handleBeforeUnload = () => setLoading(false)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      alert(t.errors.invalidUrl)
      return
    }

    setLoading(true)

    try {
      // Clean the URL/domain
      const cleanDomain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

      // Navigate to check page with search type parameter
      router.push(`/check/${encodeURIComponent(cleanDomain)}?type=${searchType}`)
    } catch (error) {
      setLoading(false)
      alert('검색 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">보안 검사 중...</h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              도메인 보안성을 분석하고 있습니다. 잠시만 기다려 주세요.
            </p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4">
        {/* Search Type Selector */}
        <div className="flex-shrink-0">
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-44 !h-14 border border-gray-300 rounded-lg focus:border-blue-500 bg-white" style={{height: '56px', minHeight: '56px'}}>
              <div className="flex items-center gap-2">
                {searchType === 'crypto' ? (
                  <>
                    <Bitcoin className="h-4 w-4 text-orange-500" />
                    <span>암호화폐 관련</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>일반 도메인</span>
                  </>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>일반 도메인</span>
                </div>
              </SelectItem>
              <SelectItem value="crypto">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-orange-500" />
                  <span>암호화폐 관련</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={searchType === 'crypto' ?
              "암호화폐 거래소나 관련 사이트 입력 (예: binance.com)" :
              "URL 또는 도메인을 입력하세요 (예: example.com)"
            }
            className="pl-12 h-14 text-lg border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white flex items-center"
            disabled={loading}
          />
          <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
        </div>

        <Button
          type="submit"
          className="h-14 px-8 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.main.checkingButton}
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              {t.main.checkButton}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}