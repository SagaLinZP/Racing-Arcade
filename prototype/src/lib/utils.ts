import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale: string = 'en') {
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date, locale: string = 'en') {
  const d = new Date(date)
  return d.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export type Region = 'CN' | 'AP' | 'AM' | 'EU'

export type GamePlatform = 'AC' | 'ACC' | 'AC Evo' | 'iRacing' | 'LMU' | 'F1 25'

export type EventStatus = 'Draft' | 'RegistrationOpen' | 'RegistrationClosed' | 'InProgress' | 'Completed' | 'ResultsPublished' | 'Cancelled'

export type CarClass = 'GT3' | 'GT4' | 'Porsche Cup' | 'LMP2' | 'Formula' | 'GTE' | 'TCR'
