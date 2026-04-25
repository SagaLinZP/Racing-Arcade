import { useCallback, useMemo } from 'react'
import type { Language } from '@/domain/common'
import { useApp } from '@/hooks/useAppStore'

export function getLocale(language: Language) {
  return language === 'zh' ? 'zh-CN' : 'en-US'
}

export function getLocalizedText(language: Language, zh?: string, en?: string, fallback = '') {
  return (language === 'zh' ? zh : en) ?? en ?? zh ?? fallback
}

export function getLocalizedField(source: object | null | undefined, field: string, language: Language, fallback = '') {
  if (!source) return fallback

  const record = source as Record<string, unknown>
  const primary = record[`${field}_${language}`]
  const english = record[`${field}_en`]
  const chinese = record[`${field}_zh`]

  if (typeof primary === 'string') return primary
  if (typeof english === 'string') return english
  if (typeof chinese === 'string') return chinese
  return fallback
}

export function formatDateForLanguage(date: string | Date, language: Language, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString(getLocale(language), options)
}

export function formatDateTimeForLanguage(date: string | Date, language: Language, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleString(getLocale(language), options)
}

export function formatTimeForLanguage(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options,
  })
}

export function useLocale() {
  const { state } = useApp()
  const language = state.language
  const locale = useMemo(() => getLocale(language), [language])

  const text = useCallback((zh?: string, en?: string, fallback?: string) => (
    getLocalizedText(language, zh, en, fallback)
  ), [language])

  const field = useCallback((source: object | null | undefined, key: string, fallback?: string) => (
    getLocalizedField(source, key, language, fallback)
  ), [language])

  const date = useCallback((value: string | Date, options?: Intl.DateTimeFormatOptions) => (
    formatDateForLanguage(value, language, options)
  ), [language])

  const dateTime = useCallback((value: string | Date, options?: Intl.DateTimeFormatOptions) => (
    formatDateTimeForLanguage(value, language, options)
  ), [language])

  const time = useCallback((value: string | Date, options?: Intl.DateTimeFormatOptions) => (
    formatTimeForLanguage(value, options)
  ), [])

  return {
    language,
    locale,
    isZh: language === 'zh',
    text,
    field,
    date,
    dateTime,
    time,
  }
}
