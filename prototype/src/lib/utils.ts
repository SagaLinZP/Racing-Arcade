import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { getEventStatus } from "@/domain/events"
export type { EventResult, EventStatus, SimEvent } from "@/domain/events"
export type { GamePlatform } from "@/domain/gamePlatforms"
export type { CarClass, Region, ScoringTableEntry } from "@/domain/common"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
