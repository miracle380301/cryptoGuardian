import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertCircle, Globe, Lock, Shield, Calendar } from "lucide-react"

interface CheckResult {
  passed: boolean
  score: number
  message: string
  details?: string
}

interface CheckResultsProps {
  checks: {
    exchange?: CheckResult
    ssl?: CheckResult
    security?: CheckResult
    domain_age?: CheckResult
  }
}

export function CheckResults({ checks }: CheckResultsProps) {
  const renderCheckItem = (
    title: string,
    result: CheckResult | undefined,
    icon: React.ReactNode
  ) => {
    if (!result) return null

    return (
      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2">
              {result.passed ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <Check className="w-3 h-3 mr-1" />
                  Passed
                </Badge>
              ) : result.score > 30 ? (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Warning
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  <X className="w-3 h-3 mr-1" />
                  Failed
                </Badge>
              )}
              <span className="text-sm font-medium text-gray-600">
                Score: {result.score}/100
              </span>
            </div>
          </div>
          <p className="text-gray-700 mb-1">{result.message}</p>
          {result.details && (
            <p className="text-sm text-gray-500">{result.details}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Security Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderCheckItem(
          "Cryptocurrency Exchange Verification",
          checks.exchange,
          <Globe className="w-5 h-5 text-blue-600" />
        )}
        {renderCheckItem(
          "SSL Certificate",
          checks.ssl,
          <Lock className="w-5 h-5 text-green-600" />
        )}
        {renderCheckItem(
          "Security & Reputation",
          checks.security,
          <Shield className="w-5 h-5 text-purple-600" />
        )}
        {renderCheckItem(
          "Domain Age & History",
          checks.domain_age,
          <Calendar className="w-5 h-5 text-orange-600" />
        )}
      </CardContent>
    </Card>
  )
}