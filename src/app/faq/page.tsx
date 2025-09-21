'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AccordionItemProps {
  question: string
  answer: string | React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <span className="font-semibold text-blue-900 pr-4">Q. {question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="text-gray-800">
            <span className="font-semibold text-green-700 mr-2">A.</span>
            {typeof answer === 'string' ? <span>{answer}</span> : answer}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const { t } = useTranslation()
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  // Use the questions array from translations
  const faqItems = t.faq.questions || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t.faq.title}
            </h1>
            <p className="text-lg text-gray-600">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openItems.includes(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              {t.faq.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}