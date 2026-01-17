"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { translations, type Language, type Translations } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18N_KEY = "ejemplos_language"
const DEFAULT_LANGUAGE: Language = "en"

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(I18N_KEY) as Language | null
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      console.error("Error loading language:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(I18N_KEY, language)
      } catch (error) {
        console.error("Error saving language:", error)
      }
    }
  }, [language, isLoaded])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  const t = translations[language]

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
