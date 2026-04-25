import { events } from '@/data/events'
import { filterEvents, sortEventsByRegistrationOpenDesc, sortEventsByStartAsc, sortEventsByStartDesc, type EventFilterOptions, type SimEvent } from '@/domain/events'

export interface EventListFilters extends EventFilterOptions {
  ids?: readonly string[]
  championshipId?: string
  standaloneOnly?: boolean
  sort?: 'startAsc' | 'startDesc' | 'registrationOpenDesc'
}

function sortEventList(items: SimEvent[], sort?: EventListFilters['sort']) {
  if (sort === 'startAsc') return sortEventsByStartAsc(items)
  if (sort === 'startDesc') return sortEventsByStartDesc(items)
  if (sort === 'registrationOpenDesc') return sortEventsByRegistrationOpenDesc(items)
  return items
}

export const eventRepository = {
  list(filters: EventListFilters = {}) {
    const { ids, championshipId, standaloneOnly, sort, ...eventFilters } = filters
    let result = filterEvents(events, eventFilters)

    if (ids) {
      const idSet = new Set(ids)
      result = result.filter(event => idSet.has(event.id))
    }

    if (championshipId) {
      result = result.filter(event => event.championshipId === championshipId)
    }

    if (standaloneOnly) {
      result = result.filter(event => !event.championshipId)
    }

    return sortEventList(result, sort)
  },

  getById(id?: string) {
    if (!id) return undefined
    return events.find(event => event.id === id)
  },
}
