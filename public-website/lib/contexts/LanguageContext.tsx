'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import csTranslations from '../translations/cs.json'
import ruTranslations from '../translations/ru.json'
import enTranslations from '../translations/en.json'
import ukTranslations from '../translations/uk.json'

export type Language = 'cs' | 'ru' | 'en' | 'uk'

const translations = {
  cs: csTranslations,
  ru: ruTranslations,
  en: enTranslations,
  uk: ukTranslations,
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Browser language detection
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'cs'
  
  const browserLang = navigator.language || (navigator as any).userLanguage || 'cs'
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  // Check if language is supported
  if (langCode === 'ru') return 'ru'
  if (langCode === 'en') return 'en'
  if (langCode === 'uk') return 'uk'
  
  // Default to Czech
  return 'cs'
}

// Get language from localStorage or detect from browser
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'cs'
  
  const saved = localStorage.getItem('language') as Language | null
  if (saved && ['cs', 'ru', 'en', 'uk'].includes(saved)) {
    return saved
  }
  
  return detectBrowserLanguage()
}

// Translation function with nested key support (e.g., "nav.about")
function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to Czech if translation not found
      value = translations.cs
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey]
        } else {
          return key // Return key if translation not found
        }
      }
      break
    }
  }
  
  return typeof value === 'string' ? value : key
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language)
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return getTranslation(language, key)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
