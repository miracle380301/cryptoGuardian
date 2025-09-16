'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, Shield } from 'lucide-react'

export function CheckForm() {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      alert(t.errors.invalidUrl)
      return
    }

    setLoading(true)

    // 임시 로딩 (실제 검증 기능은 나중에 구현)
    setTimeout(() => {
      setLoading(false)
      alert(`${url} 검증 완료! (임시 기능)`)
    }, 2000)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL or domain (e.g., binance.com)"
            className="pl-12 h-14 text-lg border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white"
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
              Checking...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Check Website
            </>
          )}
        </Button>
      </form>
    </div>
  )
}