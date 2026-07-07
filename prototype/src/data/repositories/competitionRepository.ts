import { competitions } from '@/data/competitions'
import { filterCompetitions } from '@/domain/competitionLists'
import type { Competition, Round, Stage, GamePlatform } from '@/domain/competitions'
import type { Region } from '@/domain/common'

export interface CompetitionListFilters {
  ids?: readonly string[]
  region?: Region
  game?: GamePlatform
}

function findRound(comp: Competition | undefined, roundId?: string): Round | undefined {
  if (!comp || !roundId) return undefined
  return comp.rounds.find(r => r.id === roundId)
}

export const competitionRepository = {
  list(filters: CompetitionListFilters = {}): Competition[] {
    return filterCompetitions(competitions, filters)
  },

  getById(id?: string): Competition | undefined {
    if (!id) return undefined
    return competitions.find(c => c.id === id)
  },

  getRound(competitionId?: string, roundId?: string): Round | undefined {
    return findRound(this.getById(competitionId), roundId)
  },

  getStage(competitionId?: string, roundId?: string, stageId?: string): Stage | undefined {
    const round = this.getRound(competitionId, roundId)
    if (!round || !stageId) return undefined
    return round.stages.find(s => s.id === stageId)
  },

  getStageByRound(roundId?: string, stageId?: string): Stage | undefined {
    if (!roundId || !stageId) return undefined
    for (const comp of competitions) {
      const round = comp.rounds.find(r => r.id === roundId)
      if (round) {
        const stage = round.stages.find(s => s.id === stageId)
        if (stage) return stage
      }
    }
    return undefined
  },

  getCompetitionByRound(roundId?: string): Competition | undefined {
    if (!roundId) return undefined
    return competitions.find(c => c.rounds.some(r => r.id === roundId))
  },
}
