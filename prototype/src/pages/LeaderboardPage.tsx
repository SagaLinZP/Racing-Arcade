import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDriverList } from '@/features/profile/hooks'
import { useCompetitionList } from '@/features/competitions/hooks'
import { cn } from '@/lib/utils'
import { Dropdown } from '@/components/Dropdown'
import { gamePlatforms, type GamePlatform } from '@/domain/gamePlatforms'
import { calculateCompetitionStandings, type DriverStanding } from '@/domain/results'
import { Trophy, Medal, Flag, BarChart3, Gamepad2 } from 'lucide-react'

type TabType = 'points' | 'wins' | 'entries' | 'podiums'
type TimeFilter = 'allTime' | 'thisYear' | 'thisMonth'

export function LeaderboardPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('points')
  const [game, setGame] = useState<GamePlatform | ''>('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('allTime')

  const drivers = useDriverList()
  const competitions = useCompetitionList()

  const standings = useMemo<DriverStanding[]>(() => {
    if (!game) return []
    const gameComps = competitions.filter(c => c.game === game)
    const merged = new Map<string, DriverStanding>()
    const now = new Date()
    for (const comp of gameComps) {
      const compStandings = calculateCompetitionStandings(comp)
      for (const s of compStandings) {
        const withinTime = (() => {
          if (timeFilter === 'allTime') return true
          if (timeFilter === 'thisYear') {
            return comp.rounds.some(r => r.stages.some(st =>
              st.splits.some(sp => sp.resultsLockedAt && new Date(sp.resultsLockedAt).getFullYear() === now.getFullYear()),
            ))
          }
          if (timeFilter === 'thisMonth') {
            return comp.rounds.some(r => r.stages.some(st =>
              st.splits.some(sp => sp.resultsLockedAt && new Date(sp.resultsLockedAt).getFullYear() === now.getFullYear() && new Date(sp.resultsLockedAt).getMonth() === now.getMonth()),
            ))
          }
          return true
        })()
        if (!withinTime) continue
        if (!merged.has(s.driverId)) {
          merged.set(s.driverId, { ...s, results: [...s.results] })
        } else {
          const acc = merged.get(s.driverId)!
          acc.totalPoints += s.totalPoints
          acc.wins += s.wins
          acc.podiums += s.podiums
          acc.entries += s.entries
          acc.bestPosition = Math.min(acc.bestPosition, s.bestPosition)
          acc.results.push(...s.results)
        }
      }
    }
    return Array.from(merged.values())
  }, [game, competitions, timeFilter])

  const sorted = useMemo(() => {
    const result = [...standings]
    const key: keyof DriverStanding = activeTab === 'points' ? 'totalPoints' : activeTab === 'wins' ? 'wins' : activeTab === 'entries' ? 'entries' : 'podiums'
    result.sort((a, b) => (b[key] as number) - (a[key] as number))
    return result
  }, [activeTab, standings])

  const getValue = (s: DriverStanding) => {
    switch (activeTab) {
      case 'points': return s.totalPoints
      case 'wins': return s.wins
      case 'entries': return s.entries
      case 'podiums': return s.podiums
    }
  }

  const tabs: { key: TabType; label: string; icon: typeof Trophy }[] = [
    { key: 'points', label: t('leaderboard.totalPoints'), icon: Trophy },
    { key: 'wins', label: t('leaderboard.wins'), icon: Medal },
    { key: 'entries', label: t('leaderboard.entries'), icon: Flag },
    { key: 'podiums', label: t('leaderboard.podiums'), icon: BarChart3 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('leaderboard.title')}</h1>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Dropdown
          value={game}
          onChange={v => setGame(v as GamePlatform | '')}
          options={[
            { value: '', label: t('events.filters.allGames') },
            ...gamePlatforms.map(g => ({ value: g, label: g })),
          ]}
        />
        <Dropdown
          value={timeFilter}
          onChange={v => setTimeFilter(v as TimeFilter)}
          options={[
            { value: 'allTime', label: t('leaderboard.allTime') },
            { value: 'thisYear', label: t('leaderboard.thisYear') },
            { value: 'thisMonth', label: t('leaderboard.thisMonth') },
          ]}
        />
      </div>

      {game ? (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {sorted.length > 0 ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-3 px-4 w-16">{t('leaderboard.rank')}</th>
                    <th className="text-left py-3 px-4">{t('leaderboard.driver')}</th>
                    <th className="text-right py-3 px-4">{t('leaderboard.value')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s, i) => {
                    const driver = drivers.find(d => d.id === s.driverId)
                    return (
                      <tr key={s.driverId} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="py-3 px-4">
                          <span className={cn('font-bold',
                            i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                          )}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link to={`/driver/${s.driverId}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">{driver?.nickname[0] ?? '?'}</div>
                            <span className="font-medium">{driver?.nickname ?? s.driverId}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right font-bold">{getValue(s)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>{t('common.noData')}</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>{t('leaderboard.selectGamePrompt')}</p>
        </div>
      )}
    </div>
  )
}
