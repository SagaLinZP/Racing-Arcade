import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { championships } from '@/data/championships'
import { events } from '@/data/events'
import { drivers } from '@/data/drivers'
import { teams } from '@/data/teams'
import { EventCard } from '@/components/EventCard'
import { getCoverGradient } from '@/data/events'
import { Trophy, Flag } from 'lucide-react'

export function ChampionshipDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language

  const championship = championships.find(c => c.id === id)
  if (!championship) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const chEvents = events.filter(e => championship.eventIds.includes(e.id))
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8" style={{ background: getCoverGradient(championship.id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">{lang === 'zh' ? '锦标赛' : 'Championship'}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">
            {lang === 'zh' ? championship.name_zh : championship.name_en}
          </h1>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3">{t('championships.description')}</h2>
            <p className="text-sm text-muted-foreground">{lang === 'zh' ? championship.description_zh : championship.description_en}</p>
          </div>

          {/* Scoring Rules */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-3">{t('championships.schedule')} - {t('eventDetail.scoring')}</h2>
            <p className="text-sm text-muted-foreground">{lang === 'zh' ? championship.scoringRules_zh : championship.scoringRules_en}</p>
          </div>

          {/* Events */}
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
