import { describe, expect, it } from 'vitest'
import { getChampionshipSchedule, getChampionshipStandings, getEventListSections, type Championship } from '@/domain/championships'
import type { SimEvent } from '@/domain/events'

const championship: Championship = {
  id: 'ch-test',
  name_zh: '测试锦标赛',
  name_en: 'Test Championship',
  description_zh: '描述',
  description_en: 'Description',
  coverImage: '',
  regions: ['EU'],
  game: 'ACC',
  carClass: 'GT3',
  hasPitstop: true,
  raceDuration: 60,
  raceDurationType: 'time',
  maxEntriesPerSplit: 30,
  enableMultiSplit: false,
  eventIds: ['past', 'future'],
  status: 'active',
}

function event(id: string, eventStartTime: string, results: SimEvent['results'] = []): SimEvent {
  return {
    id,
    name_zh: id,
    name_en: id,
    description_zh: id,
    description_en: id,
    coverImage: '',
    game: 'ACC',
    track: 'Monza',
    carClass: 'GT3',
    championshipId: 'ch-test',
    regions: ['EU'],
    hasPitstop: true,
    raceDuration: 60,
    raceDurationType: 'time',
    maxEntriesPerSplit: 30,
    enableMultiSplit: false,
    registrationOpenAt: '2026-04-01T00:00:00Z',
    registrationCloseAt: '2026-04-10T00:00:00Z',
    eventStartTime,
    status: 'RegistrationOpen',
    currentRegistrations: 5,
    registeredDriverIds: [],
    results,
  }
}

describe('championship domain rules', () => {
  it('builds schedule buckets and standings from event data', () => {
    const past = event('past', '2026-03-01T00:00:00Z', [
      { position: 1, driverId: 'd1', splitNumber: 1, totalTime: '1:00', bestLap: '1:00', lapsCompleted: 10, gapToLeader: '-', status: 'Finished', points: 25 },
      { position: 2, driverId: 'd2', splitNumber: 1, totalTime: '1:01', bestLap: '1:01', lapsCompleted: 10, gapToLeader: '+1', status: 'Finished', points: 18 },
    ])
    const future = event('future', '2026-05-01T00:00:00Z')
    const schedule = getChampionshipSchedule(championship, [past, future], new Date('2026-04-15T00:00:00Z'))

    expect(schedule.events.map(item => item.id)).toEqual(['past', 'future'])
    expect(schedule.nextRegistrable?.id).toBe('future')
    expect(schedule.pastEvents.map(item => item.id)).toEqual(['past'])
    expect(getChampionshipStandings(schedule.events)).toEqual([['d1', 25], ['d2', 18]])
  })

  it('groups standalone events and championships for the event list', () => {
    const standalone = { ...event('standalone', '2026-05-01T00:00:00Z'), championshipId: undefined }
    const sections = getEventListSections([standalone, event('future', '2026-05-01T00:00:00Z')], [championship], new Date('2026-04-05T00:00:00Z'))

    expect(sections.registerable.some(item => item.type === 'event' && item.data.id === 'standalone')).toBe(true)
    expect(sections.registerable.some(item => item.type === 'championship' && item.data.id === 'ch-test')).toBe(true)
  })
})
