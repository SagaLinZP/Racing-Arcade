import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { championships } from '@/data/championships'
import { events, getCoverGradient } from '@/data/events'
import { drivers } from '@/data/drivers'
import { teams } from '@/data/teams'
import { StatusBadge } from '@/components/StatusBadge'
import { ScoringRulesCard } from '@/components/ScoringRulesCard'
import { cn } from '@/lib/utils'
import { getEventStatus } from '@/domain/events'
import { getChampionshipSchedule, getChampionshipStandings } from '@/domain/championships'
import { useEventRegistration, type EventRegistrationSnapshot } from '@/hooks/useEventRegistration'
import {
  Trophy, MapPin, Clock, ChevronDown, ChevronUp, Users, Shield,
  Play, Download, Flag, Cloud, Wrench, Server, Wifi, CheckCircle,
  Radio, Calendar, BarChart3, ScrollText,
} from 'lucide-react'

function CollapsibleSection({
  title,
  defaultOpen = false,
  highlight = false,
  icon,
  children,
}: {
  title: string
  defaultOpen?: boolean
  highlight?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn(
      'bg-card border rounded-xl overflow-hidden',
      highlight ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border',
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors"
      >
        <span className="flex items-center gap-2 font-bold">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

function ResultsTab({
  chEvents,
  lang,
  t,
  resultsEventFilter,
  setResultsEventFilter,
  resultsSession,
  setResultsSession,
}: {
  chEvents: typeof events
  lang: 'en' | 'zh'
  t: (key: string) => string
  resultsEventFilter: string
  setResultsEventFilter: (v: string) => void
  resultsSession: 'race' | 'qualifying'
  setResultsSession: (v: 'race' | 'qualifying') => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const eventsWithResults = chEvents.filter(e => e.results && e.results.length > 0)

  const filteredResults = (() => {
    const targetEvent = eventsWithResults.find(e => e.id === resultsEventFilter)
    if (!targetEvent) return []
    const allResults = (targetEvent.results || []).map(r => ({ ...r, eventId: targetEvent.id }))
    if (resultsSession === 'qualifying') {
      return [...allResults]
        .filter(r => r.bestLap)
        .sort((a, b) => a.bestLap.localeCompare(b.bestLap))
    }
    return allResults.sort((a, b) => a.position - b.position)
  })()

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.nickname || driverId
  const getTeamName = (teamId?: string) => teamId ? teams.find(t2 => t2.id === teamId)?.name || '' : ''

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-64 flex items-center justify-between rounded-lg border border-border bg-card pl-3 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-accent transition-colors"
          >
            <span className="truncate">
              {(() => { const ev = eventsWithResults.find(e => e.id === resultsEventFilter); return ev ? (lang === 'zh' ? ev.name_zh : ev.name_en) : '' })()}
            </span>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', dropdownOpen && 'rotate-180')} />
          </button>
          {dropdownOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-xl shadow-black/40 py-1 max-h-64 overflow-y-auto">
              {eventsWithResults.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setResultsEventFilter(e.id); setDropdownOpen(false) }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    resultsEventFilter === e.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                  )}
                >
                  {lang === 'zh' ? e.name_zh : e.name_en}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setResultsSession('race')}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              resultsSession === 'race' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            {t('championships.resultsSessionRace')}
          </button>
          <button
            onClick={() => setResultsSession('qualifying')}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              resultsSession === 'qualifying' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            {t('championships.resultsSessionQualifying')}
          </button>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
          {t('championships.resultsNoData')}
        </div>
      ) : (
        <div className="-mx-4 md:-mx-8 lg:-mx-16 xl:-mx-24 overflow-x-auto">
          <div className="min-w-[800px] bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border bg-accent/50">
                  <th className="text-left py-3 px-3 w-10">#</th>
                  <th className="text-left py-3 px-3">{t('eventDetail.driver')}</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">{lang === 'zh' ? '车队' : 'Team'}</th>
                  {resultsSession === 'race' && <th className="text-left py-3 px-3 hidden md:table-cell">{t('championships.resultsTotalTime')}</th>}
                  <th className="text-left py-3 px-3 hidden md:table-cell">{t('championships.resultsLaps')}</th>
                  <th className="text-left py-3 px-3 hidden lg:table-cell">{t('championships.resultsBestLap')}</th>
                  {resultsSession === 'race' && <th className="text-left py-3 px-3 hidden lg:table-cell">{t('championships.resultsGap')}</th>}
                  <th className="text-left py-3 px-3">{t('championships.resultsStatus')}</th>
                  <th className="text-right py-3 px-4">{t('championships.resultsPoints')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, idx) => (
                  <tr key={`${r.eventId}-${r.driverId}-${idx}`} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        'font-bold text-sm',
                        resultsSession === 'race'
                          ? (r.position === 1 ? 'text-yellow-400' : r.position === 2 ? 'text-gray-300' : r.position === 3 ? 'text-amber-600' : 'text-muted-foreground')
                          : (idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground')
                      )}>
                        {resultsSession === 'race' ? r.position : idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Link to={`/driver/${r.driverId}`} className="hover:text-primary transition-colors font-medium">{getDriverName(r.driverId)}</Link>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground hidden md:table-cell">{getTeamName(r.teamId)}</td>
                    {resultsSession === 'race' && <td className="py-2.5 px-3 font-mono text-xs hidden md:table-cell">{r.totalTime || '-'}</td>}
                    <td className="py-2.5 px-3 text-xs hidden md:table-cell">{r.lapsCompleted}</td>
                    <td className="py-2.5 px-3 font-mono text-xs hidden lg:table-cell">{r.bestLap || '-'}</td>
                    {resultsSession === 'race' && <td className="py-2.5 px-3 font-mono text-xs hidden lg:table-cell">{r.gapToLeader || '-'}</td>}
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        r.status === 'Finished' ? 'bg-green-500/10 text-green-400' :
                        r.status === 'DNF' ? 'bg-red-500/10 text-red-400' :
                        r.status === 'DSQ' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function RegistrationButton({
  event,
  isLoggedIn,
  t,
  registration,
  onRegister,
  onUnregister,
}: {
  event: typeof events[0]
  isLoggedIn: boolean
  t: (key: string) => string
  registration: EventRegistrationSnapshot
  onRegister: () => void
  onUnregister: () => void
}) {
  const totalCapacity = registration.capacity
  const regCount = registration.registrationCount
  const isRegistered = registration.isRegistered
  const status = getEventStatus(event)
  const isCancelled = status === 'Cancelled'

  if (isCancelled) {
    return <button disabled className="w-full px-3 py-2 bg-accent text-muted-foreground rounded-lg text-sm cursor-not-allowed">{t('eventDetail.cancelled')}</button>
  }

  if (status === 'Upcoming') {
    return (
      <div className="space-y-2">
        <span className="block text-xs text-muted-foreground">{t('eventDetail.notYetOpen')}</span>
      </div>
    )
  }

  if (status === 'RegistrationOpen') {
    if (isRegistered) {
      return (
        <button onClick={onUnregister} className="w-full px-4 py-2 bg-accent text-destructive rounded-lg text-sm hover:bg-destructive/10 transition-colors">
          {t('eventDetail.cancelRegistration')}
        </button>
      )
    }
    if (!isLoggedIn) {
      return (
        <Link to="/login" className="block w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold text-center hover:bg-primary/90 transition-colors">
          {t('eventDetail.loginToRegister')}
        </Link>
      )
    }
    if (regCount >= totalCapacity) {
      return <button className="w-full px-3 py-2 bg-accent text-yellow-400 rounded-lg text-sm font-medium">{t('eventDetail.fullWaitlist')}</button>
    }
    return (
      <button onClick={onRegister} className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
        {t('eventDetail.registerNow')}
      </button>
    )
  }

  if (status === 'RegistrationClosed') {
    return <button disabled className="w-full px-3 py-2 bg-accent text-muted-foreground rounded-lg text-sm cursor-not-allowed">{t('events.registration.closed')}</button>
  }

  return null
}

export function ChampionshipDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const { getSnapshot, register, unregister } = useEventRegistration()

  const [showRulesDialog, setShowRulesDialog] = useState<{ eventId: string; accessReq?: string; rules?: string } | null>(null)
  const [rulesChecked, setRulesChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'results'>('info')
  const [resultsEventFilter, setResultsEventFilter] = useState('')
  const [resultsSession, setResultsSession] = useState<'race' | 'qualifying'>('race')

  const championship = championships.find(c => c.id === id)
  if (!championship) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const ch = championship
  const {
    events: chEvents,
    eventsWithResults,
    nextRegistrable,
    futureEvents,
    pastEvents,
  } = getChampionshipSchedule(ch, events)
  const effectiveResultsEventFilter = resultsEventFilter || (eventsWithResults.length > 0 ? eventsWithResults[0].id : '')
  const standings = getChampionshipStandings(chEvents)

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.nickname || driverId
  const getTeamForDriver = (driverId: string) => {
    const team = teams.find(t2 => t2.members.some(m => m.userId === driverId))
    return team?.name || ''
  }

  const rules = lang === 'zh' ? ch.rules_zh : ch.rules_en
  const resources = lang === 'zh' ? ch.resources_zh : ch.resources_en
  const progression = lang === 'zh' ? ch.progressionRules_zh : ch.progressionRules_en
  const chAccessReq = lang === 'zh' ? ch.accessRequirements_zh : ch.accessRequirements_en

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  }

  const handleRegister = (event: typeof events[0]) => {
    if (!state.isLoggedIn) return
    const eventRules = lang === 'zh' ? event.rules_zh : event.rules_en
    const chRules = rules
    const eventAccessReq = lang === 'zh' ? event.accessRequirements_zh : event.accessRequirements_en
    const effectiveRules = eventRules || chRules
    const accessReq = eventAccessReq || chAccessReq
    if (effectiveRules || accessReq) {
      setRulesChecked(false)
      setShowRulesDialog({ eventId: event.id, accessReq: accessReq || undefined, rules: effectiveRules || undefined })
    } else {
      register(event)
    }
  }

  const handleConfirmRules = () => {
    if (!rulesChecked || !showRulesDialog) return
    const event = chEvents.find(e => e.id === showRulesDialog.eventId)
    if (event) register(event)
    setShowRulesDialog(null)
  }

  const handleUnregister = (event: typeof events[0]) => {
    unregister(event)
  }

  const renderResultsSummary = (event: typeof events[0]) => {
    if (!event.results || event.results.length === 0) return null
    const winner = event.results.find(r => r.position === 1)
    const podium = event.results.filter(r => r.position <= 3)
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {winner && (
          <span className="text-xs">
            <Trophy className="w-3 h-3 text-yellow-400 inline mr-1" />
            {getDriverName(winner.driverId)}
          </span>
        )}
        {podium.length > 1 && (
          <span className="text-xs text-muted-foreground">
            {lang === 'zh' ? '领奖台: ' : 'Podium: '}
            {podium.map(r => getDriverName(r.driverId)).join(', ')}
          </span>
        )}
      </div>
    )
  }

  const renderEventRow = (event: typeof events[0], isPast = false) => {
    const registration = getSnapshot(event)

    return (
      <div key={event.id} className={cn(
        'border rounded-lg p-4',
        isPast ? 'border-border bg-card' : 'border-border bg-card hover:border-primary/30 transition-colors',
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm">{lang === 'zh' ? event.name_zh : event.name_en}</h4>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.track}{event.trackLayout ? ` (${event.trackLayout})` : ''}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(event.eventStartTime)}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{registration.registrationCount}/{registration.capacity}</span>
            </div>
            {isPast && renderResultsSummary(event)}
          </div>
        </div>

        {isPast && event.results && event.results.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => { setResultsEventFilter(event.id); setActiveTab('results') }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <BarChart3 className="w-3 h-3" />
              {lang === 'zh' ? '查看成绩' : 'View results'}
            </button>
          </div>
        )}

        {isPast && (
          <div className="flex items-center gap-3 mt-3">
            {event.vodUrl && (
              <a href={event.vodUrl} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Play className="w-3 h-3" /> {lang === 'zh' ? '直播回放' : 'Live Replay'}
              </a>
            )}
            {state.isLoggedIn && event.results && event.results.length > 0 && (
              <Link to={`/events/${event.id}/protest/new`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Shield className="w-3 h-3" /> {t('eventDetail.protest')}
              </Link>
            )}
          </div>
        )}

      </div>
    )
  }

  const nextRegistration = nextRegistrable ? getSnapshot(nextRegistrable) : null
  const nextCapacity = nextRegistration?.capacity ?? 0
  const nextRegistered = nextRegistration?.isRegistered ?? false
  const nextStatus = nextRegistrable ? getEventStatus(nextRegistrable) : null

  const tabs: { key: typeof activeTab; label: string; icon: typeof Trophy }[] = [
    { key: 'info', label: lang === 'zh' ? '锦标赛信息' : 'Championship Info', icon: Trophy },
    { key: 'schedule', label: lang === 'zh' ? '赛程' : 'Schedule', icon: Calendar },
    { key: 'results', label: lang === 'zh' ? '成绩' : 'Results', icon: BarChart3 },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 overflow-x-visible">
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-56 mb-8" style={{ background: getCoverGradient(ch.id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">{lang === 'zh' ? '锦标赛' : 'Championship'}</span>
            <StatusBadge
              status={ch.status === 'upcoming' ? 'Draft' : ch.status === 'active' ? 'RegistrationOpen' : 'Completed'}
              label={ch.status === 'upcoming' ? (lang === 'zh' ? '即将开始' : 'Upcoming') : ch.status === 'active' ? (lang === 'zh' ? '进行中' : 'Active') : (lang === 'zh' ? '已结束' : 'Completed')}
            />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">
            {lang === 'zh' ? ch.name_zh : ch.name_en}
          </h1>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className={cn('grid gap-8', activeTab === 'results' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3')}>
        <div className={cn('space-y-6', activeTab !== 'results' && 'lg:col-span-2')}>
          {activeTab === 'results' ? (
            <ResultsTab
              chEvents={chEvents}
              lang={lang}
              t={t}
              resultsEventFilter={effectiveResultsEventFilter}
              setResultsEventFilter={setResultsEventFilter}
              resultsSession={resultsSession}
              setResultsSession={setResultsSession}
            />
          ) : activeTab === 'info' ? (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm text-muted-foreground">{lang === 'zh' ? ch.description_zh : ch.description_en}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-bold mb-4">{lang === 'zh' ? '赛事信息' : 'Event Info'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><span className="text-primary text-lg">🎮</span></div>
                    <div><div className="text-xs text-muted-foreground">{t('eventDetail.game')}</div><div className="text-sm font-medium">{ch.game}</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><span className="text-primary text-lg">🏎️</span></div>
                    <div><div className="text-xs text-muted-foreground">{t('eventDetail.carClass')}</div><div className="text-sm font-medium">{ch.carClass}</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Cloud className="w-4 h-4 text-primary" /></div>
                    <div><div className="text-xs text-muted-foreground">{t('eventDetail.weather')}</div><div className="text-sm font-medium">{ch.weather || '-'}</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-primary" /></div>
                    <div><div className="text-xs text-muted-foreground">{t('eventDetail.pitstop')}</div><div className="text-sm font-medium">{ch.hasPitstop ? (lang === 'zh' ? '需要' : 'Yes') : (lang === 'zh' ? '不需要' : 'No')}</div></div>
                  </div>
                  {ch.practiceDuration && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
                      <div><div className="text-xs text-muted-foreground">{t('eventDetail.practice')}</div><div className="text-sm font-medium">{ch.practiceDuration} min</div></div>
                    </div>
                  )}
                  {ch.qualifyingDuration && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
                      <div><div className="text-xs text-muted-foreground">{t('eventDetail.qualifying')}</div><div className="text-sm font-medium">{ch.qualifyingDuration} min</div></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Flag className="w-4 h-4 text-primary" /></div>
                    <div><div className="text-xs text-muted-foreground">{t('eventDetail.race')}</div><div className="text-sm font-medium">{ch.raceDuration} {ch.raceDurationType === 'time' ? (lang === 'zh' ? '分钟' : 'min') : (lang === 'zh' ? '圈' : 'laps')}</div></div>
                  </div>
                </div>
              </div>

              {rules && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{t('championships.rules')}</h2>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{rules}</div>
                </div>
              )}

              {(ch.scoringRules_zh || ch.scoringRules_en || (ch.scoringTable && ch.scoringTable.length > 0)) && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="font-bold mb-3">{t('eventDetail.scoring')}</h2>
                  <ScoringRulesCard
                    rulesText={lang === 'zh' ? ch.scoringRules_zh : ch.scoringRules_en}
                    scoringTable={ch.scoringTable}
                  />
                </div>
              )}

              {progression && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="font-bold mb-3">{t('championships.progression')}</h2>
                  <p className="text-sm text-muted-foreground">{progression}</p>
                </div>
              )}

              {chAccessReq && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{t('championships.accessRequirements')}</h2>
                  <p className="text-sm text-muted-foreground">{chAccessReq}</p>
                </div>
              )}

              {resources && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><Download className="w-4 h-4 text-primary" />{t('championships.resources')}</h2>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{resources}</div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" />{t('championships.standings')}</h2>
                {standings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs border-b border-border">
                          <th className="text-left py-2 pr-3 w-10">#</th>
                          <th className="text-left py-2 pr-3">{t('eventDetail.driver')}</th>
                          <th className="text-left py-2 pr-3 hidden sm:table-cell">{lang === 'zh' ? '车队' : 'Team'}</th>
                          <th className="text-right py-2">{t('eventDetail.points')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map(([driverId, points], idx) => (
                          <tr key={driverId} className="border-b border-border/50 hover:bg-accent/50">
                            <td className="py-2.5 pr-3">
                              <span className={cn(
                                'font-bold text-sm',
                                idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'
                              )}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <Link to={`/driver/${driverId}`} className="hover:text-primary transition-colors font-medium">
                                {getDriverName(driverId)}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-3 text-muted-foreground hidden sm:table-cell">{getTeamForDriver(driverId)}</td>
                            <td className="py-2.5 text-right font-bold">{points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData')}</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {chEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">{t('common.noData')}</p>
              )}
              {futureEvents.length > 0 && (
                <CollapsibleSection
                  title={`${lang === 'zh' ? '未来赛事' : 'Upcoming'} (${futureEvents.length})`}
                  defaultOpen
                  icon={<Clock className="w-4 h-4 text-primary" />}
                >
                  <div className="space-y-3">
                    {futureEvents.map(e => renderEventRow(e, false))}
                  </div>
                </CollapsibleSection>
              )}
              {pastEvents.length > 0 && (
                <CollapsibleSection
                  title={`${lang === 'zh' ? '历史赛事' : 'Past Events'} (${pastEvents.length})`}
                  defaultOpen={false}
                  icon={<Flag className="w-4 h-4 text-muted-foreground" />}
                >
                  <div className="space-y-3">
                    {pastEvents.map(e => renderEventRow(e, true))}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          )}
        </div>

        {activeTab !== 'results' && (
        <div className="space-y-4 sticky top-20">
          {nextRegistrable && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold mb-3">{lang === 'zh' ? '下一场赛事' : 'Next Event'}</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{lang === 'zh' ? nextRegistrable.name_zh : nextRegistrable.name_en}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground flex-wrap text-xs">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{nextRegistrable.track}{nextRegistrable.trackLayout ? ` (${nextRegistrable.trackLayout})` : ''}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(nextRegistrable.eventStartTime)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{t('eventDetail.registrationCount')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {nextRegistered ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> {t('eventDetail.registered')}
                      </span>
                    ) : (
                      <StatusBadge status={nextStatus!} label={t(`eventDetail.statusNames.${nextStatus}`)} />
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {nextRegistration?.registrationCount ?? 0} <span className="text-lg text-muted-foreground">/</span> {nextCapacity}
                </div>
                <div className="w-full bg-accent rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${nextRegistration?.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>

              {nextRegistration && (
                <RegistrationButton
                  event={nextRegistrable}
                  isLoggedIn={state.isLoggedIn}
                  registration={nextRegistration}
                  t={t}
                  onRegister={() => handleRegister(nextRegistrable)}
                  onUnregister={() => handleUnregister(nextRegistrable)}
                />
              )}

              {nextRegistered && (
                <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm hover:bg-accent/80 transition-colors">
                  <Download className="w-4 h-4" /> {t('eventDetail.addendum')}
                </button>
              )}

              <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>{lang === 'zh' ? '报名截止' : 'Deadline'}</span>
                  <span>{formatDateTime(nextRegistrable.registrationCloseAt)}</span>
                </div>
                {nextRegistrable.cancelRegistrationDeadline && (
                  <div className="flex justify-between">
                    <span>{t('eventDetail.cancelRegistrationRule')}</span>
                    <span>{formatDateTime(nextRegistrable.cancelRegistrationDeadline)}</span>
                  </div>
                )}
              </div>

              {(nextRegistrable.streamUrl || ch.streamUrl) && nextStatus === 'InProgress' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm"><Radio className="w-4 h-4 text-red-500" />{t('eventDetail.liveStream')}</h4>
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/50" />
                  </div>
                </div>
              )}
            </div>
          )}

          {nextRegistered && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-green-400 mb-3"><Server className="w-4 h-4" />{t('eventDetail.serverInfo')}</h4>
              {nextRegistrable.serverInfo ? (
                <div className="space-y-3 text-sm">
                  <div><div className="text-muted-foreground text-xs mb-0.5">{championship.game === 'iRacing' ? t('eventDetail.sessionName') : t('eventDetail.serverName')}</div><div className="font-mono font-medium">{nextRegistrable.serverInfo}</div></div>
                  {nextRegistrable.serverPassword && (
                    <div><div className="text-muted-foreground text-xs mb-0.5">{t('eventDetail.serverPassword')}</div><div className="font-mono font-medium">{nextRegistrable.serverPassword}</div></div>
                  )}
                  {nextRegistrable.serverJoinLink && (
                    <a href={nextRegistrable.serverJoinLink} className="flex items-center gap-2 text-primary hover:underline font-medium"><Wifi className="w-3 h-3" />{championship.game === 'iRacing' ? t('eventDetail.hostedSessionLink') : t('eventDetail.joinLink')}</a>
                  )}
                  <p className="text-muted-foreground text-xs pt-2 border-t border-green-500/10">{championship.game === 'iRacing' ? t('eventDetail.serverJoinHintIracing') : t('eventDetail.serverJoinHintSelf')}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('eventDetail.serverInfoPending')}</p>
              )}
            </div>
          )}
        </div>
        )}
      </div>
      {showRulesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg mx-4 w-full">
            <h3 className="font-bold mb-3">{t('dialogs.registerNotice')}</h3>
            <div className="mb-4 max-h-60 overflow-y-auto space-y-4">
              {showRulesDialog.accessReq && (
                <div>
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-primary" />{t('championships.accessRequirements')}</h4>
                  <p className="text-sm text-muted-foreground">{showRulesDialog.accessReq}</p>
                </div>
              )}
              {showRulesDialog.rules && (
                <div>
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2"><ScrollText className="w-3.5 h-3.5 text-primary" />{t('eventDetail.rules')}</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{showRulesDialog.rules}</div>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={rulesChecked} onChange={e => setRulesChecked(e.target.checked)} className="accent-[var(--color-primary)]" />
              <span className="text-sm">{t('dialogs.registerConfirm')}</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRulesDialog(null)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={handleConfirmRules} disabled={!rulesChecked} className={cn('px-4 py-2 rounded-lg text-sm font-semibold', rulesChecked ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground cursor-not-allowed')}>{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
