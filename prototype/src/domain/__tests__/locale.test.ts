import { describe, expect, it } from 'vitest'
import { formatDateForLanguage, getLocale, getLocalizedField, getLocalizedText } from '@/hooks/useLocale'

describe('locale helpers', () => {
  it('selects localized text and falls back predictably', () => {
    expect(getLocale('zh')).toBe('zh-CN')
    expect(getLocale('en')).toBe('en-US')
    expect(getLocalizedText('zh', '中文', 'English')).toBe('中文')
    expect(getLocalizedText('zh', undefined, 'English')).toBe('English')
    expect(getLocalizedText('en', '中文', undefined)).toBe('中文')
  })

  it('reads localized fields with English and Chinese fallbacks', () => {
    const record = { name_zh: '中文名', name_en: 'English Name', title_zh: '标题' }
    expect(getLocalizedField(record, 'name', 'zh')).toBe('中文名')
    expect(getLocalizedField(record, 'name', 'en')).toBe('English Name')
    expect(getLocalizedField(record, 'title', 'en')).toBe('标题')
    expect(getLocalizedField(record, 'missing', 'en', 'fallback')).toBe('fallback')
  })

  it('formats dates with the selected language locale', () => {
    expect(formatDateForLanguage('2026-04-20T12:00:00Z', 'en', { month: 'short', day: 'numeric', timeZone: 'UTC' })).toBe('Apr 20')
  })
})
