import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { events } from '@/data/events'
import { drivers } from '@/data/drivers'
import { teams } from '@/data/teams'
import { championships } from '@/data/championships'
import { StatusBadge } from '@/components/StatusBadge'
import { getCoverGradient } from '@/data/events'
import { cn } from '@/lib/utils'
import {
  MapPin, Clock, Cloud, Wrench, Users, Calendar, ChevronRight,
  Flag, Download, AlertTriangle, Play, Radio, Shield, Server,
  Wifi, CheckCircle, XCircle, Info
} from 'lucide-react'

export function EventDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const event = events.find(e => e.id === id)
  const [registered, setRegistered] = useState(event?.registeredDriverIds.includes(state.currentUser?.id || '') || false)
  const [showRulesDialog, setShowRulesDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [activeSplit, setActiveSplit] = useState(1)

  if (!event) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const name = lang === 'zh' ? event.name_zh : event.name_en
  const desc = lang === 'zh' ? event.description_zh : event.description_en
  const rules = lang === 'zh' ? event.rules_zh : event.rules_en
  const scoringRules = lang === 'zh' ? event.scoringRules_zh : event.scoringRules_en
  const championship = event.championshipId ? championships.find(c => c.id === event.championshipId) : null
  const totalCapacity = event.maxEntriesPerSplit * (event.maxSplits || 1)
  const estimatedSplits = event.enableMultiSplit ? Math.ceil(event.currentRegistrations / event.maxEntriesPerSplit) : 1
  const isRegistered = registered
  const isCancelled = event.status === 'Cancelled'
  const hasResults = event.results && event.results.length > 0

  const handleRegister = () => {
    if (event.accessRequirements) {
      setShowRulesDialog(true)
    } else {
      setRegistered(true)
      setShowSuccessDialog(true)
    }
  }

  const handleConfirmRules = () => {
    setShowRulesDialog(false)
    setRegistered(true)
    setShowSuccessDialog(true)
  }

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.nickname || driverId
  const getTeamName = (teamId?: string) => teamId ? teams.find(t => t.id === teamId)?.name || '' : ''

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-destructive">{t('eventDetail.cancelled')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('eventDetail.cancelReason')}: {lang === 'zh' ? event.cancelledReason_zh : event.cancelledReason_en}
            </p>
          </div>
        </div>
      )}

      {/* Cover */}
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 mb-8" style={{ background: getCoverGradient(event.id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={event.status} label={t(`eventDetail.statusNames.${event.status}`)} />
            {event.streamUrl && <StatusBadge status="InProgress" label="LIVE" />}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">{name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Championship Link */}
          {championship && (
            <Link
              to={`/championships/${championship.id}`}
              className="flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Flag className="w-4 h-4 text-primary" />
              <span className="text-sm">{t('eventDetail.championship')}: {lang === 'zh' ? championship.name_zh : championship.name_en}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </Link>
          )}

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><span className="text-primary text-lg">🎮</span></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.game')}</div><div className="text-sm font-medium">{event.game}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.track')}</div><div className="text-sm font-medium">{event.track}{event.trackLayout ? ` (${event.trackLayout})` : ''}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><span className="text-primary text-lg">🏎️</span></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.carClass')}</div><div className="text-sm font-medium">{event.carClass}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Cloud className="w-4 h-4 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.weather')}</div><div className="text-sm font-medium">{event.weather || '-'}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.pitstop')}</div><div className="text-sm font-medium">{event.hasPitstop ? 'Yes' : 'No'}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.schedule')}</div><div className="text-sm font-medium">{formatDateTime(event.eventStartTime)}</div></div>
              </div>
            </div>
          </div>

          {/* Description */}
          {desc && (
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          )}

          {/* Session Info */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-4">{t('eventDetail.schedule')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.practiceDuration && (
                <div className="bg-accent rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">{t('eventDetail.practice')}</div>
                  <div className="font-bold">{event.practiceDuration} min</div>
                </div>
              )}
              {event.qualifyingDuration && (
                <div className="bg-accent rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">{t('eventDetail.qualifying')}</div>
                  <div className="font-bold">{event.qualifyingDuration} min</div>
                </div>
              )}
              <div className="bg-accent rounded-lg p-3">
                <div className="text-xs text-muted-foreground">{t('eventDetail.race')}</div>
                <div className="font-bold">{event.raceDuration} {event.raceDurationType === 'time' ? 'min' : 'laps'}</div>
              </div>
            </div>
          </div>

          {/* Rules */}
          {rules && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3">{t('eventDetail.rules')}</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-line">{rules}</div>
            </div>
          )}

          {/* Scoring Rules */}
          {scoringRules && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3">{t('eventDetail.scoring')}</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-line">{scoringRules}</div>
            </div>
          )}

          {/* Server Info (only for registered users) */}
          {isRegistered && event.serverInfo && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Server className="w-4 h-4 text-primary" />{t('eventDetail.serverInfo')}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('eventDetail.serverName')}:</span><span className="font-mono">{event.serverInfo}</span></div>
                {event.serverPassword && (
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">{t('eventDetail.serverPassword')}:</span><span className="font-mono">{event.serverPassword}</span></div>
                )}
                {event.serverJoinLink && (
                  <a href={event.serverJoinLink} className="flex items-center gap-2 text-primary hover:underline"><Wifi className="w-4 h-4" />{t('eventDetail.joinLink')}</a>
                )}
              </div>
            </div>
          )}

          {/* Live Stream */}
          {event.streamUrl && event.status === 'InProgress' && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Radio className="w-4 h-4 text-red-500" />{t('eventDetail.liveStream')}</h2>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <Play className="w-12 h-12 text-white/50" />
              </div>
            </div>
          )}

          {/* VOD */}
          {event.vodUrl && (
            <a href={event.vodUrl} className="flex items-center gap-2 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/15 transition-colors">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('eventDetail.vod')}</span>
            </a>
          )}

          {/* Participants */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{t('eventDetail.participants')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {event.registeredDriverIds.slice(0, 20).map(dId => {
                const driver = drivers.find(d => d.id === dId)
                return driver ? (
                  <Link key={dId} to={`/driver/${dId}`} className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg hover:bg-primary/10 transition-colors">
                    <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold">{driver.nickname[0]}</div>
                    <span className="text-sm truncate">{driver.nickname}</span>
                  </Link>
                ) : null
              })}
              {event.currentRegistrations > 20 && (
                <div className="flex items-center justify-center px-3 py-2 text-sm text-muted-foreground">
                  +{event.currentRegistrations - 20} more
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {hasResults && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2"><Flag className="w-4 h-4 text-primary" />{t('eventDetail.results')}</h2>
                {state.isLoggedIn && (
                  <Link
                    to={`/events/${event.id}/protest/new`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" /> {t('eventDetail.protest')}
                  </Link>
                )}
              </div>

              {event.enableMultiSplit && event.maxSplits && event.maxSplits > 1 && (
                <div className="flex gap-2 mb-4">
                  {Array.from({ length: estimatedSplits }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setActiveSplit(i + 1)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        activeSplit === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t('eventDetail.split', { number: i + 1 })}
                    </button>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
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
                    {event.results!.map(r => (
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration Card */}
          <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('eventDetail.registration')}</span>
                <StatusBadge status={event.status} label={t(`eventDetail.statusNames.${event.status}`)} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>{event.currentRegistrations} / {totalCapacity}</span>
              </div>
              {event.enableMultiSplit && (
                <div className="text-xs text-muted-foreground">
                  ~{estimatedSplits} {estimatedSplits === 1 ? 'server' : 'servers'}
                </div>
              )}
              <div className="w-full bg-accent rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (event.currentRegistrations / totalCapacity) * 100)}%` }}
                />
              </div>
            </div>

            {!isCancelled && (
              <>
                {event.status === 'RegistrationOpen' && (
                  isRegistered ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> {t('eventDetail.registered')}
                      </div>
                      <button
                        onClick={() => setRegistered(false)}
                        className="w-full px-4 py-2 bg-accent text-destructive rounded-lg text-sm hover:bg-destructive/10 transition-colors"
                      >
                        {t('eventDetail.cancelRegistration')}
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm hover:bg-accent/80 transition-colors">
                        <Download className="w-4 h-4" /> {t('eventDetail.addendum')}
                      </button>
                    </div>
                  ) : state.isLoggedIn ? (
                    event.currentRegistrations >= totalCapacity ? (
                      <button className="w-full px-4 py-2.5 bg-accent text-yellow-400 rounded-lg text-sm font-medium">
                        {t('eventDetail.fullWaitlist')}
                      </button>
                    ) : (
                      <button
                        onClick={handleRegister}
                        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        {t('eventDetail.registerNow')}
                      </button>
                    )
                  ) : (
                    <Link to="/login" className="block w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold text-center hover:bg-primary/90 transition-colors">
                      {t('eventDetail.loginToRegister')}
                    </Link>
                  )
                )}
                {event.status === 'Pending' && (
                  <button disabled className="w-full px-4 py-2.5 bg-accent text-muted-foreground rounded-lg text-sm cursor-not-allowed">
                    {t('events.registration.notStarted')}
                  </button>
                )}
                {event.status === 'RegistrationClosed' && (
                  <button disabled className="w-full px-4 py-2.5 bg-accent text-muted-foreground rounded-lg text-sm cursor-not-allowed">
                    {t('events.registration.closed')}
                  </button>
                )}
              </>
            )}

            {/* Important Dates */}
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Registration</span>
                <span>{formatDateTime(event.registrationOpenAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deadline</span>
                <span>{formatDateTime(event.registrationCloseAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Race</span>
                <span>{formatDateTime(event.eventStartTime)}</span>
              </div>
            </div>

            {/* Regions */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex flex-wrap gap-1">
                {event.regions.map(r => (
                  <span key={r} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Confirmation Dialog */}
      {showRulesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg mx-4 w-full">
            <h3 className="font-bold mb-3">{t('eventDetail.rules')}</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line mb-4 max-h-60 overflow-y-auto">{rules}</div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" id="rules-check" className="accent-[var(--color-primary)]" />
              <span className="text-sm">{t('dialogs.registerConfirm')}</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRulesDialog(false)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
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
