import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export type {
  Competition,
  Round,
  Stage,
  Split,
  Session,
  SessionResult,
  CompetitionStatus,
  RoundStatus,
  GamePlatform,
} from "@/domain/competitions"
export { getCompetitionStatus, getRoundStatus, statusColor } from "@/domain/status"
export type { Region, ScoringTableEntry, CarClass, Language } from "@/domain/common"
export type { RegistrationStatus, Registration } from "@/domain/registrations"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
