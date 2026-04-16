import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { Calendar, Users, MapPin, Zap, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SimEvent } from '@/data/events'
import { getCoverGradient } from '@/data/events'

const gameColors: Record<string, string> = {
  'ACC PC': 'bg-orange-500',
  'ACC Crossplay': 'bg-orange-400',
  'AC Evo PC': 'bg-blue-500',
  'iRacing PC': 'bg-green-500',
  'LMU PC': 'bg-purple-500',
  'AMS2 PC': 'bg-cyan-500',
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

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      <div
        className="h-40 flex items-end p-4 relative"
        style={{ background: getCoverGradient(event.id) }}
      >
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
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', statusColors[event.status])}>
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
            <span className="text-muted-foreground">/ {event.maxEntriesPerSplit * (event.maxSplits || 1)}</span>
          </div>
          {event.enableMultiSplit && event.maxSplits && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {event.maxSplits} splits
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
