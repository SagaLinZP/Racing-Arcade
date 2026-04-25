import { useSearchParams } from 'react-router-dom'
import { championshipRepository } from '@/data/repositories'
import { eventRepository } from '@/data/repositories/eventRepository'
import {
  getChampionshipSchedule,
  getChampionshipStandings,
  type Championship,
} from '@/domain/championships'
import type { SimEvent } from '@/domain/events'

export type ChampionshipTab = 'info' | 'schedule' | 'results'

export interface ChampionshipDetailData {
  championship?: Championship
  events: SimEvent[]
  eventsWithResults: SimEvent[]
  nextRegistrable?: SimEvent
  futureEvents: SimEvent[]
  pastEvents: SimEvent[]
  standings: [string, number][]
}

function isChampionshipTab(value: string | null): value is ChampionshipTab {
  return value === 'info' || value === 'schedule' || value === 'results'
}

export function useChampionshipList() {
  return championshipRepository.list()
}

export function useChampionshipDetail(championshipId?: string): ChampionshipDetailData {
  const championship = championshipRepository.getById(championshipId)
  if (!championship) {
    return {
      championship: undefined,
      events: [],
      eventsWithResults: [],
      nextRegistrable: undefined,
      futureEvents: [],
      pastEvents: [],
      standings: [],
    }
  }

  const schedule = getChampionshipSchedule(championship, eventRepository.list())
  return {
    championship,
    ...schedule,
    standings: getChampionshipStandings(schedule.events),
  }
}

export function useChampionshipRouteState() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = isChampionshipTab(searchParams.get('tab')) ? searchParams.get('tab') as ChampionshipTab : 'info'
  const eventId = searchParams.get('event') || ''

  const setRouteState = (next: { tab?: ChampionshipTab; event?: string | null }) => {
    const params = new URLSearchParams(searchParams)

    if (next.tab) {
      params.set('tab', next.tab)
    }

    if ('event' in next) {
      if (next.event) params.set('event', next.event)
      else params.delete('event')
    }

    setSearchParams(params, { replace: true })
  }

  return {
    tab,
    eventId,
    setRouteState,
  }
}
