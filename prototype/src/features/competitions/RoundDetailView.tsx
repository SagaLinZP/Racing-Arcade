import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  AlertTriangle,
  Shield,
  Server,
  Flag,
  MapPin,
  CheckCircle,
  Calendar,
  Clock,
  X,
} from 'lucide-react'
import type { Competition, Round, Stage, Session } from '@/domain/competitions'
import { getRoundStatus } from '@/domain/status'
import { registrationRepository } from '@/data/repositories'
import { useRoundRegistration } from '@/hooks/useRoundRegistration'
import { useLocale } from '@/hooks/useLocale'
import { useApp } from '@/hooks/useAppStore'
import { StatusBadge } from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import type { Driver } from '@/domain/drivers'
import type { Team } from '@/domain/teams'


export function RoundDetailView({
  competition,
  round,
  drivers,
  teams,
}: {
  competition?: Competition
  round?: Round
  drivers: Driver[]
  teams: Team[]
}) {
  void teams
  const { t } = useTranslation()
  const { field, text, dateTime } = useLocale()
  const { state } = useApp()
  const { getSnapshot, register, unregister } = useRoundRegistration()

  const [showRulesDialog, setShowRulesDialog] = useState(false)
  const [rulesChecked, setRulesChecked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  if (!round) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground">
        {t('common.noData')}
      </div>
    )
  }

  const isCancelled = Boolean(round.cancelledReason_zh || round.cancelledReason_en)
  const nowMs = new Date().getTime()
  const status = getRoundStatus(round, competition)
  const snapshot = getSnapshot(round, competition)
  const isRegistered = snapshot.isRegistered

  const regCount = snapshot.registrationCount
  const capacity = snapshot.capacity
  const showEntryList = status === 'RegistrationOpen' || status === 'RegistrationClosed' || status === 'InProgress' || status === 'Completed' || status === 'ResultsLocked'

  const firstStage = [...round.stages].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]

  const roundName = field(round, 'name')
  const competitionName = competition ? field(competition, 'name') : ''

  const accessReq = competition ? field(competition.defaultRuleset, 'accessRequirements') : ''

  const progressPercent = snapshot.progressPercent
  const minUnit = text('分钟', 'min')
  const lapsUnit = text('圈', 'laps')

  const sessionDuration = (session: Session) => {
    if (session.type === 'race') {
      if (!session.raceDuration) return ''
      return `${session.raceDuration} ${session.raceDurationType === 'time' ? minUnit : lapsUnit}`
    }
    if (!session.durationMinutes) return ''
    return `${session.durationMinutes} ${minUnit}`
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {isCancelled && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-destructive">{t('eventDetail.cancelled')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('eventDetail.cancelReason')}: {field(round, 'cancelledReason')}
            </p>
          </div>
        </div>
      )}



      <div className="max-w-5xl mx-auto space-y-8">
          <div>
            {competition && (
              <div className="text-sm text-muted-foreground mb-1">{competitionName}</div>
            )}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black">{roundName}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {round.track && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {round.track}{round.trackLayout ? ` (${round.trackLayout})` : ''}
                  </span>
                )}
                <StatusBadge status={status} label={t(`eventDetail.statusNames.${status}`)} />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black leading-none">{regCount}</span>
                <div className="text-xs text-muted-foreground leading-tight">
                  {Number.isFinite(capacity)
                    ? <span>{text('已报名', 'registered')} / {capacity}</span>
                    : <span>{text('不限名额', 'no limit')}</span>}
                </div>
              </div>
              {isRegistered ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />{text('已报名', 'Registered')}
                </span>
              ) : (
                <StatusBadge status={status} label={t(`eventDetail.statusNames.${status}`)} />
              )}
            </div>

            {Number.isFinite(capacity) && (
              <div className="h-1.5 bg-accent rounded-full overflow-hidden mb-5">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, progressPercent)}%` }} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {firstStage && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-accent/60">
                  <Flag className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">{t('eventDetail.raceTime')}</div>
                    <div className="text-xs font-medium truncate">{dateTime(firstStage.startsAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-accent/60">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground">{t('eventDetail.registrationCloseTime')}</div>
                  <div className="text-xs font-medium truncate">{dateTime(round.registrationCloseAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                </div>
              </div>
              {round.cancelRegistrationDeadline && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-accent/60">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">{t('eventDetail.cancelRegistrationRule')}</div>
                    <div className="text-xs font-medium truncate">{dateTime(round.cancelRegistrationDeadline, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              {!isCancelled && status === 'Upcoming' && (
                <button type="button" disabled className="px-6 py-2.5 rounded-lg bg-accent text-muted-foreground font-semibold cursor-not-allowed">
                  {t('eventDetail.notYetOpen')}
                </button>
              )}
              {!isCancelled && status === 'RegistrationOpen' && (
                isRegistered ? (
                  <>
                    {snapshot.status === 'waitlisted' && (
                      <span className="px-4 py-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 font-semibold text-sm text-center">
                        {t('eventDetail.fullWaitlist')}
                      </span>
                    )}
                    <button type="button" onClick={() => setShowCancelConfirm(true)} className="px-4 py-2 rounded-lg bg-accent text-muted-foreground text-xs hover:text-destructive hover:bg-destructive/10 transition-colors">
                      {t('eventDetail.cancelRegistration')}
                    </button>
                  </>
                ) : state.isLoggedIn ? (
                  snapshot.isFull ? (
                    <button type="button" onClick={() => (accessReq ? setShowRulesDialog(true) : (register(round, competition), setShowSuccess(true)))} className="px-6 py-2.5 rounded-lg bg-accent text-foreground font-semibold hover:bg-accent/80 transition-colors">
                      {t('eventDetail.fullWaitlist')}
                    </button>
                  ) : (
                    <button type="button" onClick={() => (accessReq ? setShowRulesDialog(true) : (register(round, competition), setShowSuccess(true)))} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                      {t('eventDetail.registerNow')}
                    </button>
                  )
                ) : (
                  <Link to="/login" className="block text-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                    {t('eventDetail.loginToRegister')}
                  </Link>
                )
              )}
              {!isCancelled && status === 'RegistrationClosed' && (
                <button type="button" disabled className="px-6 py-2.5 rounded-lg bg-accent text-muted-foreground font-semibold cursor-not-allowed">
                  {t('registration.closed')}
                </button>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-4">{text('赛程阶段', 'Stages')}</h2>
            <div className="space-y-4">
              {round.stages.map((stage: Stage, index) => {
                const stageStart = new Date(stage.startsAt).getTime()
                const stageEnd = new Date(stage.endsAt).getTime()
                const isLive = nowMs >= stageStart && nowMs < stageEnd
                const isPast = nowMs >= stageEnd
                return (
                <div key={stage.id} className={cn(
                  'border rounded-xl p-4 transition-colors',
                  isLive
                    ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                    : isPast
                      ? 'border-border bg-background/40 opacity-60'
                      : 'border-border bg-background/40',
                )}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn('w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center shrink-0',
                      isLive ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground',
                    )}>{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{field(stage, 'name')}</span>
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-semibold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                            {text('进行中', 'Live')}
                          </span>
                        )}
                        {stage.splits.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                            <Server className="w-3 h-3" />
                            {stage.splits.length} {text('个服务器', 'servers')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateTime(stage.startsAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                        {' - '}
                        {dateTime(stage.endsAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      {(field(stage, 'description') || field(stage, 'summary')) && (
                        <p className="text-sm text-muted-foreground mt-2">{field(stage, 'description') || field(stage, 'summary')}</p>
                      )}
                    </div>
                  </div>
                  {stage.sessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {stage.sessions.map(session => (
                        <div key={session.id} className="bg-accent rounded-lg p-3">
                          <div className="font-semibold text-sm">{field(session, 'name')}</div>
                          <div className="text-xs text-muted-foreground mt-1">{sessionDuration(session)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isRegistered && isLive && stage.splits.length > 0 ? (() => {
                    const driverReg = registrationRepository.list({ roundId: round.id, driverId: state.currentUser?.id })[0]
                    const mySplit = driverReg?.splitNumber
                      ? stage.splits.find(sp => sp.splitNumber === driverReg.splitNumber)
                      : stage.splits[0]
                    if (!mySplit) return null
                    return (
                      <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-green-400 mb-1">
                          <Server className="w-4 h-4" />
                          {t('eventDetail.serverInfo')}
                          {stage.splits.length > 1 && driverReg?.splitNumber && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {text('第', 'Split')} {driverReg.splitNumber} {text('组', '')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs w-16 shrink-0">{t('eventDetail.serverName')}</span>
                          <span className="font-mono text-xs">{mySplit.serverName || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs w-16 shrink-0">{t('eventDetail.serverPassword')}</span>
                          <span className="font-mono text-xs">{mySplit.serverPassword || text('公开服务器', 'Public')}</span>
                        </div>
                        <p className="text-muted-foreground text-xs pt-1.5 border-t border-green-500/10">{t('eventDetail.serverJoinHintSelf')}</p>
                      </div>
                    )
                  })() : null}
                  {isRegistered && !isLive && !isPast && (
                    <div className="mt-3 rounded-lg border border-border bg-accent/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      {text('服务器信息将在阶段开放时公布', 'Server info will be available when the stage opens')}
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>

          {showEntryList && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{text('报名名单', 'Entry List')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {round.registeredDriverIds.slice(0, 20).map(dId => {
                  const driver = drivers.find(d => d.id === dId)
                  return driver ? (
                    <Link key={dId} to={`/driver/${dId}`} className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg hover:bg-primary/10 transition-colors">
                      <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold">{driver.nickname[0]}</div>
                      <span className="text-sm truncate">{driver.nickname}</span>
                    </Link>
                  ) : null
                })}
                {regCount > 20 && <div className="flex items-center justify-center px-3 py-2 text-sm text-muted-foreground">+{regCount - 20} {text('更多', 'more')}</div>}
              </div>
            </div>
          )}
        </div>

      {showRulesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">{t('eventDetail.accessRequirements')}</h3>
            </div>
            {accessReq && (
              <div className="bg-accent rounded-lg p-3 max-h-60 overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-line">{accessReq}</p>
              </div>
            )}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={rulesChecked} onChange={e => setRulesChecked(e.target.checked)} className="mt-0.5 accent-primary" />
              <span className="text-sm">{text('我已阅读并同意上述参赛要求与规则', 'I have read and agree to the entry requirements and rules above')}</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowRulesDialog(false); setRulesChecked(false) }} className="px-4 py-2 rounded-lg bg-accent text-muted-foreground font-semibold hover:bg-accent/80 transition-colors">
                {t('common.cancel', 'Cancel')}
              </button>
              <button type="button" disabled={!rulesChecked} onClick={() => { register(round, competition); setShowRulesDialog(false); setRulesChecked(false); setShowSuccess(true) }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {t('eventDetail.registerNow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg max-w-sm">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <div className="min-w-0">
            <h4 className="font-bold text-green-400 text-sm">{t('dialogs.registerSuccess')}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{t('dialogs.registerSuccessMsg')}</p>
          </div>
          <button type="button" onClick={() => setShowSuccess(false)} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="bg-card border border-border rounded-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-bold">{t('eventDetail.cancelRegistration')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('dialogs.cancelConfirm')}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 rounded-lg bg-accent text-muted-foreground font-semibold hover:bg-accent/80 transition-colors">
                {t('common.cancel', 'Cancel')}
              </button>
              <button type="button" onClick={() => { unregister(round, competition); setShowCancelConfirm(false) }} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors">
                {t('eventDetail.cancelRegistration')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
