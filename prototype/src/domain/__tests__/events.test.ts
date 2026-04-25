import { describe, expect, it } from 'vitest'
import {
  filterEvents,
  getEstimatedSplits,
  getEventCapacity,
  getEventStatus,
  isUserRegisteredForEvent,
  type SimEvent,
} from '@/domain/events'

const baseEvent: SimEvent = {
  id: 'test-event',
  name_zh: '测试赛事',
  name_en: 'Test Event',
  description_zh: '描述',
  description_en: 'Description',
  coverImage: '',
  game: 'ACC',
  track: 'Monza',
  carClass: 'GT3',
  regions: ['CN'],
  hasPitstop: true,
  raceDuration: 60,
  raceDurationType: 'time',
  maxEntriesPerSplit: 30,
  maxSplits: 2,
  enableMultiSplit: true,
  registrationOpenAt: '2026-04-01T00:00:00Z',
  registrationCloseAt: '2026-04-10T00:00:00Z',
  eventStartTime: '2026-04-20T00:00:00Z',
  status: 'RegistrationOpen',
  currentRegistrations: 31,
  registeredDriverIds: ['d1'],
}

describe('event domain rules', () => {
  it('derives status from registration and start windows', () => {
    expect(getEventStatus(baseEvent, new Date('2026-03-31T23:00:00Z'))).toBe('Upcoming')
    expect(getEventStatus(baseEvent, new Date('2026-04-05T00:00:00Z'))).toBe('RegistrationOpen')
    expect(getEventStatus(baseEvent, new Date('2026-04-15T00:00:00Z'))).toBe('RegistrationClosed')
    expect(getEventStatus(baseEvent, new Date('2026-04-21T00:00:00Z'))).toBe('InProgress')
  })

  it('preserves terminal explicit statuses', () => {
    expect(getEventStatus({ ...baseEvent, status: 'Cancelled' }, new Date('2026-04-05T00:00:00Z'))).toBe('Cancelled')
    expect(getEventStatus({ ...baseEvent, status: 'ResultsPublished' }, new Date('2026-04-05T00:00:00Z'))).toBe('ResultsPublished')
  })

  it('calculates capacity, split estimates, registration, and filters', () => {
    expect(getEventCapacity(baseEvent)).toBe(60)
    expect(getEstimatedSplits(baseEvent, 31)).toBe(2)
    expect(isUserRegisteredForEvent(baseEvent, 'd1')).toBe(true)
    expect(filterEvents([baseEvent], { games: ['ACC'], registeredOnly: true, userId: 'd1' })).toHaveLength(1)
    expect(filterEvents([baseEvent], { games: ['LMU'] })).toHaveLength(0)
  })
})
