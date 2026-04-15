import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { teams } from '@/data/teams'
import { drivers } from '@/data/drivers'
import { cn } from '@/lib/utils'
import { Crown, Flag, Trophy, Users } from 'lucide-react'

export function TeamPublicPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const team = teams.find(tm => tm.id === id)

  if (!team) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const captain = drivers.find(d => d.id === team.captainId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
        <div className="px-6 pb-6 -mt-8">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl border-4 border-card flex items-center justify-center text-primary text-2xl font-bold">
              {team.name[0]}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Flag className="w-4 h-4" />
                <span>{team.region}</span>
                {captain && (
                  <>
                    <span>·</span>
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span>{captain.nickname}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{team.description}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> {t('team.stats')}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-accent rounded-lg p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('leaderboard.entries')}</div>
            <div className="text-2xl font-bold">{team.totalEntries}</div>
          </div>
          <div className="bg-accent rounded-lg p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('team.bestResult')}</div>
            <div className="text-2xl font-bold">P{team.bestResult}</div>
          </div>
          <div className="bg-accent rounded-lg p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('leaderboard.totalPoints')}</div>
            <div className="text-2xl font-bold">{team.totalPoints}</div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> {t('team.members')}
        </h2>
        <div className="space-y-2">
          {team.members.map(m => {
            const driver = drivers.find(d => d.id === m.userId)
            if (!driver) return null
            return (
              <Link
                key={m.userId}
                to={`/driver/${m.userId}`}
                className="flex items-center gap-3 p-3 bg-accent rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                  {driver.nickname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{driver.nickname}</span>
                    {m.role === 'captain' && <Crown className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t(`team.${m.role}`)} · {driver.country}
                    <span className="ml-2">{driver.totalEntries} {t('leaderboard.entries')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{t('leaderboard.totalPoints')}</div>
                  <div className="text-sm font-bold">{driver.totalPoints}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
