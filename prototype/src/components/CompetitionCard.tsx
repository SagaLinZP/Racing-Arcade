import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/hooks/useLocale'
import { Calendar, Users, MapPin, Zap, Radio, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCompetitionStatus } from '@/domain/status'
import { getRegistrableRound, getCurrentRound, type CompetitionListItem } from '@/domain/competitionLists'
import { getCoverGradient } from '@/shared/utils/eventVisuals'
import { gamePlatformColors } from '@/domain/gamePlatforms'

function getStatusRound(item: CompetitionListItem) {
  return item.nextRound ?? getRegistrableRound(item.competition) ?? getCurrentRound(item.competition)
}

export function CompetitionCard({ item }: { item: CompetitionListItem }) {
  const { t } = useTranslation()
  const { field, tz } = useLocale()
  const { competition } = item
  const name = field(competition, 'name')
  const status = getCompetitionStatus(competition)
  const round = getStatusRound(item)
  const tzLabel = competition.timezone
  const registrations = round?.currentRegistrations ?? 0
  const capacity = round?.maxRegistrations
  const isMultiRound = item.roundCount > 1

  return (
    <Link
      to={isMultiRound ? `/events/${competition.id}` : `/events/${competition.id}/rounds/${round?.id ?? ''}`}
      className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="h-40 flex items-center justify-center relative" style={{ background: getCoverGradient(competition.id) }}>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn('px-2 py-0.5 rounded text-[11px] font-bold text-white', gamePlatformColors[competition.game] || 'bg-gray-500')}>
            {competition.game}
          </span>
          {competition.defaultRuleset.streamUrl && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500 text-white flex items-center gap-1">
              <Radio className="w-3 h-3" /> LIVE
            </span>
          )}
        </div>
        {isMultiRound
          ? <Trophy className="w-12 h-12 text-white/20" />
          : <Zap className="w-12 h-12 text-white/20" />}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{competition.carClass}</span>
          {isMultiRound && (
            <span>{item.roundCount} {t('competition.rounds', 'rounds')}</span>
          )}
        </div>
        {round && (
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="line-clamp-1">{round.track}{round.trackLayout ? ` (${round.trackLayout})` : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">
                {round.stages[0] ? tz(round.stages[0].startsAt, tzLabel, false) : '—'}
              </span>
            </div>
          </div>
        )}
        {round && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-semibold">{registrations}</span>
              {capacity && <span className="text-muted-foreground">/ {capacity}</span>}
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full bg-accent', statusColorClass(status))}>
              {t(`eventDetail.statusNames.${status}`)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function statusColorClass(status: string): string {
  const map: Record<string, string> = {
    Upcoming: 'text-blue-400',
    RegistrationOpen: 'text-green-400',
    RegistrationClosed: 'text-yellow-400',
    InProgress: 'text-red-400',
    Completed: 'text-purple-400',
    ResultsLocked: 'text-emerald-400',
    Archived: 'text-slate-400',
    Cancelled: 'text-red-400',
    Draft: 'text-gray-400',
  }
  return map[status] || 'text-gray-400'
}
