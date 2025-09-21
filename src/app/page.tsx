'use client'

import Head from 'next/head'
import { CheckForm } from "@/components/CheckForm"
import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { StatisticsSection } from "@/components/StatisticsSection"

export default function Home() {
  return (
    <>
      <Head>
        <title>크립토가디언 - 암호화폐 사이트 보안 검증</title>
        <meta name="description" content="암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다" />
        <meta property="og:title" content="크립토가디언 - 암호화폐 사이트 보안 검증" />
        <meta property="og:description" content="암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다" />
        <meta property="og:image" content="https://cryptoguardian.vercel.app/police.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="크립토가디언 - 암호화폐 사이트 보안 검증" />
        <meta name="twitter:description" content="암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다" />
        <meta name="twitter:image" content="https://cryptoguardian.vercel.app/police.png" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Hero Section */}
          <HeroSection />

          {/* Main Check Form */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <CheckForm />
          </div>

          {/* Features Section */}
          <div className="mb-8 sm:mb-12 lg:mb-16 mt-16 sm:mt-20 lg:mt-24 max-w-3xl mx-auto">
            <FeaturesSection />
          </div>

          {/* Statistics Section */}
          <div className="mb-0 mt-16 sm:mt-20 lg:mt-24 max-w-3xl mx-auto">
            <StatisticsSection />
          </div>
        </div>
      </div>
    </>
  )
}