'use client'

import { CheckForm } from "@/components/CheckForm"
import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { StatisticsSection } from "@/components/StatisticsSection"

export default function Home() {
  return (
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
  )
}