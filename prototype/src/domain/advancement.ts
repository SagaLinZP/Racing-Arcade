import type { Stage, AdvancementRule, Round } from './competitions'
import type { Competition } from './competitions'
import { getRaceSessionId, isStageLocked } from './results'

export interface StageStanding {
  driverId: string
  position: number
  points: number
  bestLapMs?: number
}

export function parseLapMs(lap?: string): number | undefined {
  if (!lap) return undefined
  const parts = lap.split(':')
  if (parts.length === 2) return (Number(parts[0]) * 60 + parseFloat(parts[1])) * 1000
  const n = parseFloat(lap)
  return Number.isNaN(n) ? undefined : n * 1000
}

export function getStageStandings(stage: Stage): StageStanding[] {
  const raceId = getRaceSessionId(stage)
  const rows: StageStanding[] = []
  for (const split of stage.splits) {
    for (const r of split.results ?? []) {
      if (raceId && r.sessionId !== raceId) continue
      if (r.status === 'DSQ' || r.status === 'DNS') continue
      rows.push({ driverId: r.driverId, position: r.position, points: r.points ?? 0, bestLapMs: parseLapMs(r.bestLap) })
    }
  }
  return rows.sort((a, b) => a.position - b.position)
}

export function computeAdvancers(prevStage: Stage, rule: AdvancementRule): string[] {
  const standings = getStageStandings(prevStage)
  if (standings.length === 0) return []
  switch (rule.metric) {
    case 'position':
      return standings.slice(0, rule.limit ?? standings.length).map(s => s.driverId)
    case 'lapTime': {
      const withLap = standings.filter(s => s.bestLapMs != null).sort((a, b) => a.bestLapMs! - b.bestLapMs!)
      if (withLap.length === 0) return []
      const fastest = withLap[0].bestLapMs!
      const cutoff = fastest * (rule.lapTimeMultiplier ?? 1.05)
      return withLap.filter(s => s.bestLapMs! <= cutoff).map(s => s.driverId)
    }
    default:
      return standings.map(s => s.driverId)
  }
}

export function canAdvance(round: Round, targetStage: Stage, comp?: Competition): boolean {
  if (targetStage.eligibilitySource !== 'previousStageResult') return false
  const idx = round.stages.findIndex(s => s.id === targetStage.id)
  if (idx <= 0) return false
  const prevStage = round.stages[idx - 1]
  if (!isStageLocked(prevStage, comp)) return false
  return getStageStandings(prevStage).length > 0
}
