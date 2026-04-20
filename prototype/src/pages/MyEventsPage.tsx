import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { events } from '@/data/events'
import { championships } from '@/data/championships'
import { cn, getEventStatus } from '@/lib/utils'
import { Flag, Clock, CheckCircle, ChevronDown, ChevronRight, Trophy, Download } from 'lucide-react'

export function MyEventsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const userId = state.currentUser?.id || ''
  const [tab, setTab] = useState<'upcoming' | 'inProgress' | 'completed'>('upcoming')
  const [expandedChamps, setExpandedChamps] = useState<Set<string>>(new Set())

  const myEvents = events.filter(e => e.registeredDriverIds.includes(userId))
  const standalone = myEvents.filter(e => !e.championshipId)
  const withChampionship = myEvents.filter(e => e.championshipId)

  const champGroups = new Map<string, typeof withChampionship>()
  for (const e of withChampionship) {
    const cid = e.championshipId!
    if (!champGroups.has(cid)) champGroups.set(cid, [])
    champGroups.get(cid)!.push(e)
  }

  const champItems = Array.from(champGroups.entries()).map(([champId, evts]) => ({
    championship: championships.find(c => c.id === champId)!,
    events: evts,
  })).filter(c => c.championship)

  const statusCategory = (s: string) => {
    if (['RegistrationOpen', 'RegistrationClosed', 'Upcoming'].includes(s)) return 'upcoming' as const
    if (s === 'InProgress') return 'inProgress' as const
    return 'completed' as const
  }

  const getStandalone = (cat: 'upcoming' | 'inProgress' | 'completed') =>
    standalone.filter(e => statusCategory(getEventStatus(e)) === cat)

  const getChampItems = (cat: 'upcoming' | 'inProgress' | 'completed') =>
    champItems.filter(ci => ci.events.some(e => statusCategory(getEventStatus(e)) === cat))

  const counts = {
    upcoming: getStandalone('upcoming').length + getChampItems('upcoming').length,
    inProgress: getStandalone('inProgress').length + getChampItems('inProgress').length,
    completed: getStandalone('completed').length + getChampItems('completed').length,
  }

  const currentStandalone = getStandalone(tab)
  const currentChampItems = getChampItems(tab)

  const toggleExpand = (id: string) => {
    setExpandedChamps(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const statusColor = (s: string) => {
    if (s === 'RegistrationOpen') return 'bg-green-500/10 text-green-400'
    if (s === 'RegistrationClosed') return 'bg-yellow-500/10 text-yellow-400'
    if (s === 'Upcoming') return 'bg-blue-500/10 text-blue-400'
    if (s === 'InProgress') return 'bg-red-500/10 text-red-400'
    return 'bg-gray-500/10 text-gray-400'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myEvents.title')}</h1>

      <div className="flex gap-2 mb-6">
        {([
          { key: 'upcoming', label: t('myEvents.upcoming'), icon: Clock, count: counts.upcoming },
          { key: 'inProgress', label: t('myEvents.inProgress'), icon: Flag, count: counts.inProgress },
          { key: 'completed', label: t('myEvents.completed'), icon: CheckCircle, count: counts.completed },
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

      {currentStandalone.length + currentChampItems.length > 0 ? (
        <div className="space-y-3">
          {currentStandalone.map(e => (
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
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusColor(getEventStatus(e)))}>
                {t(`eventDetail.statusNames.${getEventStatus(e)}`)}
              </span>
              <button
                onClick={e2 => { e2.preventDefault(); e2.stopPropagation() }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
              >
                <Download className="w-3 h-3" /> {t('eventDetail.addendum')}
              </button>
            </Link>
          ))}

          {currentChampItems.map(ci => {
            const ch = ci.championship
            const expanded = expandedChamps.has(ch.id)
            const chName = lang === 'zh' ? ch.name_zh : ch.name_en
            return (
              <div key={ch.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(ch.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  <Trophy className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-medium text-sm">{chName}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-accent text-[10px] font-semibold">{ch.game}</span>
                      <span>{ch.carClass}</span>
                      <span>·</span>
                      <span>{ci.events.length} {lang === 'zh' ? '场已报名' : 'registered'}</span>
                    </div>
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>
                {expanded && (
                  <div className="border-t border-border">
                    {ci.events.map(e => (
                      <Link
                        key={e.id}
                        to={`/championships/${ch.id}`}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors border-b border-border last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm">{lang === 'zh' ? e.name_zh : e.name_en}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{e.track}</span>
                            <span>·</span>
                            <span>{new Date(e.eventStartTime).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColor(getEventStatus(e)))}>
                          {t(`eventDetail.statusNames.${getEventStatus(e)}`)}
                        </span>
                        <button
                          onClick={e2 => { e2.preventDefault(); e2.stopPropagation() }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
                        >
                          <Download className="w-3 h-3" /> {t('eventDetail.addendum')}
                        </button>
                        <span className="text-xs text-primary hover:underline whitespace-nowrap">{lang === 'zh' ? '查看详情' : 'View Details'}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">{t('common.noData')}</div>
      )}
    </div>
  )
}
