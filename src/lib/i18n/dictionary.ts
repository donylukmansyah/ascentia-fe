import enTranslation from '#/locales/en/translation.json'
import idTranslation from '#/locales/id/translation.json'
import type { LanguageCode } from './types'

export const dictionary = {
  id: idTranslation,
  en: enTranslation,
} as const

export type TranslationDictionary = typeof dictionary.id

export function getTranslation(
  lang: LanguageCode,
  path: string,
  fallback?: string,
): string {
  const parts = path.split('.')
  let current: unknown = dictionary[lang]
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      current = undefined
      break
    }
  }
  if (typeof current === 'string') return current
  if (fallback !== undefined) return fallback
  return path
}

export function getTranslationArray(
  lang: LanguageCode,
  path: string,
  fallback: string[] = [],
): string[] {
  const parts = path.split('.')
  let current: unknown = dictionary[lang]
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      current = undefined
      break
    }
  }
  if (Array.isArray(current)) return current as string[]
  return fallback
}
