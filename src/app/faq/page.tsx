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

function convertLinksToJSX(text: string) {
  const linkRegex = /\[LINK\](https?:\/\/[^\s\[]+)\[\/LINK\]/g;
  const parts = text.split(linkRegex);

  return parts.map((part, index) => {
    if (part.startsWith('http')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={onToggle}
        className="w-full py-2 text-left flex justify-between items-start sm:items-center hover:text-blue-600 transition-colors cursor-pointer"
      >
        <span className="font-medium text-base sm:text-lg text-gray-900 pr-4 leading-relaxed">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1 sm:mt-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1 sm:mt-0" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 ml-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {typeof answer === 'string' ? (
              <div className="whitespace-pre-line">{convertLinksToJSX(answer)}</div>
            ) : (
              answer
            )}
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
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t.faq.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-4">
            {faqItems.map((item: { question: string; answer: string }, index: number) => (
              <AccordionItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openItems.includes(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>

        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t text-center">
          <Link href="/" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors">
            {t.faq.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}