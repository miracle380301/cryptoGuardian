import { cn } from "@/lib/utils"
import { ExternalLink, Info } from "lucide-react"
import { useEffect, useState } from "react"

interface TrustScoreProps {
  score: number
  status: "safe" | "warning" | "danger"
  domain: string
}

export function TrustScore({ score, status, domain }: TrustScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // 점수 애니메이션
  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      const duration = 2000 // 2초 애니메이션
      const steps = 60
      const increment = score / steps
      let current = 0

      const interval = setInterval(() => {
        current += increment
        if (current >= score) {
          current = score
          clearInterval(interval)
        }
        setAnimatedScore(Math.round(current))
      }, duration / steps)

      return () => clearInterval(interval)
    }, 300) // 0.3초 딜레이 후 시작

    return () => clearTimeout(timer)
  }, [score])
  // ScamAdviser 스타일 색상 시스템 (애니메이션된 점수 기반)
  const getScoreColors = () => {
    const currentScore = animatedScore
    if (currentScore >= 90) return {
      stroke: "#00B16A",
      text: "rgb(0, 177, 106)",
      bg: "#f0fdf4"
    }
    if (currentScore >= 80) return {
      stroke: "#00D374",
      text: "rgb(0, 211, 116)",
      bg: "#f0fdf4"
    }
    if (currentScore >= 60) return {
      stroke: "#FFCC00",
      text: "rgb(255, 204, 0)",
      bg: "#fffbeb"
    }
    if (currentScore >= 40) return {
      stroke: "#FF8A00",
      text: "rgb(255, 138, 0)",
      bg: "#fff7ed"
    }
    return {
      stroke: "#CE0A0A",
      text: "rgb(206, 10, 10)",
      bg: "#fef2f2"
    }
  }

  const colors = getScoreColors()

  const getStatusText = () => {
    switch (status) {
      case "safe":
        return "Very trustworthy"
      case "warning":
        return "Caution advised"
      case "danger":
        return "High risk"
    }
  }

  // SVG arc path 계산 (ScamAdviser 스타일 반원)
  const createArcPath = (percentage: number) => {
    const startAngle = 0
    const endAngle = (percentage / 100) * 180
    const radius = 50
    const centerX = 150
    const centerY = 80

    const startX = centerX - radius * Math.cos((startAngle * Math.PI) / 180)
    const startY = centerY - radius * Math.sin((startAngle * Math.PI) / 180)
    const endX = centerX - radius * Math.cos((endAngle * Math.PI) / 180)
    const endY = centerY - radius * Math.sin((endAngle * Math.PI) / 180)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div
          className="p-6 flex flex-col justify-center items-center transition-colors duration-1000"
          style={{ backgroundColor: colors.bg }}
        >
          {/* Trustscore Title */}
          <div className="text-center mb-4">
            <h2 className={cn(
              "text-lg font-semibold text-gray-800 mb-1 transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              Trustscore
            </h2>
            <div className={cn(
              "text-3xl font-bold mb-2 transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <span
                style={{ color: colors.text }}
                className="transition-colors duration-500"
              >
                {animatedScore}
              </span>
              <span className="text-gray-400 text-xl ml-1">/ 100</span>
            </div>
            <div className={cn(
              "flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition-all duration-500 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <Info className="h-4 w-4" />
              <span className="font-medium">What is this?</span>
            </div>
            <div className={cn(
              "mt-2 transition-all duration-500 delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700 underline">
                Disclaimer
              </a>
            </div>
          </div>

          {/* ScamAdviser 스타일 Arc Chart */}
          <div className={cn(
            "relative transition-all duration-700 delay-500",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}>
            <svg
              viewBox="0 0 300 150"
              className="w-64 h-32"
              style={{ transform: 'scale(1, -1)' }}
            >
              {/* Background arc */}
              <path
                d="M 20 0 A 50 50 0 0 0 280 0"
                fill="none"
                stroke="#434343"
                strokeWidth="14"
                className="transition-opacity duration-500"
              />
              {/* Score arc with animation */}
              <path
                d="M 20 0 A 50 50 0 0 0 280 0"
                fill="none"
                stroke={colors.stroke}
                strokeWidth="30"
                pathLength="100"
                strokeDasharray="100 100"
                strokeDashoffset={100 - animatedScore}
                style={{
                  transition: 'stroke 0.5s ease-in-out, stroke-dashoffset 0.1s ease-out'
                }}
              />
            </svg>
          </div>

          {/* Status message */}
          <div className={cn(
            "text-center mt-4 transition-all duration-500 delay-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {getStatusText()}
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <span>{domain}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>

          {/* Last checked */}
          <div className={cn(
            "text-center mt-3 text-xs text-gray-500 transition-all duration-500 delay-800",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Last checked: {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  )
}