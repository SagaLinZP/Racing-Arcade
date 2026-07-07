import type { Competition, Round, CompetitionStatus } from './competitions'
import { getCompetitionStatus, getRoundStatus } from './status'

export type CompetitionListType = 'singleRound' | 'multiRound'

export interface CompetitionListItem {
  type: CompetitionListType
  competition: Competition
  nextRound?: Round
  nextRoundStatus?: CompetitionStatus
  roundCount: number
}

export function getCurrentRound(comp: Competition): Round | undefined {
  if (comp.rounds.length === 0) return undefined
  const isTerminal = (r: Round) => {
    const s = getRoundStatus(r, comp)
    return s === 'Completed' || s === 'ResultsLocked' || s === 'Cancelled'
  }
  const idx = comp.rounds.findIndex(r => !isTerminal(r))
  return comp.rounds[idx === -1 ? comp.rounds.length - 1 : idx]
}

export function getRegistrableRound(comp: Competition): Round | undefined {
  const candidates = comp.rounds.filter(r => {
    const s = getRoundStatus(r, comp)
    return s === 'RegistrationOpen' || s === 'RegistrationClosed'
  })
  if (candidates.length === 0) return undefined
  return [...candidates].sort(
    (a, b) => new Date(a.registrationOpenAt).getTime() - new Date(b.registrationOpenAt).getTime(),
  )[0]
}

function toListItem(comp: Competition): CompetitionListItem {
  const roundCount = comp.rounds.length
  const nextRound = getRegistrableRound(comp) ?? getCurrentRound(comp)
  const nextRoundStatus = nextRound ? getCompetitionStatus(comp) : undefined
  return {
    type: roundCount > 1 ? 'multiRound' : 'singleRound',
    competition: comp,
    nextRound,
    nextRoundStatus,
    roundCount,
  }
}

export interface CompetitionListSections {
  registerable: CompetitionListItem[]
  completed: CompetitionListItem[]
}

const REGISTERABLE_STATUSES: CompetitionStatus[] = ['RegistrationOpen', 'RegistrationClosed', 'Upcoming']
const COMPLETED_STATUSES: CompetitionStatus[] = ['Completed', 'Archived']

export function getCompetitionListSections(
  competitions: Competition[],
): CompetitionListSections {
  const registerable: CompetitionListItem[] = []
  const completed: CompetitionListItem[] = []

  for (const comp of competitions) {
    if (comp.statusOverride === 'Archived') {
      completed.push(toListItem(comp))
      continue
    }
    const status = getCompetitionStatus(comp)
    if (REGISTERABLE_STATUSES.includes(status) || status === 'InProgress') {
      registerable.push(toListItem(comp))
    } else if (COMPLETED_STATUSES.includes(status)) {
      completed.push(toListItem(comp))
    }
  }

  registerable.sort((a, b) => {
    const aTime = a.nextRound?.registrationOpenAt ?? a.competition.createdAt
    const bTime = b.nextRound?.registrationOpenAt ?? b.competition.createdAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  completed.sort((a, b) => {
    const aRound = getCurrentRound(a.competition)
    const bRound = getCurrentRound(b.competition)
    const aTime = aRound?.stages[aRound.stages.length - 1]?.endsAt ?? a.competition.updatedAt
    const bTime = bRound?.stages[bRound.stages.length - 1]?.endsAt ?? b.competition.updatedAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return { registerable, completed }
}

export function getHomeCompetitionHighlights(
  competitions: Competition[],
  limit = 6,
): CompetitionListItem[] {
  return getCompetitionListSections(competitions).registerable.slice(0, limit)
}

export function filterCompetitions(
  competitions: Competition[],
  options: {
    ids?: readonly string[]
    region?: string
    game?: string
  } = {},
): Competition[] {
  const { ids, region, game } = options
  return competitions.filter(c => {
    if (ids && !ids.includes(c.id)) return false
    if (region && !c.regions.includes(region as Competition['regions'][number])) return false
    if (game && c.game !== game) return false
    return true
  })
}

export function isSingleRoundCompetition(comp: Competition): boolean {
  return comp.rounds.length <= 1
}

export function isMultiRoundCompetition(comp: Competition): boolean {
  return comp.rounds.length > 1
}
