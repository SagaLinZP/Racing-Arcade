import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { useLocale } from '@/hooks/useLocale'
import { useDriverProfile } from '@/features/profile/hooks'
import { cn } from '@/lib/utils'
import { Trophy, Flag, Target, Zap, Users, Edit, Monitor } from 'lucide-react'

export function DriverPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const { field } = useLocale()

  const { driver, team, competitionsEntered, results, standings, devices } = useDriverProfile(id)
  if (!driver) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const isSelf = state.currentUser?.id === driver.id

  const totalPoints = standings?.totalPoints ?? driver.totalPoints
  const wins = standings?.wins ?? driver.wins
  const podiums = standings?.podiums ?? driver.podiums
  const totalEntries = standings?.entries ?? driver.totalEntries

  const stats = [
    { icon: Flag, label: t('driver.totalEntries'), value: totalEntries },
    { icon: Trophy, label: t('driver.wins'), value: wins },
    { icon: Target, label: t('driver.podiums'), value: podiums },
    { icon: Zap, label: t('driver.totalPoints'), value: totalPoints },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-3xl font-bold flex-shrink-0">
            {driver.nickname[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{driver.nickname}</h1>
              {isSelf && (
                <Link to="/settings" className="flex items-center gap-1 px-3 py-1 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/10">
                  <Edit className="w-3 h-3" /> {t('driver.editProfile')}
                </Link>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{driver.country}</div>
            <p className="text-sm text-muted-foreground mt-2">{field(driver, 'bio')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {team && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{t('driver.team')}</h2>
          <Link to={`/team/${team.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">{team.name[0]}</div>
            <div>
              <div className="font-medium">{team.name}</div>
              <div className="text-xs text-muted-foreground">{team.members.length} members</div>
            </div>
          </Link>
        </div>
      )}

      {driver.showDevices && driver.displayedDeviceIds.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" />{t('driver.mozaDevices')}</h2>
          <div className="flex flex-wrap gap-2">
            {devices.map(device => (
              <span key={device.id} className="px-3 py-1.5 bg-accent rounded-lg text-sm flex items-center gap-1.5">
                <span>{device.icon}</span> {device.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4">{t('driver.history')}</h2>
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((r, i) => (
              <Link
                key={i}
                to={`/events/${r.competitionId}/rounds/${r.roundId}`}
                className="flex items-center justify-between px-4 py-3 bg-accent rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('w-8 text-center font-bold flex-shrink-0',
                    r.position === 1 ? 'text-yellow-400' : r.position === 2 ? 'text-gray-300' : r.position === 3 ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    P{r.position}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{field({ name_zh: r.competitionName_zh, name_en: r.competitionName_en }, 'name')}</div>
                    <div className="text-xs text-muted-foreground truncate">{field({ name_zh: r.roundName_zh, name_en: r.roundName_en }, 'name')}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="text-sm font-bold">{r.points} pts</div>
                  {r.bestLap && <div className="text-xs text-muted-foreground">{r.bestLap}</div>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {competitionsEntered.length > 0 ? (
              <div className="space-y-2">
                {competitionsEntered.map(ce => (
                  <Link
                    key={ce.competition.id}
                    to={`/events/${ce.competition.id}`}
                    className="flex items-center justify-between px-4 py-3 bg-accent rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <div className="text-sm font-medium truncate">{field(ce.competition, 'name')}</div>
                    <span className="text-xs text-muted-foreground">{ce.rounds.length} {t('competition.rounds', 'rounds')}</span>
                  </Link>
                ))}
              </div>
            ) : (
              t('common.noData')
            )}
          </div>
        )}
      </div>
    </div>
  )
}
