import type { CarClass, Region, ScoringTableEntry } from './common'
import type { GamePlatform } from './gamePlatforms'

export type EventStatus =
  | 'Draft'
  | 'Upcoming'
  | 'RegistrationOpen'
  | 'RegistrationClosed'
  | 'InProgress'
  | 'Completed'
  | 'ResultsPublished'
  | 'Cancelled'

export const REGISTERABLE_EVENT_STATUSES: EventStatus[] = ['RegistrationOpen', 'RegistrationClosed']

export interface SimEvent {
  id: string
  name_zh: string
  name_en: string
  description_zh: string
  description_en: string
  coverImage: string
  game: GamePlatform
  track: string
  trackLayout?: string
  carClass: CarClass
  championshipId?: string
  regions: Region[]
  weather?: string
  hasPitstop: boolean
  practiceDuration?: number
  qualifyingDuration?: number
  raceDuration: number
  raceDurationType: 'time' | 'laps'
  maxEntriesPerSplit: number
  maxSplits?: number
  enableMultiSplit: boolean
  splitAssignmentRule?: string
  minEntries?: number
  registrationOpenAt: string
  registrationCloseAt: string
  cancelRegistrationDeadline?: string
  eventStartTime: string
  status: EventStatus
  accessRequirements_zh?: string
  accessRequirements_en?: string
  rules_zh?: string
  rules_en?: string
  serverInfo?: string
  serverPassword?: string
  serverJoinLink?: string
  streamUrl?: string
  vodUrl?: string
  scoringRules_zh?: string
  scoringRules_en?: string
  scoringTable?: ScoringTableEntry[]
  resources_zh?: string
  resources_en?: string
  currentRegistrations: number
  registeredDriverIds: string[]
  results?: EventResult[]
  cancelledReason_zh?: string
  cancelledReason_en?: string
}

export interface EventResult {
  position: number
  driverId: string
  teamId?: string
  splitNumber: number
  totalTime: string
  bestLap: string
  lapsCompleted: number
  gapToLeader: string
  status: 'Finished' | 'DNF' | 'DNS' | 'DSQ'
  penalty?: string
  points: number
}

export type EventStatusCategory = 'registered' | 'completed'

export interface EventFilterOptions {
  games?: readonly GamePlatform[]
  registeredOnly?: boolean
  userId?: string
}

export function getEventStatus(event: SimEvent, now: Date = new Date()): EventStatus {
  if (event.status === 'Cancelled') return 'Cancelled'
  if (event.status === 'Draft') return 'Draft'
  if (event.status === 'ResultsPublished') return 'ResultsPublished'
  if (event.results && event.results.length > 0) return 'Completed'

  const regOpen = new Date(event.registrationOpenAt)
  const regClose = new Date(event.registrationCloseAt)
  const start = new Date(event.eventStartTime)

  if (now < regOpen) return 'Upcoming'
  if (now >= regOpen && now < regClose) return 'RegistrationOpen'
  if (now >= regClose && now < start) return 'RegistrationClosed'
  return 'InProgress'
}

export function isRegisterableStatus(status: EventStatus) {
  return REGISTERABLE_EVENT_STATUSES.includes(status)
}

export function getEventStatusCategory(status: EventStatus): EventStatusCategory {
  return status === 'Completed' || status === 'ResultsPublished' ? 'completed' : 'registered'
}

export function getEventCapacity(event: Pick<SimEvent, 'maxEntriesPerSplit' | 'maxSplits'>) {
  return event.maxEntriesPerSplit * (event.maxSplits || 1)
}

export function getEstimatedSplits(event: Pick<SimEvent, 'enableMultiSplit' | 'maxEntriesPerSplit'>, registrationCount: number) {
  return event.enableMultiSplit ? Math.ceil(registrationCount / event.maxEntriesPerSplit) : 1
}

export function isStandaloneEvent(event: Pick<SimEvent, 'championshipId'>) {
  return !event.championshipId
}

export function isChampionshipEvent(event: Pick<SimEvent, 'championshipId'>) {
  return Boolean(event.championshipId)
}

export function isUserRegisteredForEvent(event: Pick<SimEvent, 'registeredDriverIds'>, userId?: string) {
  return Boolean(userId && event.registeredDriverIds.includes(userId))
}

export function filterEvents(events: SimEvent[], options: EventFilterOptions = {}) {
  const { games = [], registeredOnly = false, userId } = options

  return events.filter(event => {
    if (games.length > 0 && !games.includes(event.game)) return false
    if (registeredOnly && !isUserRegisteredForEvent(event, userId)) return false
    return true
  })
}

export function isEventOnDate(event: Pick<SimEvent, 'eventStartTime'>, date: Date) {
  const eventDate = new Date(event.eventStartTime)
  return eventDate.getFullYear() === date.getFullYear() &&
    eventDate.getMonth() === date.getMonth() &&
    eventDate.getDate() === date.getDate()
}

export function getEventsForDate(events: SimEvent[], date: Date) {
  return events.filter(event => isEventOnDate(event, date))
}

export function sortEventsByStartAsc<T extends Pick<SimEvent, 'eventStartTime'>>(items: T[]) {
  return [...items].sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())
}

export function sortEventsByStartDesc<T extends Pick<SimEvent, 'eventStartTime'>>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.eventStartTime).getTime() - new Date(a.eventStartTime).getTime())
}

export function sortEventsByRegistrationOpenDesc<T extends Pick<SimEvent, 'registrationOpenAt'>>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.registrationOpenAt).getTime() - new Date(a.registrationOpenAt).getTime())
}
