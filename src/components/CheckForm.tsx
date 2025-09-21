'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'

export function CheckForm() {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [searchType, setSearchType] = useState('crypto') // 'general' or 'crypto'
  const [loading, setLoading] = useState(false)

  // Search type options configuration
  const searchOptions = {
    general: {
      label: t.main.searchTypes.general.label,
      placeholder: t.main.searchTypes.general.placeholder
    },
    crypto: {
      label: t.main.searchTypes.crypto.label,
      placeholder: t.main.searchTypes.crypto.placeholder
    }
  } as const

  // Reset loading state when component unmounts or user navigates back
  useEffect(() => {
    const handleBeforeUnload = () => setLoading(false)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      return
    }

    setLoading(true)

    // Clean the URL/domain for routing
    const cleanDomain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

    // Navigate to check page with full URL as query parameter
    window.location.href = `/check/${encodeURIComponent(cleanDomain)}?type=${searchType}&url=${encodeURIComponent(url)}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto relative">

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Type Selector */}
        <div className="flex-shrink-0">
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-full sm:w-44 !h-12 sm:!h-14 min-h-12 sm:min-h-14 border border-gray-300 rounded-lg focus:border-blue-500 bg-white text-sm sm:text-base" style={{height: '52px', minHeight: '52px'}}>
              <span className="truncate">{searchOptions[searchType as keyof typeof searchOptions].label}</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(searchOptions).map(([value, option]) => (
                <SelectItem key={value} value={value}>
                  <span>{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={searchOptions[searchType as keyof typeof searchOptions].placeholder}
            className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
            disabled={loading}
          />
          <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
        </div>

        <Button
          type="submit"
          className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium w-full sm:w-auto cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.main.checkingButton}
            </>
          ) : (
            <>
              {t.main.checkButton}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}