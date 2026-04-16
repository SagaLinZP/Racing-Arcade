import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { EventCard, ChampionshipCard } from '@/components/EventCard'
import { events } from '@/data/events'
import { drivers } from '@/data/drivers'
import { championships } from '@/data/championships'
import { news } from '@/data/news'
import { ChevronRight, Radio, Zap } from 'lucide-react'
import { getCoverGradient } from '@/data/events'

type MixedItem =
  | { type: 'event'; data: typeof events[number] }
  | { type: 'championship'; data: typeof championships[number]; eventCount: number; nextEventTime?: string; nextRegistrationStatus?: string }

export function HomePage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language

  const standaloneEvents = events.filter(e => !e.championshipId)
  const liveEvents = standaloneEvents.filter(e => e.status === 'InProgress')
  const topDrivers = [...drivers].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5)
  const recentNews = news.filter(n => n.regions.includes(state.currentRegion) || n.regions.length === 4).slice(0, 3)

  const mixedItems: MixedItem[] = []

  const regOpenStandalone = standaloneEvents.filter(e => e.status === 'RegistrationOpen').map(e => ({
    type: 'event' as const,
    data: e,
    sortTime: new Date(e.eventStartTime).getTime(),
  }))

  const champItems = championships.map(ch => {
    const champEvents = events.filter(e => e.championshipId === ch.id)
    const eventCount = champEvents.length
    const futureEvents = champEvents
      .filter(e => new Date(e.eventStartTime).getTime() > Date.now())
      .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())
    const nextEvent = futureEvents[0]
    return {
      type: 'championship' as const,
      data: ch,
      eventCount,
      nextEventTime: nextEvent?.eventStartTime,
      nextRegistrationStatus: nextEvent?.status,
      sortTime: nextEvent ? new Date(nextEvent.eventStartTime).getTime() : Infinity,
    }
  })

  mixedItems.push(
    ...[...regOpenStandalone, ...champItems]
      .sort((a, b) => a.sortTime - b.sortTime)
      .slice(0, 6)
  )

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-16">
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #9f1239 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl">
              <span className="text-primary text-sm font-semibold mb-2 tracking-wider uppercase">MOZA Racing Official</span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                {lang === 'zh' ? '2026 赛季正式开启' : '2026 Season is Here'}
              </h1>
              <p className="text-white/70 text-sm md:text-base mb-6">
                {lang === 'zh'
                  ? '加入全球最精彩的模拟赛车赛事，展示你的竞速实力'
                  : 'Join the most exciting sim racing events and showcase your racing skills'}
              </p>
              <div className="flex gap-3">
                <Link to="/events" className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {t('home.viewAllEvents')}
                </Link>
                <Link to="/championships" className="px-6 py-2.5 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors backdrop-blur">
                  {t('home.viewAllChampionships')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Now */}
      {liveEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-xl font-bold">{t('home.liveNow')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* Upcoming Events + Championships mixed */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t('home.upcomingEvents')}</h2>
          <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('home.viewAllEvents')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mixedItems.map(item =>
            item.type === 'event' ? (
              <EventCard key={item.data.id} event={item.data} />
            ) : (
              <ChampionshipCard
                key={item.data.id}
                championship={item.data}
                eventCount={item.eventCount}
                nextEventTime={item.nextEventTime}
                nextRegistrationStatus={item.nextRegistrationStatus}
              />
            )
          )}
        </div>
      </section>

      {/* News + Leaderboard */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* News */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('home.latestNews')}</h2>
              <Link to="/news" className="text-sm text-primary hover:underline flex items-center gap-1">
                {t('home.viewAllNews')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentNews.map(n => (
                <Link
                  key={n.id}
                  to={`/news/${n.id}`}
                  className="flex gap-4 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors group"
                >
                  <div className="w-24 h-16 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background: getCoverGradient(n.id) }}>
                    <Zap className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {lang === 'zh' ? n.title_zh : n.title_en}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {lang === 'zh' ? n.content_zh : n.content_en}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span className="px-1.5 py-0.5 bg-accent rounded">{t(`news.categories.${n.category}`)}</span>
                      <span>{new Date(n.publishedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('home.leaderboardPreview')}</h2>
              <Link to="/leaderboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                {t('common.viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {topDrivers.map((d, i) => (
                <Link
                  key={d.id}
                  to={`/driver/${d.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-0"
                >
                  <span className={`w-7 text-center font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                    {d.nickname[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{d.nickname}</div>
                    <div className="text-xs text-muted-foreground">{d.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{d.totalPoints}</div>
                    <div className="text-xs text-muted-foreground">{t('driver.totalPoints')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <h2 className="text-xl font-bold mb-2">{t('home.partner')}</h2>
          <p className="text-muted-foreground text-sm">{t('home.partnerDesc')}</p>
        </div>
      </section>
    </div>
  )
}
