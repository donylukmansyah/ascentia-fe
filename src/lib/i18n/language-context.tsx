import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useRouter, useRouterState } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import { getTranslation, getTranslationArray } from './dictionary'
import type { LanguageCode } from './types'

interface LanguageContextValue {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (path: string, fallback?: string) => string
  tArray: (path: string, fallback?: string[]) => string[]
  pick: (
    localized?: { id?: string | null; en?: string | null },
    fallback?: string,
  ) => string
  isSwitching: boolean
}

const STORAGE_KEY = 'ascentia_language'

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const language = useRouterState({
    select: (state): LanguageCode =>
      /^\/en(?:[/?#]|$)/.test(state.location.publicHref) ? 'en' : 'id',
  })
  const [isSwitching, setIsSwitching] = useState(false)
  const [switchError, setSwitchError] = useState<string | null>(null)
  const switching = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Locale URL remains authoritative without storage.
    }
  }, [language])

  const setLanguage = useCallback(
    (newLang: LanguageCode) => {
      if (newLang === language || switching.current) return
      switching.current = true
      setIsSwitching(true)
      setSwitchError(null)

      const navigate = async () => {
        try {
          await router.navigate({
            to: '.',
            search: (previous) => ({ ...previous, __locale: newLang }),
            hash: '',
            replace: true,
            resetScroll: true,
            hashScrollIntoView: false,
          })
          const activeLanguage = /^\/en(?:[/?#]|$)/.test(
            router.state.location.publicHref,
          )
            ? 'en'
            : 'id'
          if (activeLanguage !== newLang) {
            throw new Error('Language navigation did not complete')
          }
        } catch {
          if (mounted.current) {
            setSwitchError(
              language === 'id'
                ? 'Gagal mengganti bahasa. Silakan coba lagi.'
                : 'Unable to switch language. Please try again.',
            )
          }
        } finally {
          switching.current = false
          if (mounted.current) setIsSwitching(false)
        }
      }
      void navigate()
    },
    [language, router],
  )

  const t = useCallback(
    (path: string, fallback?: string) => {
      return getTranslation(language, path, fallback)
    },
    [language],
  )

  const tArray = useCallback(
    (path: string, fallback?: string[]) => {
      return getTranslationArray(language, path, fallback)
    },
    [language],
  )

  const pick = useCallback(
    (
      localized?: { id?: string | null; en?: string | null },
      fallback: string = '',
    ) => {
      if (!localized) return fallback
      if (language === 'en') {
        const en = localized.en?.trim()
        if (en) return en
        return localized.id?.trim() || fallback
      }
      const id = localized.id?.trim()
      if (id) return id
      return localized.en?.trim() || fallback
    },
    [language],
  )

  const value = useMemo(
    () => ({ language, setLanguage, t, tArray, pick, isSwitching }),
    [language, setLanguage, t, tArray, pick, isSwitching],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {isSwitching && <RouteLoading />}
      {switchError && (
        <p
          role="alert"
          className="fixed inset-x-4 bottom-4 z-[121] mx-auto w-fit rounded-md border border-destructive bg-background p-4 text-sm text-foreground"
        >
          {switchError}
        </p>
      )}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
