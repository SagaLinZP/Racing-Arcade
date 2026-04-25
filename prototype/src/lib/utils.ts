import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { getEventStatus } from "@/domain/events"
export type { EventResult, EventStatus, SimEvent } from "@/domain/events"
export type { GamePlatform } from "@/domain/gamePlatforms"
export type { CarClass, Region, ScoringTableEntry } from "@/domain/common"

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
