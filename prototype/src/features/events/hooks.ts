import { eventRepository, type EventListFilters } from '@/data/repositories'
import { championshipRepository } from '@/data/repositories/championshipRepository'
import { getEventListSections, getHomeEventHighlights } from '@/domain/championships'

export function useEventList(filters: EventListFilters = {}) {
  return eventRepository.list(filters)
}

export function useEventDetail(eventId?: string) {
  return eventRepository.getById(eventId)
}

export function useEventListSections() {
  return getEventListSections(eventRepository.list(), championshipRepository.list())
}

export function useHomeEventHighlights(limit = 6) {
  return getHomeEventHighlights(eventRepository.list(), championshipRepository.list(), limit)
}
