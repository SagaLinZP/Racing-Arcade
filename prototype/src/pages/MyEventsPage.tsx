import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { useLocale } from '@/hooks/useLocale'
import { useCompetitionList } from '@/features/competitions/hooks'
import { registrationRepository } from '@/data/repositories'
import { getRoundStatus } from '@/domain/status'
import { cn } from '@/lib/utils'
import { Flag, CheckCircle, Trophy, Zap, ChevronRight } from 'lucide-react'
import type { Competition, Round } from '@/domain/competitions'

interface MyRoundEntry {
  competition: Competition
  round: Round
}

function collectMyRounds(competitions: Competition[], driverId: string): MyRoundEntry[] {
  const roundIds = new Set(registrationRepository.listByDriver(driverId).map(r => r.roundId))
  const out: MyRoundEntry[] = []
  for (const comp of competitions) {
    for (const round of comp.rounds) {
      if (roundIds.has(round.id)) out.push({ competition: comp, round })
    }
  }
  return out
}

function isCompleted(round: Round, comp: Competition): boolean {
  const s = getRoundStatus(round, comp)
  return s === 'Completed' || s === 'ResultsLocked'
}

function statusColor(s: string): string {
  const map: Record<string, string> = {
    RegistrationOpen: 'bg-green-500/10 text-green-400',
    RegistrationClosed: 'bg-yellow-500/10 text-yellow-400',
    Upcoming: 'bg-blue-500/10 text-blue-400',
    InProgress: 'bg-red-500/10 text-red-400',
    Completed: 'bg-purple-500/10 text-purple-400',
    ResultsLocked: 'bg-emerald-500/10 text-emerald-400',
    Archived: 'bg-slate-500/10 text-slate-400',
  }
  return map[s] || 'bg-gray-500/10 text-gray-400'
}

export function MyEventsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const { field, tz } = useLocale()
  const userId = state.currentUser?.id || ''
  const competitions = useCompetitionList()
  const [tab, setTab] = useState<'registered' | 'completed'>('registered')

  const myRounds = collectMyRounds(competitions, userId)
  const registered = myRounds.filter(({ round, competition }) => !isCompleted(round, competition))
  const completed = myRounds.filter(({ round, competition }) => isCompleted(round, competition))
  const current = tab === 'registered' ? registered : completed

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myEvents.title')}</h1>

      <div className="flex gap-2 mb-6">
        {([
          { key: 'registered' as const, label: t('myEvents.registered'), icon: Flag, count: registered.length },
          { key: 'completed' as const, label: t('myEvents.completed'), icon: CheckCircle, count: completed.length },
        ]).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" /> {label} ({count})
          </button>
        ))}
      </div>

      {current.length > 0 ? (
        <div className="space-y-3">
          {current.map(({ competition, round }) => {
            const isMultiRound = competition.rounds.length > 1
            const firstStage = round.stages[0]
            const status = getRoundStatus(round, competition)
            return (
              <Link
                key={`${competition.id}-${round.id}`}
                to={`/events/${competition.id}/rounds/${round.id}`}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
              >
                {isMultiRound
                  ? <Trophy className="w-5 h-5 text-primary flex-shrink-0" />
                  : <Zap className="w-5 h-5 text-primary flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{field(competition, 'name')}</h3>
                  {isMultiRound && (
                    <div className="text-xs text-muted-foreground mt-0.5">{field(round, 'name')}</div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-accent text-[10px] font-semibold">{competition.game}</span>
                    <span className="truncate">{round.track ?? '—'}</span>
                    <span>·</span>
                    <span>{competition.carClass}</span>
                    {firstStage && (
                      <>
                        <span>·</span>
                        <span>{tz(firstStage.startsAt, competition.timezone, false)}</span>
                      </>
                    )}
                  </div>
                </div>
                {tab !== 'completed' && (
                  <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0', statusColor(status))}>
                    {t(`eventDetail.statusNames.${status}`)}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">{t('common.noData')}</div>
      )}
    </div>
  )
}
