import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { Calendar, Users, MapPin, Zap, Radio, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SimEvent } from '@/data/events'
import { getCoverGradient } from '@/data/events'
import type { Championship } from '@/data/championships'

const gameColors: Record<string, string> = {
  'AC': 'bg-yellow-500',
  'ACC': 'bg-orange-500',
  'AC Evo': 'bg-blue-500',
  'iRacing': 'bg-green-500',
  'LMU': 'bg-purple-500',
  'F1 25': 'bg-red-500',
}

const statusColors: Record<string, string> = {
  RegistrationOpen: 'bg-green-500/20 text-green-400',
  RegistrationClosed: 'bg-yellow-500/20 text-yellow-400',
  InProgress: 'bg-red-500/20 text-red-400',
  Completed: 'bg-gray-500/20 text-gray-400',
  ResultsPublished: 'bg-blue-500/20 text-blue-400',
  Cancelled: 'bg-red-500/20 text-red-400',
  Draft: 'bg-gray-500/20 text-gray-400',
}

export function EventCard({ event }: { event: SimEvent }) {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const name = lang === 'zh' ? event.name_zh : event.name_en

  const totalCapacity = event.maxEntriesPerSplit * (event.maxSplits || 1)
  const estimatedSplits = event.enableMultiSplit ? Math.ceil(event.currentRegistrations / event.maxEntriesPerSplit) : 1

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="h-40 flex items-end p-4 relative" style={{ background: getCoverGradient(event.id) }}>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn('px-2 py-0.5 rounded text-[11px] font-bold text-white', gameColors[event.game] || 'bg-gray-500')}>
            {event.game}
          </span>
          {event.streamUrl && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500 text-white flex items-center gap-1">
              <Radio className="w-3 h-3" /> LIVE
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {event.regions.map(r => (
            <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/40 text-white">{r}</span>
          ))}
        </div>
        <div className="relative z-10">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{name}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', statusColors[event.status] || 'bg-gray-500/20 text-gray-400')}>
            {t(`eventDetail.statusNames.${event.status}`)}
          </span>
          <span className="text-xs text-muted-foreground">{event.carClass}</span>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{event.track}{event.trackLayout ? ` (${event.trackLayout})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{new Date(event.eventStartTime).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold">{event.currentRegistrations}</span>
            <span className="text-muted-foreground">/ {totalCapacity}</span>
          </div>
          {event.enableMultiSplit && event.maxSplits && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />{estimatedSplits} splits
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ChampionshipCard({ championship, eventCount, nextEventTime, nextRegistrationStatus }: {
  championship: Championship
  eventCount: number
  nextEventTime?: string
  nextRegistrationStatus?: string
}) {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const name = lang === 'zh' ? championship.name_zh : championship.name_en

  return (
    <Link
      to={`/championships/${championship.id}`}
      className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="h-40 flex items-center justify-center relative" style={{ background: getCoverGradient(championship.id) }}>
        <Trophy className="w-12 h-12 text-white/20" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn('px-2 py-0.5 rounded text-[11px] font-bold text-white', gameColors[championship.game] || 'bg-gray-500')}>
            {championship.game}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/80 text-white">{t('events.typeChampionship', 'Championship')}</span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {championship.regions.map(r => (
            <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/40 text-white">{r}</span>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{championship.carClass}</span>
          <span>{eventCount} {lang === 'zh' ? '场赛事' : 'events'}</span>
        </div>
        {nextEventTime && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{new Date(nextEventTime).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {nextRegistrationStatus && (
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', statusColors[nextRegistrationStatus] || 'bg-gray-500/20 text-gray-400')}>
                {t(`eventDetail.statusNames.${nextRegistrationStatus}`)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
