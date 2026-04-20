import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SimEvent } from "@/data/events"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type EventStatus = 'Draft' | 'Upcoming' | 'RegistrationOpen' | 'RegistrationClosed' | 'InProgress' | 'Completed' | 'ResultsPublished' | 'Cancelled'

export function getEventStatus(event: SimEvent): EventStatus {
  if (event.status === 'Cancelled') return 'Cancelled'
  if (event.status === 'Draft') return 'Draft'
  if (event.results && event.results.length > 0) return 'Completed'

  const now = new Date()
  const regOpen = new Date(event.registrationOpenAt)
  const regClose = new Date(event.registrationCloseAt)
  const start = new Date(event.eventStartTime)

  if (now < regOpen) return 'Upcoming'
  if (now >= regOpen && now < regClose) return 'RegistrationOpen'
  if (now >= regClose && now < start) return 'RegistrationClosed'
  return 'InProgress'
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

export type CarClass = 'GT3' | 'GT4' | 'Porsche Cup' | 'LMP2' | 'Formula' | 'GTE' | 'TCR'
