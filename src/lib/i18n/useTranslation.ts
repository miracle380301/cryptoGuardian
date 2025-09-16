'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko')

  useEffect(() => {
    // 브라우저 언어 감지 및 로컬 스토리지에서 설정 불러오기
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      setLanguageState(savedLang)
    } else {
      const browserLang = navigator.language.toLowerCase()
      const defaultLang = browserLang.startsWith('ko') ? 'ko' : 'en'
      setLanguageState(defaultLang)
      localStorage.setItem('language', defaultLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language]
  }

  return React.createElement(
    LanguageContext.Provider,
    { value: contextValue },
    children
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}