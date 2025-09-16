import { cn } from "@/lib/utils"
import { Shield, AlertTriangle, XCircle } from "lucide-react"

interface TrustScoreProps {
  score: number
  status: "safe" | "warning" | "danger"
  domain: string
}

export function TrustScore({ score, status, domain }: TrustScoreProps) {
  const getStatusColor = () => {
    switch (status) {
      case "safe":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "danger":
        return "text-red-600 bg-red-50 border-red-200"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "safe":
        return <Shield className="h-8 w-8" />
      case "warning":
        return <AlertTriangle className="h-8 w-8" />
      case "danger":
        return <XCircle className="h-8 w-8" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "safe":
        return "Looks Safe"
      case "warning":
        return "Caution Advised"
      case "danger":
        return "High Risk"
    }
  }

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border shadow-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Trust Score for {domain}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className={cn("text-5xl font-bold", getScoreColor())}>
                  {score}
                </div>
                <div className="text-sm text-gray-500 mt-1">/100</div>
              </div>
            </div>
            <svg
              className="absolute inset-0 w-40 h-40 transform -rotate-90"
              viewBox="0 0 160 160"
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(score / 100) * 440} 440`}
                className={getScoreColor()}
              />
            </svg>
          </div>

          <div className="text-center md:text-left">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-lg mb-4",
                getStatusColor()
              )}
            >
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">
                This website has been analyzed across multiple security parameters
              </p>
              <p className="text-sm">
                Last checked: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}