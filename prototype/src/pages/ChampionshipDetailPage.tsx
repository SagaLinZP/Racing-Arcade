import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { championships } from '@/data/championships'
import { events } from '@/data/events'
import { drivers } from '@/data/drivers'
import { teams } from '@/data/teams'
import { EventCard } from '@/components/EventCard'
import { getCoverGradient } from '@/data/events'
import {
  Trophy, Flag, Cloud, Wrench, Clock, Users, Zap,
  Shield, Download, Play, Radio, ChevronRight, Info,
} from 'lucide-react'

export function ChampionshipDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language

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
  const getTeamForDriver = (driverId: string) => {
    const team = teams.find(t => t.members.some(m => m.userId === driverId))
    return team?.name || ''
  }

  const rules = lang === 'zh' ? ch.rules_zh : ch.rules_en
  const resources = lang === 'zh' ? ch.resources_zh : ch.resources_en
  const progression = lang === 'zh' ? ch.progressionRules_zh : ch.progressionRules_en

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8" style={{ background: getCoverGradient(ch.id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">{lang === 'zh' ? '锦标赛' : 'Championship'}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">
            {lang === 'zh' ? ch.name_zh : ch.name_en}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3">{t('championships.description')}</h2>
            <p className="text-sm text-muted-foreground">{lang === 'zh' ? ch.description_zh : ch.description_en}</p>
          </div>

          {/* Race Format */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-4">{t('championships.raceFormat')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Cloud className="w-4 h-4 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.weather')}</div><div className="text-sm font-medium">{ch.weather || '-'}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-primary" /></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.pitstop')}</div><div className="text-sm font-medium">{ch.hasPitstop ? (lang === 'zh' ? '需要' : 'Yes') : (lang === 'zh' ? '不需要' : 'No')}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center"><span className="text-primary text-lg">🎮</span></div>
                <div><div className="text-xs text-muted-foreground">{t('eventDetail.game')}</div><div className="text-sm font-medium">{ch.game}</div></div>
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

          {/* Split Configuration */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-4">{t('championships.splitConfig')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-accent rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">{t('championships.maxEntriesPerSplit')}</div>
                <div className="font-bold text-lg">{ch.maxEntriesPerSplit}</div>
              </div>
              {ch.maxSplits && (
                <div className="bg-accent rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">{t('championships.maxSplits')}</div>
                  <div className="font-bold text-lg">{ch.maxSplits}</div>
                </div>
              )}
              {ch.splitAssignmentRule && (
                <div className="bg-accent rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">{t('championships.splitRule')}</div>
                  <div className="font-bold text-sm">{ch.splitAssignmentRule}</div>
                </div>
              )}
              {ch.minEntries && (
                <div className="bg-accent rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">{t('championships.minEntries')}</div>
                  <div className="font-bold text-lg">{ch.minEntries}</div>
                </div>
              )}
            </div>
          </div>

          {/* Access Requirements */}
          {ch.accessRequirements && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{t('championships.accessRequirements')}</h2>
              <p className="text-sm text-muted-foreground">{ch.accessRequirements}</p>
            </div>
          )}

          {/* Cancel Registration Rule */}
          {ch.cancelRegistrationDeadlineOffset && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{t('championships.cancelRegistrationRule')}</h2>
              <p className="text-sm text-muted-foreground">{ch.cancelRegistrationDeadlineOffset}</p>
            </div>
          )}

          {/* Scoring Rules */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3">{t('eventDetail.scoring')}</h2>
            <p className="text-sm text-muted-foreground">{lang === 'zh' ? ch.scoringRules_zh : ch.scoringRules_en}</p>
          </div>

          {/* Progression Rules */}
          {progression && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3">{t('championships.progression')}</h2>
              <p className="text-sm text-muted-foreground">{progression}</p>
            </div>
          )}

          {/* Event Rules */}
          {rules && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3">{t('championships.rules')}</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-line">{rules}</div>
            </div>
          )}

          {/* Resources */}
          {resources && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Download className="w-4 h-4 text-primary" />{t('championships.resources')}</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-line">{resources}</div>
            </div>
          )}

          {/* Live Stream */}
          {ch.streamUrl && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Radio className="w-4 h-4 text-red-500" />{t('championships.liveStream')}</h2>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <Play className="w-12 h-12 text-white/50" />
              </div>
            </div>
          )}

          {/* Events Schedule */}
          <div>
            <h2 className="font-bold mb-4">{t('championships.schedule')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chEvents.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        </div>

        {/* Sidebar - Standings */}
        <div>
          <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" />{t('championships.standings')}</h2>
            {standings.length > 0 ? (
              <div className="space-y-2">
                {standings.map(([driverId, points], idx) => (
                  <Link
                    key={driverId}
                    to={`/driver/${driverId}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{getDriverName(driverId)}</div>
                      <div className="text-xs text-muted-foreground">{getTeamForDriver(driverId)}</div>
                    </div>
                    <span className="font-bold text-sm">{points}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('common.noData')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
