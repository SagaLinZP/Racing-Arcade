import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { championships } from '@/data/championships'
import { events } from '@/data/events'
import { getCoverGradient } from '@/data/events'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'

export function ChampionshipsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return championships.filter(ch => {
      if (statusFilter !== 'all' && ch.status !== statusFilter) return false
      return true
    })
  }, [championships, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('championships.title')}</h1>

      <div className="flex gap-2 mb-6">
        {[['all', t('events.filters.all')], ['active', 'Active'], ['upcoming', 'Upcoming'], ['completed', 'Completed']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setStatusFilter(v)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === v ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ch => {
          const chEvents = events.filter(e => ch.eventIds.includes(e.id))
          return (
            <Link
              key={ch.id}
              to={`/championships/${ch.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all"
            >
              <div className="h-36 flex items-center justify-center relative" style={{ background: getCoverGradient(ch.id) }}>
                <Trophy className="w-12 h-12 text-white/30" />
                <div className="absolute top-3 right-3 flex gap-1">
                  {ch.regions.map(r => <span key={r} className="px-1.5 py-0.5 bg-black/40 text-white text-[10px] font-bold rounded">{r}</span>)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{lang === 'zh' ? ch.name_zh : ch.name_en}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="px-2 py-0.5 bg-accent rounded text-xs">{ch.game}</span>
                  <span>{ch.carClass}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{chEvents.length} {lang === 'zh' ? '场赛事' : 'events'}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                    ch.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    ch.status === 'upcoming' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-gray-500/10 text-gray-400'
                  )}>
                    {ch.status === 'active' ? (lang === 'zh' ? '进行中' : 'Active') :
                     ch.status === 'upcoming' ? (lang === 'zh' ? '即将开始' : 'Upcoming') :
                     (lang === 'zh' ? '已结束' : 'Completed')}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
