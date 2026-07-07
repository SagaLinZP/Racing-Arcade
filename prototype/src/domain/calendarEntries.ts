import type { Competition } from './competitions'
import type { GamePlatform } from './gamePlatforms'
import type { Region } from './common'

export interface CompetitionCalendarEntry {
  competition: Competition
  roundId: string
  roundName_zh: string
  roundName_en: string
  stageId: string
  startsAt: string
  game: GamePlatform
  carClass: string
  regions: Region[]
  track?: string
  trackLayout?: string
  isMultiRound: boolean
}

function toEntry(comp: Competition, roundId: string, roundName_zh: string, roundName_en: string, stageId: string, startsAt: string, track?: string, trackLayout?: string): CompetitionCalendarEntry {
  return {
    competition: comp,
    roundId,
    roundName_zh,
    roundName_en,
    stageId,
    startsAt,
    game: comp.game,
    carClass: comp.carClass,
    regions: comp.regions,
    track,
    trackLayout,
    isMultiRound: comp.rounds.length > 1,
  }
}

/** 把所有 Competition 按 Round 的首个 Stage.startsAt 展平为日历条目。 */
export function getCompetitionCalendarEntries(competitions: Competition[]): CompetitionCalendarEntry[] {
  const entries: CompetitionCalendarEntry[] = []
  for (const comp of competitions) {
    for (const round of comp.rounds) {
      const firstStage = round.stages[0]
      if (!firstStage) continue
      entries.push(toEntry(comp, round.id, round.name_zh, round.name_en, firstStage.id, firstStage.startsAt, round.track, round.trackLayout))
    }
  }
  return entries
}

export function isCalendarEntryOnDate(entry: CompetitionCalendarEntry, date: Date): boolean {
  const entryDate = new Date(entry.startsAt)
  return entryDate.getFullYear() === date.getFullYear()
    && entryDate.getMonth() === date.getMonth()
    && entryDate.getDate() === date.getDate()
}

export function getCalendarEntriesForDate(entries: CompetitionCalendarEntry[], date: Date): CompetitionCalendarEntry[] {
  return entries.filter(e => isCalendarEntryOnDate(e, date))
}

export function sortCalendarEntriesAsc(entries: CompetitionCalendarEntry[]): CompetitionCalendarEntry[] {
  return [...entries].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

export function filterCalendarEntries(
  entries: CompetitionCalendarEntry[],
  options: { games?: readonly GamePlatform[]; region?: Region } = {},
): CompetitionCalendarEntry[] {
  const { games, region } = options
  return entries.filter(e => {
    if (games && games.length > 0 && !games.includes(e.game)) return false
    if (region && !e.regions.includes(region)) return false
    return true
  })
}

export function calendarEntryLink(entry: CompetitionCalendarEntry): string {
  return `/events/${entry.competition.id}/rounds/${entry.roundId}`
}
