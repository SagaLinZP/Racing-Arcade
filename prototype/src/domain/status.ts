import type { Competition, Round, CompetitionStatus, RoundStatus } from './competitions'
import { isStageLocked } from './results'

export function statusColor(status: string): string {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-700'
    case 'Upcoming': return 'bg-blue-100 text-blue-700'
    case 'RegistrationOpen': return 'bg-green-100 text-green-700'
    case 'RegistrationClosed': return 'bg-yellow-100 text-yellow-700'
    case 'InProgress': return 'bg-orange-100 text-orange-700'
    case 'Completed': return 'bg-purple-100 text-purple-700'
    case 'ResultsLocked': return 'bg-emerald-100 text-emerald-700'
    case 'Archived': return 'bg-slate-200 text-slate-600'
    case 'Cancelled': return 'bg-red-100 text-red-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'reviewing': return 'bg-blue-100 text-blue-700'
    case 'resolved': return 'bg-green-100 text-green-700'
    case 'dismissed': return 'bg-gray-100 text-gray-700'
    case 'active': return 'bg-green-100 text-green-700'
    case 'upcoming': return 'bg-blue-100 text-blue-700'
    case 'completed': return 'bg-purple-100 text-purple-700'
    case 'banned': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function getRoundStatus(round: Round, comp?: Competition): RoundStatus {
  const now = Date.now()
  const regOpen = new Date(round.registrationOpenAt).getTime()
  const regClose = new Date(round.registrationCloseAt).getTime()

  if (round.cancelledReason_zh || round.cancelledReason_en) return 'Cancelled'

  const allStages = round.stages
  const startAt = (s: typeof allStages[number]) => new Date(s.startsAt).getTime()
  const startedStages = allStages.filter(s => now >= startAt(s))
  const anyLive = allStages.some(s => now >= startAt(s) && now < new Date(s.endsAt).getTime())

  if (anyLive) return 'InProgress'
  if (startedStages.length > 0) {
    const current = startedStages.reduce((a, b) => (startAt(b) >= startAt(a) ? b : a))
    const hasLaterNotStarted = allStages.some(s => startAt(s) > startAt(current))
    if (hasLaterNotStarted) return 'InProgress'
    return isStageLocked(current, comp) ? 'ResultsLocked' : 'Completed'
  }

  const forced = round.registrationOverride
  if (forced === 'forceClosed') return 'RegistrationClosed'
  if (forced === 'forceOpen') return 'RegistrationOpen'
  const firstStart = allStages.length > 0 ? Math.min(...allStages.map(startAt)) : Infinity
  if (now < regOpen) return 'Upcoming'
  if (now >= regOpen && now < regClose) return 'RegistrationOpen'
  if (now >= regClose && now < firstStart) return 'RegistrationClosed'
  return 'Upcoming'
}

export function getCompetitionStatus(comp: Competition): CompetitionStatus {
  if (comp.statusOverride) return comp.statusOverride
  if (comp.rounds.length === 0) return 'Draft'

  const isTerminal = (s: RoundStatus) => s === 'Completed' || s === 'ResultsLocked' || s === 'Cancelled'
  const statuses = comp.rounds.map(r => getRoundStatus(r, comp))
  let idx = statuses.findIndex(s => !isTerminal(s))
  if (idx === -1) idx = statuses.length - 1
  const cur = statuses[idx]
  return (cur === 'ResultsLocked' ? 'Completed' : cur) as CompetitionStatus
}
