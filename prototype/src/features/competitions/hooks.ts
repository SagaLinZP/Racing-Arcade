import { competitionRepository, registrationRepository, type CompetitionListFilters } from '@/data/repositories'
import {
  getCompetitionListSections,
  getHomeCompetitionHighlights,
  getCurrentRound,
  getRegistrableRound,
  type CompetitionListItem,
  type CompetitionListSections,
} from '@/domain/competitionLists'
import { getCompetitionStatus } from '@/domain/status'
import { calculateCompetitionStandings, calculateRoundStandings, type DriverStanding } from '@/domain/results'
import type { Competition, Round, CompetitionStatus } from '@/domain/competitions'

export { getCurrentRound, getRegistrableRound }
export type { CompetitionListItem, CompetitionListSections }

export function useCompetitionList(filters: CompetitionListFilters = {}) {
  return competitionRepository.list(filters)
}

export function useCompetitionDetail(competitionId?: string) {
  const competition = competitionRepository.getById(competitionId)
  if (!competition) return { competition: undefined, currentRound: undefined, currentStatus: undefined as CompetitionStatus | undefined }
  const currentRound = getCurrentRound(competition)
  const currentStatus = getCompetitionStatus(competition)
  return { competition, currentRound, currentStatus }
}

export interface RoundDetailData {
  competition: Competition | undefined
  round: Round | undefined
}

export function useRoundDetail(competitionId?: string, roundId?: string): RoundDetailData {
  const competition = competitionRepository.getById(competitionId)
  const round = competitionRepository.getRound(competitionId, roundId)
  return { competition, round }
}

export function useCompetitionListSections(): CompetitionListSections {
  return getCompetitionListSections(competitionRepository.list())
}

export function useHomeCompetitionHighlights(limit = 6): CompetitionListItem[] {
  return getHomeCompetitionHighlights(competitionRepository.list(), limit)
}

export function useCompetitionStandings(competitionId?: string): DriverStanding[] {
  const competition = competitionRepository.getById(competitionId)
  if (!competition) return []
  return calculateCompetitionStandings(competition)
}

export function useRoundStandings(competitionId?: string, roundId?: string): DriverStanding[] {
  const competition = competitionRepository.getById(competitionId)
  const round = competitionRepository.getRound(competitionId, roundId)
  if (!competition || !round) return []
  return calculateRoundStandings(round, competition)
}

export function useApprovedDriverIds(roundId?: string): string[] {
  if (!roundId) return []
  return registrationRepository.getApprovedDriverIds(roundId)
}
