'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, Shield } from 'lucide-react'

export function CheckForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      alert(t.errors.invalidUrl)
      return
    }

    setLoading(true)

    // Clean the domain for URL (preserve case for visual similarity detection)
    const cleanDomain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

    // Navigate to check page
    router.push(`/check/${encodeURIComponent(cleanDomain)}`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.main.inputPlaceholder}
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