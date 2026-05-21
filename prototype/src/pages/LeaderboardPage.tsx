import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDriverList } from '@/features/profile/hooks'
import { cn } from '@/lib/utils'
import { Dropdown } from '@/components/Dropdown'
import { gamePlatforms } from '@/domain/gamePlatforms'
import { Trophy, Medal, Flag, BarChart3 } from 'lucide-react'
import type { Driver } from '@/domain/drivers'

type TabType = 'points' | 'wins' | 'entries' | 'podiums'

export function LeaderboardPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('points')
  const [timeFilter, setTimeFilter] = useState<string>('allTime')
  const [gameFilter, setGameFilter] = useState<string>('all')
  const drivers = useDriverList()

  const tabs: { key: TabType; label: string; icon: typeof Trophy }[] = [
    { key: 'points', label: t('leaderboard.totalPoints'), icon: Trophy },
    { key: 'wins', label: t('leaderboard.wins'), icon: Medal },
    { key: 'entries', label: t('leaderboard.entries'), icon: Flag },
    { key: 'podiums', label: t('leaderboard.podiums'), icon: BarChart3 },
  ]

  const sorted = useMemo(() => {
    const result = [...drivers]
    const key = activeTab === 'points' ? 'totalPoints' : activeTab
    result.sort((a, b) => (b[key as keyof typeof b] as number) - (a[key as keyof typeof a] as number))
    return result
  }, [activeTab, drivers])

  const getValue = (d: Driver) => {
    switch (activeTab) {
      case 'points': return d.totalPoints
      case 'wins': return d.wins
      case 'entries': return d.totalEntries
      case 'podiums': return d.podiums
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('leaderboard.title')}</h1>

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

      <div className="flex items-center gap-2 mb-6">
        <Dropdown
          value={timeFilter}
          onChange={setTimeFilter}
          options={[
            { value: 'allTime', label: t('leaderboard.allTime') },
            { value: 'season', label: t('leaderboard.season') },
          ]}
        />
        <Dropdown
          value={gameFilter}
          onChange={setGameFilter}
          options={[
            { value: 'all', label: t('events.filters.allGames') },
            ...gamePlatforms.map(g => ({ value: g, label: g })),
          ]}
        />
      </div>

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
            {sorted.map((d, i) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-accent/50">
                <td className="py-3 px-4">
                  <span className={cn('font-bold',
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                  )}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/driver/${d.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">{d.nickname[0]}</div>
                    <span className="font-medium">{d.nickname}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-right font-bold">{getValue(d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
