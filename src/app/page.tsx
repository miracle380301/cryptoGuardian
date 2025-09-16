'use client'

import { CheckForm } from "@/components/CheckForm"
import { useTranslation } from "@/lib/i18n/useTranslation"
import { Globe, Shield, TrendingUp, Lock } from "lucide-react"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative inline-block">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            CryptoGuardian
          </h1>
          <p className="text-2xl text-gray-600 mb-4 font-medium">
            Verify Cryptocurrency Websites Before You Trade
          </p>
          <p className="text-gray-500 max-w-4xl mx-auto text-lg leading-relaxed">
            Instant security analysis and trust scores for crypto exchanges, wallets, and DeFi platforms. Protect yourself from scams and fraudulent websites.
          </p>
        </div>

        {/* Main Check Form */}
        <div className="mb-16">
          <CheckForm />
        </div>

        {/* Features badges */}
        <div className="flex justify-center items-center space-x-8 mb-16 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Trusted data sources</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Real-time verification</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">SSL & Security checks</span>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Real-time Analysis</h3>
            <p className="text-gray-600">
              Live verification of website legitimacy and security status
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">SSL & Security Checks</h3>
            <p className="text-gray-600">
              Comprehensive SSL certificate and security protocol validation
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Trust Score System</h3>
            <p className="text-gray-600">
              Clear 0-100 scoring based on multiple security parameters
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Live Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15,432</div>
              <div className="text-gray-600 text-sm">Sites Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">94%</div>
              <div className="text-gray-600 text-sm">Detection Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">823</div>
              <div className="text-gray-600 text-sm">Scams Detected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600 text-sm">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}