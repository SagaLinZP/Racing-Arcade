import { describe, it, expect } from 'vitest'
import { getRoundStatus, getCompetitionStatus } from '../status'
import { isStageLocked, getStageResultStatus, getStageLockAt, calculateRoundStandings } from '../results'
import { computeAdvancers } from '../advancement'
import type { Competition, Round, Stage, Split, SessionResult, Session } from '../competitions'

const FAR_FUTURE = '2099-12-31T00:00:00.000Z'
const FAR_PAST = '2020-01-01T00:00:00.000Z'

function makeSession(type: Session['type'], id: string): Session {
  return { id, type, name_zh: id, name_en: id }
}

function makeResult(position: number, driverId: string, points: number, sessionId?: string): SessionResult {
  return { position, driverId, status: 'Finished', points, sessionId, bestLap: '1:30.000', totalTime: '30:00.000' }
}

function makeSplit(results: SessionResult[], locked = false): Split {
  return {
    id: 'sp1',
    splitNumber: 1,
    results,
    resultsLockedAt: locked ? '2026-01-01T00:00:00.000Z' : undefined,
  }
}

/** Future stage (not started). */
function makeFutureStage(overrides: Partial<Stage> = {}): Stage {
  return {
    id: 'stg1',
    roundId: 'r1',
    type: 'race_day',
    name_zh: '正赛日',
    name_en: 'Race Day',
    startsAt: FAR_FUTURE,
    endsAt: FAR_FUTURE,
    sessions: [makeSession('race', 's_race')],
    splits: [makeSplit([])],
    awardsPoints: true,
    ...overrides,
  }
}

function makeRound(overrides: Partial<Round> = {}): Round {
  return {
    id: 'r1',
    competitionId: 'c1',
    name_zh: '分站1',
    name_en: 'Round 1',
    registrationOpenAt: FAR_FUTURE,
    registrationCloseAt: FAR_FUTURE,
    stages: [makeFutureStage()],
    currentRegistrations: 10,
    registeredDriverIds: ['d1'],
    ...overrides,
  }
}

function makeCompetition(overrides: Partial<Competition> = {}): Competition {
  return {
    id: 'c1',
    name_zh: '赛事',
    name_en: 'Competition',
    description_zh: '',
    description_en: '',
    coverImage: '',
    regions: ['CN'],
    game: 'ACC',
    carClass: 'GT3',
    defaultRuleset: {},
    rounds: [makeRound()],
    createdBy: 'admin',
    createdAt: FAR_PAST,
    updatedAt: FAR_PAST,
    ...overrides,
  }
}

describe('getRoundStatus', () => {
  it('returns Cancelled when round has cancelledReason', () => {
    const round = makeRound({ cancelledReason_zh: '取消' })
    expect(getRoundStatus(round)).toBe('Cancelled')
  })

  it('returns Upcoming before registration opens (future stage, future reg)', () => {
    const round = makeRound({ registrationOpenAt: FAR_FUTURE, registrationCloseAt: FAR_FUTURE })
    expect(getRoundStatus(round)).toBe('Upcoming')
  })

  it('returns RegistrationOpen within registration window (reg open past, close future, stage future)', () => {
    const round = makeRound({
      registrationOpenAt: FAR_PAST,
      registrationCloseAt: FAR_FUTURE,
    })
    expect(getRoundStatus(round)).toBe('RegistrationOpen')
  })

  it('honors registrationOverride forceOpen over time', () => {
    const round = makeRound({
      registrationOpenAt: FAR_FUTURE,
      registrationOverride: 'forceOpen',
    })
    expect(getRoundStatus(round)).toBe('RegistrationOpen')
  })

  it('returns ResultsLocked when past stage ended with manually-locked results', () => {
    const round = makeRound({
      stages: [{
        ...makeFutureStage(),
        startsAt: FAR_PAST,
        endsAt: FAR_PAST,
        splits: [makeSplit([makeResult(1, 'd1', 25, 's_race')], true)],
      }],
    })
    expect(getRoundStatus(round, makeCompetition())).toBe('ResultsLocked')
  })

  it('returns Completed when past stage ended with results not locked and lock window in future', () => {
    const comp = makeCompetition({ resultLockWindowHours: 100000 })
    const round = makeRound({
      stages: [{
        ...makeFutureStage(),
        startsAt: FAR_PAST,
        endsAt: FAR_PAST,
        splits: [makeSplit([makeResult(1, 'd1', 25, 's_race')], false)],
      }],
    })
    expect(getRoundStatus(round, comp)).toBe('Completed')
  })
})

