import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { championships } from '@/data/championships'
import { events, getCoverGradient } from '@/data/events'
import { drivers } from '@/data/drivers'
import { teams } from '@/data/teams'
import { StatusBadge } from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import {
  Trophy, MapPin, Clock, ChevronDown, ChevronUp, Users, Shield,
  Play, Download, Flag, Cloud, Wrench, Server, Wifi, CheckCircle,
  Radio, AlertTriangle,
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

function RegistrationButton({
  event,
  isLoggedIn,
  userId,
  lang,
  t,
  onRegister,
  onUnregister,
}: {
  event: typeof events[0]
  isLoggedIn: boolean
  userId: string
  lang: 'en' | 'zh'
  t: (key: string) => string
  onRegister: () => void
  onUnregister: () => void
}) {
  const totalCapacity = event.maxEntriesPerSplit * (event.maxSplits || 1)
  const isRegistered = event.registeredDriverIds.includes(userId)
  const isCancelled = event.status === 'Cancelled'

  if (isCancelled) {
    return <button disabled className="w-full px-3 py-2 bg-accent text-muted-foreground rounded-lg text-sm cursor-not-allowed">{t('eventDetail.cancelled')}</button>
  }

  if (event.status === 'RegistrationOpen') {
    if (isRegistered) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> {t('eventDetail.registered')}
          </div>
          <button onClick={onUnregister} className="w-full px-3 py-1.5 bg-accent text-destructive rounded-lg text-xs hover:bg-destructive/10 transition-colors">
            {t('eventDetail.cancelRegistration')}
          </button>
        </div>
      )
    }
    if (!isLoggedIn) {
      return (
        <Link to="/login" className="block w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold text-center hover:bg-primary/90 transition-colors">
          {t('eventDetail.loginToRegister')}
        </Link>
      )
    }
    if (event.currentRegistrations >= totalCapacity) {
      return <button className="w-full px-3 py-2 bg-accent text-yellow-400 rounded-lg text-sm font-medium">{t('eventDetail.fullWaitlist')}</button>
    }
    return (
      <button onClick={onRegister} className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
        {t('eventDetail.registerNow')}
      </button>
    )
  }

  if (event.status === 'RegistrationClosed') {
    return <button disabled className="w-full px-3 py-2 bg-accent text-muted-foreground rounded-lg text-sm cursor-not-allowed">{t('events.registration.closed')}</button>
  }

  return null
}

