import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { events } from '@/data/events'
import { cn } from '@/lib/utils'
import { Flag, Clock, CheckCircle } from 'lucide-react'

export function MyEventsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const [tab, setTab] = useState<'upcoming' | 'inProgress' | 'completed'>('upcoming')

  const myEvents = events.filter(e => e.registeredDriverIds.includes(state.currentUser?.id || ''))
  const upcoming = myEvents.filter(e => ['RegistrationOpen', 'Pending', 'RegistrationClosed'].includes(e.status))
  const inProgress = myEvents.filter(e => e.status === 'InProgress')
  const completed = myEvents.filter(e => ['Completed', 'ResultsPublished'].includes(e.status))

  const current = tab === 'upcoming' ? upcoming : tab === 'inProgress' ? inProgress : completed

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myEvents.title')}</h1>

      <div className="flex gap-2 mb-6">
        {([
          { key: 'upcoming', label: t('myEvents.upcoming'), icon: Clock, count: upcoming.length },
          { key: 'inProgress', label: t('myEvents.inProgress'), icon: Flag, count: inProgress.length },
          { key: 'completed', label: t('myEvents.completed'), icon: CheckCircle, count: completed.length },
        ] as const).map(({ key, label, icon: Icon, count }) => (
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
          {current.map(e => (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{lang === 'zh' ? e.name_zh : e.name_en}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{e.track}</span>
                  <span>·</span>
                  <span>{e.carClass}</span>
                  <span>·</span>
                  <span>{new Date(e.eventStartTime).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium',
                e.status === 'RegistrationOpen' ? 'bg-green-500/10 text-green-400' :
                e.status === 'InProgress' ? 'bg-red-500/10 text-red-400' :
                'bg-gray-500/10 text-gray-400'
              )}>
                {t(`eventDetail.statusNames.${e.status}`)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">{t('common.noData')}</div>
      )}
    </div>
  )
}
