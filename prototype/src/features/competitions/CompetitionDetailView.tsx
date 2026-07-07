import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  Info,
  FileText,
  Award,
  MapPin,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Users,
  Shield,
  Download,
  Server,
  CheckCircle,
  Radio,
  Calendar,
  BarChart3,
} from 'lucide-react'
import type { Competition, Round, Stage, SessionResult } from '@/domain/competitions'
import { getCompetitionStatus, getRoundStatus } from '@/domain/status'
import { getRegistrableRound } from '@/domain/competitionLists'
import { calculateCompetitionStandings, getRaceSessionId, type DriverStanding } from '@/domain/results'
import { useRoundRegistration } from '@/hooks/useRoundRegistration'
import { useApp } from '@/hooks/useAppStore'
import { useLocale } from '@/hooks/useLocale'
import type { Driver } from '@/domain/drivers'
import type { Team } from '@/domain/teams'
import { StatusBadge } from '@/components/StatusBadge'
import { ScoringRulesCard } from '@/components/ScoringRulesCard'
import { RoundDetailView } from '@/features/competitions/RoundDetailView'
import { getCoverGradient } from '@/shared/utils/eventVisuals'
import { cn } from '@/lib/utils'

type TabKey = 'info' | 'standings' | 'results' | 'schedule'

