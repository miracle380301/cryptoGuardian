"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Shield } from "lucide-react"

export function CheckForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)

    let domain = url.trim()
    domain = domain.replace(/^https?:\/\//, "")
    domain = domain.replace(/\/.*$/, "")

    router.push(`/check/${encodeURIComponent(domain)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Enter website URL or domain (e.g., binance.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 h-12 text-base border-2 focus:border-primary bg-white"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !url.trim()}
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Shield className="mr-2 h-5 w-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Check Website
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Trusted data sources</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Real-time verification</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>SSL & Security checks</span>
        </div>
      </div>
    </form>
  )
}