'use client'

import { CheckForm } from "@/components/CheckForm"
import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { FeatureBadges } from "@/components/FeatureBadges"
import { StatisticsSection } from "@/components/StatisticsSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Check Form */}
        <div className="mb-16">
          <CheckForm />
        </div>

        {/* Features badges */}
        <FeatureBadges />

        {/* Features Section */}
        <FeaturesSection />

        {/* Statistics Section */}
        <StatisticsSection />
      </div>
    </div>
  )
}