export function CompetitionDetailView({
  competition,
  drivers,
  teams,
  activeTab,
  setTab,
}: {
  competition: Competition
  drivers: Driver[]
  teams: Team[]
  activeTab: TabKey
  setTab: (tab: string) => void
}) {
  const { t } = useTranslation()
  const { field, text, dateTime } = useLocale()
  const { state } = useApp()
  const { getSnapshot, register, unregister } = useRoundRegistration()

  const [showRulesDialog, setShowRulesDialog] = useState(false)
  const [rulesChecked, setRulesChecked] = useState(false)
  const [resultsRoundId, setResultsRoundId] = useState<string>('all')
  const [resultsSession, setResultsSession] = useState<'race' | 'qualifying'>('race')
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null)

  const status = getCompetitionStatus(competition)
  const statusLabel = t(`eventDetail.statusNames.${status}`)
  const standings = calculateCompetitionStandings(competition)

  const firstStage = (round: Round): Stage | undefined => {
    const sorted = [...round.stages].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    return sorted[0]
  }
  const firstStageStartsAt = (round: Round): string | undefined => firstStage(round)?.startsAt

  const accessReq = field(competition.defaultRuleset, 'accessRequirements')
  const scoringRules = field(competition.defaultRuleset, 'scoringNote')
  const scoringTable = competition.defaultRuleset.scoringTable
  const resources = field(competition.defaultRuleset, 'resources')

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.nickname || driverId
  const getTeamName = (teamId?: string) => (teamId ? teams.find(tm => tm.id === teamId)?.name || '' : '')
  const getTeamForDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    return driver?.teamId ? getTeamName(driver.teamId) : ''
  }

  const podiumColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400'
    if (rank === 2) return 'bg-gray-400/20 text-gray-300'
    if (rank === 3) return 'bg-orange-700/30 text-orange-400'
    return 'bg-accent text-muted-foreground'
  }

  const tabs: { key: TabKey; label: string; icon: typeof Trophy }[] = [
    { key: 'info', label: text('赛事', 'Competition'), icon: Info },
    { key: 'schedule', label: text('赛程', 'Schedule'), icon: Calendar },
    { key: 'standings', label: text('积分榜', 'Standings'), icon: Trophy },
    { key: 'results', label: text('成绩', 'Results'), icon: BarChart3 },
  ]

  const nextRound = getRegistrableRound(competition)
  const sidebarRound = nextRound ?? competition.rounds.find(r => {
    const s = getRoundStatus(r, competition)
    return s !== 'Completed' && s !== 'ResultsLocked' && s !== 'Cancelled'
  })

  const isPastRound = (round: Round) => {
    const s = getRoundStatus(round, competition)
    return s === 'Completed' || s === 'ResultsLocked' || s === 'Cancelled'
  }
  const upcomingRounds = competition.rounds.filter(r => !isPastRound(r))
  const pastRounds = competition.rounds.filter(r => isPastRound(r))

  const eventsWithResults = competition.rounds.filter(round =>
    round.stages.some(stage =>
      stage.awardsPoints !== false &&
      stage.sessions.some(s => s.type === 'race') &&
      stage.splits.some(sp => sp.results && sp.results.length > 0),
    ),
  )

  const collectResultsRows = (): SessionResult[] => {
    const rows: SessionResult[] = []
    const targetRounds = resultsRoundId === 'all' ? eventsWithResults : eventsWithResults.filter(r => r.id === resultsRoundId)
    const sessionType = resultsSession === 'race' ? 'race' : 'qualifying'
    for (const round of targetRounds) {
      for (const stage of round.stages) {
        if (stage.awardsPoints === false) continue
        const targetSessionId = stage.sessions.find(s => s.type === sessionType)?.id ?? getRaceSessionId(stage)
        for (const split of stage.splits) {
          if (!split.results) continue
          for (const r of split.results) {
            if (targetSessionId && r.sessionId !== targetSessionId) continue
            rows.push(r)
          }
        }
      }
    }
    return rows
  }
  const resultsRows = collectResultsRows().slice().sort((a, b) => a.position - b.position)

  const roundHasRaceResults = (round: Round) =>
    round.stages.some(stage =>
      stage.sessions.some(s => s.type === 'race') &&
      stage.splits.some(sp => sp.results && sp.results.length > 0),
    )

  const formatDateTime = (value: string | Date) =>
    dateTime(value, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

  const renderRoundRow = (round: Round) => {
    const roundStatus = getRoundStatus(round, competition)
    const stageStart = firstStageStartsAt(round)
    const hasResults = roundHasRaceResults(round)
    return (
      <button
        type="button"
        key={round.id}
        onClick={() => setSelectedRoundId(round.id)}
        className="w-full text-left block border rounded-lg p-4 border-border bg-card hover:border-primary/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
              {round.roundNumber ?? competition.rounds.indexOf(round) + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h4 className="font-semibold text-sm">{field(round, 'name')}</h4>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {round.track}{round.trackLayout ? ` (${round.trackLayout})` : ''}
                </span>
                {stageStart && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(stageStart)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {round.currentRegistrations}{round.maxRegistrations ? `/${round.maxRegistrations}` : ''}
                </span>
              </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={roundStatus} label={t(`eventDetail.statusNames.${roundStatus}`)} />
              {isPastRound(round) && hasResults && (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <BarChart3 className="w-3 h-3" />
                  {t('eventDetail.results')}
                </span>
              )}
              {isPastRound(round) && state.isLoggedIn && hasResults && (
                (() => {
                  const protestStage = round.stages.find(st =>
                    st.sessions.some(s => s.type === 'race') &&
                    st.splits.some(sp => sp.results && sp.results.length > 0),
                  )
                  const sessionId = protestStage ? getRaceSessionId(protestStage) : undefined
                  if (!sessionId) return null
                  return (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      {t('eventDetail.protest')}
                    </span>
                  )
                })()
              )}
            </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
        </div>
      </button>
    )
  }

  const renderSidebar = () => {
    if (!sidebarRound) return null
    const snapshot = getSnapshot(sidebarRound, competition)
    const sidebarStatus = getRoundStatus(sidebarRound, competition)
    const sidebarFirstStage = firstStage(sidebarRound)
    const serverSplit = sidebarFirstStage?.splits[0]
    const isRegistered = snapshot.isRegistered

    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-bold flex-1">{field(sidebarRound, 'name')}</h3>
          <button
            type="button"
            onClick={() => { setTab('schedule'); setSelectedRoundId(sidebarRound.id) }}
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            {text('查看详情', 'Details')}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground space-y-1 mb-3">
          {sidebarRound.track && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {sidebarRound.track}{sidebarRound.trackLayout ? ` (${sidebarRound.trackLayout})` : ''}
            </div>
          )}
          {sidebarFirstStage && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(sidebarFirstStage.startsAt)}
            </div>
          )}
        </div>

        {sidebarRound.stages.length > 0 && (
          <div className="space-y-2 mb-4">
            {sidebarRound.stages.map((stage, idx) => (
              <div key={stage.id} className="bg-accent rounded-lg p-2.5">
                <div className="text-xs font-semibold flex items-center gap-1">
                  <span className="text-muted-foreground">{idx + 1}.</span>
                  {field(stage, 'name')}
                </div>
                {stage.sessions.length > 0 && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {stage.sessions.map(s => field(s, 'name')).join(' → ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{snapshot.registrationCount}{Number.isFinite(snapshot.capacity) ? `/${snapshot.capacity}` : ` ${text('已报名', 'registered')}`}</span>
          </div>
          {isRegistered ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {text('已报名', 'Registered')}
            </span>
          ) : (
            <StatusBadge status={sidebarStatus} label={t(`eventDetail.statusNames.${sidebarStatus}`)} />
          )}
        </div>

        {Number.isFinite(snapshot.capacity) && (
          <div className="h-2 bg-accent rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, snapshot.progressPercent)}%` }} />
          </div>
        )}

        {sidebarStatus === 'Upcoming' && (
          <button type="button" disabled className="w-full px-4 py-2.5 rounded-lg bg-accent text-muted-foreground font-semibold cursor-not-allowed">
            {t('eventDetail.notYetOpen')}
          </button>
        )}
        {sidebarStatus === 'RegistrationOpen' && (
          isRegistered ? (
            <button type="button" onClick={() => unregister(sidebarRound)} className="w-full px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors">
              {t('eventDetail.cancelRegistration')}
            </button>
          ) : state.isLoggedIn ? (
            snapshot.isFull ? (
              <button type="button" onClick={() => (accessReq ? setShowRulesDialog(true) : register(sidebarRound))} className="w-full px-4 py-2.5 rounded-lg bg-accent text-foreground font-semibold hover:bg-accent/80 transition-colors">
                {t('eventDetail.fullWaitlist')}
              </button>
            ) : (
              <button type="button" onClick={() => (accessReq ? setShowRulesDialog(true) : register(sidebarRound))} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                {t('eventDetail.registerNow')}
              </button>
            )
          ) : (
            <Link to="/login" className="block text-center w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              {t('eventDetail.loginToRegister')}
            </Link>
          )
        )}
        {sidebarStatus === 'RegistrationClosed' && (
          <button type="button" disabled className="w-full px-4 py-2.5 rounded-lg bg-accent text-muted-foreground font-semibold cursor-not-allowed">
            {t('registration.closed')}
          </button>
        )}

        <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t('eventDetail.registrationCloseTime')}</span>
            <span className="font-medium text-right">{formatDateTime(sidebarRound.registrationCloseAt)}</span>
          </div>
          {sidebarRound.cancelRegistrationDeadline && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t('eventDetail.cancelRegistrationRule')}</span>
              <span className="font-medium text-right">{formatDateTime(sidebarRound.cancelRegistrationDeadline)}</span>
            </div>
          )}
        </div>

        {isRegistered && serverSplit && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-green-400">
              <Server className="w-4 h-4" />
              {t('eventDetail.serverInfo')}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('eventDetail.serverName')}:</span>
                <span className="font-mono font-medium">{serverSplit.serverName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('eventDetail.serverPassword')}:</span>
                <span className="font-mono font-medium">{serverSplit.serverPassword || text('公开服务器', 'Public')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderInfoTab = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{text('简介', 'Description')}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{field(competition, 'description')}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-primary" />{text('赛事信息', 'Competition Info')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">🎮</div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{t('eventDetail.game')}</div>
              <div className="text-sm font-medium truncate">{competition.game}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">🏎️</div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{t('eventDetail.carClass')}</div>
              <div className="text-sm font-medium truncate">{competition.carClass}</div>
            </div>
          </div>
        </div>
      </div>

      {accessReq && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{t('eventDetail.accessRequirements')}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{accessReq}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-primary" />{t('eventDetail.scoring')}</h2>
        <ScoringRulesCard rulesText={scoringRules} scoringTable={scoringTable} />
      </div>

      {resources && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Download className="w-4 h-4 text-primary" />{t('eventDetail.resources')}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{resources}</p>
        </div>
      )}

      {competition.defaultRuleset.streamUrl && status === 'InProgress' && (
        <div className="bg-card border border-border rounded-xl p-5">
          <a href={competition.defaultRuleset.streamUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 group">
            <span className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:underline">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              {t('eventDetail.liveStream')}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </a>
        </div>
      )}
    </div>
  )

  const renderStandingsTab = () => (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" />{t('championships.standings')}</h2>
      {standings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-2 pr-3 w-12">#</th>
                <th className="text-left py-2 pr-3">{t('eventDetail.driver')}</th>
                <th className="text-left py-2 pr-3 hidden sm:table-cell">{t('eventDetail.team')}</th>
                <th className="text-right py-2">{t('eventDetail.points')}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: DriverStanding, i) => {
                const rank = i + 1
                return (
                  <tr key={s.driverId} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-2.5 pr-3">
                      <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', podiumColor(rank))}>
                        {rank}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Link to={`/driver/${s.driverId}`} className="hover:text-primary transition-colors">{getDriverName(s.driverId)}</Link>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground hidden sm:table-cell">{getTeamForDriver(s.driverId) || '-'}</td>
                    <td className="py-2.5 text-right font-bold text-primary">{s.totalPoints}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderScheduleTab = () => {
    const selectedRound = selectedRoundId ? competition.rounds.find(r => r.id === selectedRoundId) : null
    if (selectedRound) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedRoundId(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {text('返回赛程列表', 'Back to Schedule')}
          </button>
          <RoundDetailView competition={competition} round={selectedRound} drivers={drivers} teams={teams} />
        </div>
      )
    }
    return (
      <div className="space-y-4">
        {upcomingRounds.length > 0 && (
          <CollapsibleSection title={text('未来赛事', 'Upcoming Events')} defaultOpen icon={<Calendar className="w-4 h-4 text-primary" />}>
            <div className="space-y-3">
              {upcomingRounds.map(renderRoundRow)}
            </div>
          </CollapsibleSection>
        )}
        {pastRounds.length > 0 && (
          <CollapsibleSection title={text('历史赛事', 'Past Events')} defaultOpen={pastRounds.some(r => roundHasRaceResults(r))} icon={<BarChart3 className="w-4 h-4 text-primary" />}>
            <div className="space-y-3">
              {pastRounds.map(renderRoundRow)}
            </div>
          </CollapsibleSection>
        )}
        {upcomingRounds.length === 0 && pastRounds.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        )}
      </div>
    )
  }

  const renderResultsTab = () => (
    <div className="space-y-4">
      {eventsWithResults.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground text-center">{t('championships.resultsNoData')}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">{t('championships.resultsFilterEvent')}</label>
              <select
                value={resultsRoundId}
                onChange={e => setResultsRoundId(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">{t('championships.resultsAllEvents')}</option>
                {eventsWithResults.map(r => (
                  <option key={r.id} value={r.id}>{field(r, 'name')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 bg-accent rounded-lg p-1">
              <button
                type="button"
                onClick={() => setResultsSession('race')}
                className={cn('px-3 py-1 rounded-md text-xs font-medium transition-colors', resultsSession === 'race' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                {t('championships.resultsSessionRace')}
              </button>
              <button
                type="button"
                onClick={() => setResultsSession('qualifying')}
                className={cn('px-3 py-1 rounded-md text-xs font-medium transition-colors', resultsSession === 'qualifying' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                {t('championships.resultsSessionQualifying')}
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            {resultsRows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">{t('championships.resultsNoData')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-left py-2 pr-3 w-12">{t('eventDetail.position')}</th>
                      <th className="text-left py-2 pr-3">{t('eventDetail.driver')}</th>
                      <th className="text-left py-2 pr-3 hidden md:table-cell">{t('eventDetail.team')}</th>
                      <th className="text-left py-2 pr-3 hidden md:table-cell">{t('championships.resultsTotalTime')}</th>
                      <th className="text-left py-2 pr-3 hidden lg:table-cell">{t('championships.resultsBestLap')}</th>
                      <th className="text-left py-2 pr-3">{t('championships.resultsStatus')}</th>
                      <th className="text-right py-2">{t('championships.resultsPoints')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsRows.map(r => (
                      <tr key={`${r.driverId}-${r.sessionId ?? ''}-${r.position}`} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="py-2.5 pr-3 font-bold">{r.position}</td>
                        <td className="py-2.5 pr-3"><Link to={`/driver/${r.driverId}`} className="hover:text-primary transition-colors">{getDriverName(r.driverId)}</Link></td>
                        <td className="py-2.5 pr-3 text-muted-foreground hidden md:table-cell">{getTeamName(r.teamId) || getTeamForDriver(r.driverId) || '-'}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs hidden md:table-cell">{r.totalTime || '-'}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs hidden lg:table-cell">{r.bestLap || '-'}</td>
                        <td className="py-2.5 pr-3">
                          <span className={cn('text-xs px-1.5 py-0.5 rounded', r.status === 'Finished' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>{r.status}</span>
                        </td>
                        <td className="py-2.5 text-right font-bold">{r.points ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-56 mb-8" style={{ background: getCoverGradient(competition.id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="mb-2">
            <StatusBadge status={status} label={statusLabel} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">{field(competition, 'name')}</h1>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {(activeTab === 'results' || activeTab === 'standings') ? (
        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'results' ? renderResultsTab() : renderStandingsTab()}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'info' ? renderInfoTab() : renderScheduleTab()}
          </div>
          <div className="space-y-4">
            <div className="sticky top-20">{renderSidebar()}</div>
          </div>
        </div>
      )}

      {showRulesDialog && sidebarRound && (
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
                {t('common.cancel')}
              </button>
              <button type="button" disabled={!rulesChecked} onClick={() => { register(sidebarRound); setShowRulesDialog(false); setRulesChecked(false) }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {t('eventDetail.registerNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CollapsibleSection({ title, defaultOpen = false, icon, children }: { title: string; defaultOpen?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors">
        <span className="flex items-center gap-2 font-bold">{icon}{title}</span>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}
