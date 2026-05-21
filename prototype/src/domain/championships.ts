import type { CarClass, Region, ScoringTableEntry } from './common'
import type { GamePlatform } from './gamePlatforms'
import {
  getEventStatusCategory,
  getEventStatus,
  isRegisterableStatus,
  isStandaloneEvent,
  sortEventsByStartAsc,
  sortEventsByStartDesc,
  type SimEvent,
} from './events'

export type ChampionshipStatus = 'upcoming' | 'active' | 'completed'

export interface Championship {
  id: string
  name_zh: string
  name_en: string
  description_zh: string
  description_en: string
  coverImage: string
  regions: Region[]
  game: GamePlatform
  carClass: CarClass
  carList?: string[]
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
  cancelRegistrationDeadlineOffset?: string
  accessRequirements_zh?: string
  accessRequirements_en?: string
  scoringRules_zh?: string
  scoringRules_en?: string
  scoringTable?: ScoringTableEntry[]
  progressionRules_zh?: string
  progressionRules_en?: string
  rules_zh?: string
  rules_en?: string
  resources_zh?: string
  resources_en?: string
  streamUrl?: string
  eventIds: string[]
  status: ChampionshipStatus
}

export type EventListItem =
  | { type: 'event'; data: SimEvent }
  | {
      type: 'championship'
      data: Championship
      eventCount: number
      nextEvent?: SimEvent
      nextRegistrationStatus?: ReturnType<typeof getEventStatus>
    }

export function getChampionshipEvents(championship: Pick<Championship, 'eventIds'>, allEvents: SimEvent[]) {
  const byId = new Map(allEvents.map(event => [event.id, event]))
  return championship.eventIds.map(id => byId.get(id)).filter((event): event is SimEvent => Boolean(event))
}

export function getChampionshipSchedule(championship: Pick<Championship, 'eventIds'>, allEvents: SimEvent[], now: Date = new Date()) {
  const chEvents = getChampionshipEvents(championship, allEvents)
  const eventsWithResults = chEvents.filter(event => event.results && event.results.length > 0)

  const nextRegistrable = sortEventsByStartAsc(
    chEvents.filter(event => {
      const status = getEventStatus(event, now)
      return status !== 'Cancelled' && status !== 'Completed' && status !== 'Upcoming' && new Date(event.eventStartTime) >= now
    })
  )[0]

  const futureEvents = sortEventsByStartAsc(
    chEvents.filter(event => {
      if (event === nextRegistrable) return false
      const status = getEventStatus(event, now)
      return new Date(event.eventStartTime) >= now && status !== 'Cancelled' && status !== 'Completed' && status !== 'ResultsPublished'
    })
  )

  const pastEvents = sortEventsByStartDesc(
    chEvents.filter(event => event !== nextRegistrable && !futureEvents.includes(event) && (
      new Date(event.eventStartTime) < now ||
      getEventStatus(event, now) === 'Completed' ||
      getEventStatus(event, now) === 'ResultsPublished'
    ))
  )

  return {
    events: chEvents,
    eventsWithResults,
    nextRegistrable,
    futureEvents,
    pastEvents,
  }
}

export function getChampionshipStandings(championshipEvents: SimEvent[]) {
  const allResults = championshipEvents.flatMap(event => event.results || [])
  return Object.entries(
    allResults.reduce<Record<string, number>>((acc, result) => {
      acc[result.driverId] = (acc[result.driverId] || 0) + result.points
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])
}

export function getEventListSections(allEvents: SimEvent[], championships: Championship[], now: Date = new Date()) {
  const registerable: EventListItem[] = []
  const completed: EventListItem[] = []

  for (const event of allEvents.filter(isStandaloneEvent)) {
    const status = getEventStatus(event, now)
    if (isRegisterableStatus(status)) {
      registerable.push({ type: 'event', data: event })
    } else if (getEventStatusCategory(status) === 'completed') {
      completed.push({ type: 'event', data: event })
    }
  }

  for (const championship of championships) {
    const subEvents = allEvents.filter(event => event.championshipId === championship.id)
    const eventCount = subEvents.length
    const registerableEvents = sortEventsByStartAsc(
      subEvents.filter(event => isRegisterableStatus(getEventStatus(event, now)))
    )
    const hasCompleted = subEvents.some(event => getEventStatusCategory(getEventStatus(event, now)) === 'completed')

    if (registerableEvents.length > 0) {
      registerable.push({
        type: 'championship',
        data: championship,
        eventCount,
        nextEvent: registerableEvents[0],
        nextRegistrationStatus: getEventStatus(registerableEvents[0], now),
      })
    }

    if (hasCompleted && registerableEvents.length === 0) {
      completed.push({
        type: 'championship',
        data: championship,
        eventCount,
      })
    }
  }

  registerable.sort((a, b) => {
    const aTime = a.type === 'event' ? a.data.registrationOpenAt : a.nextEvent?.registrationOpenAt || ''
    const bTime = b.type === 'event' ? b.data.registrationOpenAt : b.nextEvent?.registrationOpenAt || ''
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  completed.sort((a, b) => {
    const aTime = a.type === 'event' ? a.data.eventStartTime : sortEventsByStartDesc(allEvents.filter(event => event.championshipId === a.data.id))[0]?.eventStartTime || ''
    const bTime = b.type === 'event' ? b.data.eventStartTime : sortEventsByStartDesc(allEvents.filter(event => event.championshipId === b.data.id))[0]?.eventStartTime || ''
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return { registerable, completed }
}

export function getHomeEventHighlights(allEvents: SimEvent[], championships: Championship[], limit = 6, now: Date = new Date()) {
  return getEventListSections(allEvents, championships, now).registerable.slice(0, limit)
}
