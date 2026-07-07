import { driverRepository, mozaDeviceRepository, teamRepository, registrationRepository } from '@/data/repositories'
import { competitions } from '@/data/competitions'
import { calculateCompetitionStandings, getRaceSessionId, type DriverStanding, type StandingResultEntry } from '@/domain/results'
import type { Competition, Round } from '@/domain/competitions'
import type { SessionResult } from '@/domain/competitions'

export interface DriverResultEntry extends StandingResultEntry {
  competitionId: string
  competitionName_zh: string
  competitionName_en: string
  roundId: string
  roundName_zh: string
  roundName_en: string
  splitNumber?: number
  totalTime?: string
  status?: string
}

export interface DriverCompetitionEntry {
  competition: Competition
  rounds: Round[]
}

function collectDriverResults(driverId: string): DriverResultEntry[] {
  const rows: DriverResultEntry[] = []
  for (const competition of competitions) {
    for (const round of competition.rounds) {
      for (const stage of round.stages) {
        if (stage.awardsPoints === false) continue
        const targetSessionId = getRaceSessionId(stage)
        for (const split of stage.splits) {
          if (!split.results) continue
          for (const r of split.results) {
            if (r.driverId !== driverId) continue
            if (targetSessionId && r.sessionId !== targetSessionId) continue
            rows.push({
              stageId: stage.id,
              roundId: round.id,
              competitionId: competition.id,
              competitionName_zh: competition.name_zh,
              competitionName_en: competition.name_en,
              roundName_zh: round.name_zh,
              roundName_en: round.name_en,
              position: r.position,
              points: r.points ?? 0,
              bestLap: r.bestLap,
              splitNumber: r.splitNumber,
              totalTime: r.totalTime,
              status: r.status,
            })
          }
        }
      }
    }
  }
  return rows.sort((a, b) => b.points - a.points)
}

function collectDriverCompetitions(driverId: string): DriverCompetitionEntry[] {
  const roundIds = new Set(
    registrationRepository.listByDriver(driverId)
      .filter(r => r.status === 'approved')
      .map(r => r.roundId),
  )
  const out: DriverCompetitionEntry[] = []
  for (const competition of competitions) {
    const rounds = competition.rounds.filter(r => roundIds.has(r.id))
    if (rounds.length > 0) out.push({ competition, rounds })
  }
  return out
}

function collectDriverStandings(driverId: string): DriverStanding | undefined {
  const aggregated: Record<string, DriverStanding> = {}
  for (const competition of competitions) {
    const standings = calculateCompetitionStandings(competition)
    const mine = standings.find(s => s.driverId === driverId)
    if (!mine) continue
    if (!aggregated[driverId]) {
      aggregated[driverId] = {
        driverId,
        teamId: mine.teamId,
        totalPoints: 0,
        wins: 0,
        podiums: 0,
        entries: 0,
        bestPosition: 999,
        results: [],
      }
    }
    const acc = aggregated[driverId]
    acc.totalPoints += mine.totalPoints
    acc.wins += mine.wins
    acc.podiums += mine.podiums
    acc.entries += mine.entries
    acc.bestPosition = Math.min(acc.bestPosition, mine.bestPosition)
    acc.results.push(...mine.results)
  }
  const standing = aggregated[driverId]
  return standing
}

export function useDriverProfile(driverId?: string) {
  const driver = driverRepository.getById(driverId)
  const team = driver?.teamId ? teamRepository.getById(driver.teamId) : undefined
  const competitionsEntered = driver ? collectDriverCompetitions(driver.id) : []
  const results = driver ? collectDriverResults(driver.id) : []
  const standings = driver ? collectDriverStandings(driver.id) : undefined
  const devices = driver?.showDevices ? mozaDeviceRepository.listByIds(driver.displayedDeviceIds) : []

  return {
    driver,
    team,
    competitionsEntered,
    results,
    standings,
    devices,
  }
}

export function useDriverList() {
  return driverRepository.list()
}

export function useDriverSettingsData(driverId?: string) {
  const driver = driverRepository.getById(driverId)
  return {
    driver,
    ownedDevices: mozaDeviceRepository.listByIds(driver?.ownedDeviceIds ?? []),
  }
}

export { collectDriverResults, collectDriverCompetitions, collectDriverStandings }
export type { SessionResult }