describe('isStageLocked / getStageResultStatus', () => {
  it('returns pending when no results', () => {
    const stage = makeFutureStage({ splits: [makeSplit([])] })
    expect(getStageResultStatus(stage)).toBe('pending')
    expect(isStageLocked(stage)).toBe(false)
  })

  it('returns showing when results exist but not locked (future lock)', () => {
    const stage = makeFutureStage({
      endsAt: FAR_PAST,
      splits: [makeSplit([makeResult(1, 'd1', 25, 's_race')])],
    })
    const comp = makeCompetition({ resultLockWindowHours: 100000 })
    expect(getStageResultStatus(stage, comp)).toBe('showing')
  })

  it('returns locked when any split has resultsLockedAt', () => {
    const stage = makeFutureStage({
      endsAt: FAR_FUTURE,
      splits: [makeSplit([makeResult(1, 'd1', 25, 's_race')], true)],
    })
    expect(getStageResultStatus(stage)).toBe('locked')
    expect(isStageLocked(stage)).toBe(true)
  })

  it('auto-locks after lock window expires', () => {
    const comp = makeCompetition({ resultLockWindowHours: 1 })
    const stage = makeFutureStage({
      endsAt: FAR_PAST,
      splits: [makeSplit([makeResult(1, 'd1', 25, 's_race')])],
    })
    expect(getStageLockAt(stage, comp)).toBeLessThan(Date.now())
    expect(isStageLocked(stage, comp)).toBe(true)
  })
})

describe('calculateRoundStandings', () => {
  it('only counts locked stages (showing stages excluded)', () => {
    const raceSessionId = 's_race'
    const comp = makeCompetition({ resultLockWindowHours: 100000 })
    const round = makeRound({
      stages: [
        {
          ...makeFutureStage(),
          endsAt: FAR_PAST,
          splits: [makeSplit([
            makeResult(1, 'd1', 25, raceSessionId),
            makeResult(2, 'd2', 18, raceSessionId),
          ], false)],
        },
      ],
    })
    const standings = calculateRoundStandings(round, comp)
    expect(standings).toHaveLength(0)
  })

  it('aggregates points from locked stages', () => {
    const raceSessionId = 's_race'
    const round = makeRound({
      stages: [
        {
          ...makeFutureStage(),
          endsAt: FAR_PAST,
          splits: [makeSplit([
            makeResult(1, 'd1', 25, raceSessionId),
            makeResult(2, 'd2', 18, raceSessionId),
          ], true)],
        },
      ],
    })
    const standings = calculateRoundStandings(round, makeCompetition())
    expect(standings[0].driverId).toBe('d1')
    expect(standings[0].totalPoints).toBe(25)
    expect(standings[0].wins).toBe(1)
    expect(standings[1].driverId).toBe('d2')
  })
})

describe('computeAdvancers', () => {
  it('returns top N by position', () => {
    const raceSessionId = 's_race'
    const stage = makeFutureStage({
      splits: [makeSplit([
        makeResult(1, 'd1', 25, raceSessionId),
        makeResult(2, 'd2', 18, raceSessionId),
        makeResult(3, 'd3', 15, raceSessionId),
      ], true)],
    })
    const advancers = computeAdvancers(stage, { metric: 'position', limit: 2 })
    expect(advancers).toEqual(['d1', 'd2'])
  })

  it('filters by 105% lap time rule', () => {
    const raceSessionId = 's_race'
    const stage = makeFutureStage({
      splits: [makeSplit([
        { ...makeResult(1, 'd1', 25, raceSessionId), bestLap: '1:40.000' },
        { ...makeResult(2, 'd2', 18, raceSessionId), bestLap: '1:44.000' },
        { ...makeResult(3, 'd3', 15, raceSessionId), bestLap: '1:50.000' },
      ], true)],
    })
    const advancers = computeAdvancers(stage, { metric: 'lapTime', lapTimeMultiplier: 1.05 })
    expect(advancers).toContain('d1')
    expect(advancers).toContain('d2')
    expect(advancers).not.toContain('d3')
  })
})

describe('getCompetitionStatus', () => {
  it('returns statusOverride when set', () => {
    const comp = makeCompetition({ statusOverride: 'Draft' })
    expect(getCompetitionStatus(comp)).toBe('Draft')
  })

  it('returns Draft when no rounds', () => {
    const comp = makeCompetition({ rounds: [] })
    expect(getCompetitionStatus(comp)).toBe('Draft')
  })

  it('returns current (first non-terminal) round status', () => {
    const comp = makeCompetition({
      rounds: [
        { ...makeRound({ id: 'r1' }), cancelledReason_zh: 'cancelled' },
        makeRound({ id: 'r2', registrationOpenAt: FAR_FUTURE, registrationCloseAt: FAR_FUTURE }),
      ],
    })
    expect(getCompetitionStatus(comp)).toBe('Upcoming')
  })
})