export function ChampionshipDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language

  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({})
  const [showRulesDialog, setShowRulesDialog] = useState<{ eventId: string; rules: string } | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [registeredOverrides, setRegisteredOverrides] = useState<Record<string, boolean>>({})

  const championship = championships.find(c => c.id === id)
  if (!championship) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const ch = championship
  const chEvents = events.filter(e => ch.eventIds.includes(e.id))
  const allResults = chEvents.flatMap(e => e.results || [])
  const standings = Object.entries(
    allResults.reduce<Record<string, number>>((acc, r) => {
      acc[r.driverId] = (acc[r.driverId] || 0) + r.points
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.nickname || driverId
  const getTeamName = (teamId?: string) => teamId ? teams.find(t2 => t2.id === teamId)?.name || '' : ''
  const getTeamForDriver = (driverId: string) => {
    const team = teams.find(t2 => t2.members.some(m => m.userId === driverId))
    return team?.name || ''
  }

  const rules = lang === 'zh' ? ch.rules_zh : ch.rules_en
  const resources = lang === 'zh' ? ch.resources_zh : ch.resources_en
  const progression = lang === 'zh' ? ch.progressionRules_zh : ch.progressionRules_en

  const now = new Date()

  const nextRegistrable = chEvents
    .filter(e => e.status !== 'Cancelled' && new Date(e.registrationCloseAt) >= now)
    .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())[0]

  const futureEvents = chEvents
    .filter(e => e !== nextRegistrable && new Date(e.eventStartTime) >= now && e.status !== 'Cancelled')
    .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())

  const pastEvents = chEvents
    .filter(e => new Date(e.eventStartTime) < now || e.status === 'Completed' || e.status === 'ResultsPublished')
    .sort((a, b) => new Date(b.eventStartTime).getTime() - new Date(a.eventStartTime).getTime())

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  }

  const handleRegister = (event: typeof events[0]) => {
    const eventRules = lang === 'zh' ? event.rules_zh : event.rules_en
    const chRules = rules
    const effectiveRules = eventRules || chRules
    const accessReq = event.accessRequirements || ch.accessRequirements
    if (effectiveRules || accessReq) {
      setShowRulesDialog({ eventId: event.id, rules: effectiveRules || accessReq || '' })
    } else {
      setRegisteredOverrides(prev => ({ ...prev, [event.id]: true }))
      setShowSuccessDialog(true)
    }
  }

  const handleConfirmRules = () => {
    if (showRulesDialog) {
      setRegisteredOverrides(prev => ({ ...prev, [showRulesDialog.eventId]: true }))
    }
    setShowRulesDialog(null)
    setShowSuccessDialog(true)
  }

  const handleUnregister = (eventId: string) => {
    setRegisteredOverrides(prev => ({ ...prev, [eventId]: false }))
  }

  const isEventRegistered = (event: typeof events[0]) => {
    if (registeredOverrides[event.id] !== undefined) return registeredOverrides[event.id]
    return event.registeredDriverIds.includes(state.currentUser?.id || '')
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

  const renderResultsTable = (event: typeof events[0]) => {
    if (!event.results || event.results.length === 0) return null
    return (
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left py-2 pr-3">{t('eventDetail.position')}</th>
              <th className="text-left py-2 pr-3">{t('eventDetail.driver')}</th>
              <th className="text-left py-2 pr-3 hidden md:table-cell">{t('eventDetail.team')}</th>
              <th className="text-left py-2 pr-3 hidden md:table-cell">{t('eventDetail.totalTime')}</th>
              <th className="text-left py-2 pr-3 hidden lg:table-cell">{t('eventDetail.bestLap')}</th>
              <th className="text-left py-2 pr-3">{t('eventDetail.status')}</th>
              <th className="text-right py-2">{t('eventDetail.points')}</th>
            </tr>
          </thead>
          <tbody>
            {event.results.map(r => (
              <tr key={r.driverId} className="border-b border-border/50 hover:bg-accent/50">
                <td className="py-2.5 pr-3 font-bold">{r.position}</td>
                <td className="py-2.5 pr-3">
                  <Link to={`/driver/${r.driverId}`} className="hover:text-primary transition-colors">{getDriverName(r.driverId)}</Link>
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground hidden md:table-cell">{getTeamName(r.teamId)}</td>
                <td className="py-2.5 pr-3 font-mono text-xs hidden md:table-cell">{r.totalTime || '-'}</td>
                <td className="py-2.5 pr-3 font-mono text-xs hidden lg:table-cell">{r.bestLap || '-'}</td>
                <td className="py-2.5 pr-3">
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
                <td className="py-2.5 text-right font-bold">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderEventRow = (event: typeof events[0], showRegButton = true, isPast = false) => {
    const totalCapacity = event.maxEntriesPerSplit * (event.maxSplits || 1)
    const isRegistered = isEventRegistered(event)

    return (
      <div key={event.id} className={cn(
        'border rounded-lg p-4',
        isPast ? 'border-border bg-card' : 'border-border bg-card hover:border-primary/30 transition-colors',
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={event.status} label={t(`eventDetail.statusNames.${event.status}`)} />
              <h4 className="font-semibold text-sm">{lang === 'zh' ? event.name_zh : event.name_en}</h4>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.track}{event.trackLayout ? ` (${event.trackLayout})` : ''}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(event.eventStartTime)}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.currentRegistrations}/{totalCapacity}</span>
            </div>
            {!isPast && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{lang === 'zh' ? '报名截止: ' : 'Reg deadline: '}{formatDateTime(event.registrationCloseAt)}</span>
              </div>
            )}
            {isPast && renderResultsSummary(event)}
          </div>
          {showRegButton && !isPast && (
            <div className="w-40 flex-shrink-0">
              <RegistrationButton
                event={event}
                isLoggedIn={state.isLoggedIn}
                userId={state.currentUser?.id || ''}
                lang={lang}
                t={t}
                onRegister={() => handleRegister(event)}
                onUnregister={() => handleUnregister(event.id)}
              />
            </div>
          )}
        </div>

        {isPast && event.results && event.results.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setExpandedResults(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {expandedResults[event.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expandedResults[event.id] ? (lang === 'zh' ? '收起成绩' : 'Hide results') : (lang === 'zh' ? '查看成绩' : 'View results')}
            </button>
            {expandedResults[event.id] && renderResultsTable(event)}
          </div>
        )}

        {isPast && (
          <div className="flex items-center gap-3 mt-3">
            {event.vodUrl && (
              <a href={event.vodUrl} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Play className="w-3 h-3" /> {lang === 'zh' ? '回放' : 'VOD'}
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
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

      {/* Championship Public Info */}
      <div className="space-y-6 mb-8">
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

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3">{t('eventDetail.scoring')}</h2>
          <p className="text-sm text-muted-foreground">{lang === 'zh' ? ch.scoringRules_zh : ch.scoringRules_en}</p>
        </div>

        {progression && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3">{t('championships.progression')}</h2>
            <p className="text-sm text-muted-foreground">{progression}</p>
          </div>
        )}

        {ch.accessRequirements && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{t('championships.accessRequirements')}</h2>
            <p className="text-sm text-muted-foreground">{ch.accessRequirements}</p>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3">{lang === 'zh' ? '区域' : 'Regions'}</h2>
          <div className="flex flex-wrap gap-2">
            {ch.regions.map(r => (
              <span key={r} className="px-2.5 py-1 bg-primary/10 text-primary rounded text-xs font-medium">{r}</span>
            ))}
          </div>
        </div>

        {resources && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Download className="w-4 h-4 text-primary" />{t('championships.resources')}</h2>
            <div className="text-sm text-muted-foreground whitespace-pre-line">{resources}</div>
          </div>
        )}
      </div>

      {/* Standings */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
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

      {/* Next Registrable Event */}
      {nextRegistrable && (
        <div className="mb-6">
          <CollapsibleSection
            title={lang === 'zh' ? '即将开始的赛事' : 'Next Event'}
            defaultOpen
            highlight
            icon={<Flag className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={nextRegistrable.status} label={t(`eventDetail.statusNames.${nextRegistrable.status}`)} />
                      <h3 className="font-bold">{lang === 'zh' ? nextRegistrable.name_zh : nextRegistrable.name_en}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{nextRegistrable.track}{nextRegistrable.trackLayout ? ` (${nextRegistrable.trackLayout})` : ''}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{formatDateTime(nextRegistrable.eventStartTime)}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{lang === 'zh' ? '报名截止: ' : 'Reg closes: '}{formatDateTime(nextRegistrable.registrationCloseAt)}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{nextRegistrable.currentRegistrations} / {nextRegistrable.maxEntriesPerSplit * (nextRegistrable.maxSplits || 1)}</span>
                    </div>
                    <div className="w-full max-w-xs bg-accent rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(100, (nextRegistrable.currentRegistrations / (nextRegistrable.maxEntriesPerSplit * (nextRegistrable.maxSplits || 1))) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full max-w-xs">
                    <RegistrationButton
                      event={nextRegistrable}
                      isLoggedIn={state.isLoggedIn}
                      userId={state.currentUser?.id || ''}
                      lang={lang}
                      t={t}
                      onRegister={() => handleRegister(nextRegistrable)}
                      onUnregister={() => handleUnregister(nextRegistrable.id)}
                    />
                  </div>
                </div>

                {isEventRegistered(nextRegistrable) && nextRegistrable.serverInfo && (
                  <div className="mt-4 bg-accent rounded-lg p-3 space-y-2 text-sm">
                    <h4 className="font-semibold flex items-center gap-2"><Server className="w-4 h-4 text-primary" />{t('eventDetail.serverInfo')}</h4>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('eventDetail.serverName')}:</span><span className="font-mono">{nextRegistrable.serverInfo}</span></div>
                    {nextRegistrable.serverPassword && (
                      <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('eventDetail.serverPassword')}:</span><span className="font-mono">{nextRegistrable.serverPassword}</span></div>
                    )}
                    {nextRegistrable.serverJoinLink && (
                      <a href={nextRegistrable.serverJoinLink} className="flex items-center gap-2 text-primary hover:underline"><Wifi className="w-4 h-4" />{t('eventDetail.joinLink')}</a>
                    )}
                  </div>
                )}

                {(nextRegistrable.streamUrl || ch.streamUrl) && nextRegistrable.status === 'InProgress' && (
                  <div className="mt-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Radio className="w-4 h-4 text-red-500" />{t('eventDetail.liveStream')}</h4>
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/50" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Future Events */}
      {futureEvents.length > 0 && (
        <div className="mb-6">
          <CollapsibleSection
            title={`${lang === 'zh' ? '未来赛事' : 'Future Events'} (${futureEvents.length})`}
            defaultOpen={false}
            icon={<Clock className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-3">
              {futureEvents.map(e => renderEventRow(e, true, false))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="mb-6">
          <CollapsibleSection
            title={`${lang === 'zh' ? '历史赛事' : 'Past Events'} (${pastEvents.length})`}
            defaultOpen={false}
            icon={<Flag className="w-4 h-4 text-muted-foreground" />}
          >
            <div className="space-y-3">
              {pastEvents.map(e => renderEventRow(e, false, true))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Rules Confirmation Dialog */}
      {showRulesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg mx-4 w-full">
            <h3 className="font-bold mb-3">{t('eventDetail.rules')}</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line mb-4 max-h-60 overflow-y-auto">{showRulesDialog.rules}</div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" className="accent-[var(--color-primary)]" />
              <span className="text-sm">{t('dialogs.registerConfirm')}</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRulesDialog(null)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={handleConfirmRules} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full text-center">
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-1">{t('dialogs.registerSuccess')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('dialogs.registerSuccessMsg')}</p>
            <p className="text-xs text-muted-foreground mb-4">{t('dialogs.waitSplitNotice')}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowSuccessDialog(false)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={() => setShowSuccessDialog(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-1">
                <Download className="w-4 h-4" /> {t('dialogs.addToCalendar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
