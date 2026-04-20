import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { EventCard, ChampionshipCard } from '@/components/EventCard'
import { events, type SimEvent } from '@/data/events'
import { championships, type Championship } from '@/data/championships'
import { cn, getEventStatus } from '@/lib/utils'
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'

type ListItem =
  | { type: 'event'; data: SimEvent }
  | { type: 'championship'; data: Championship; eventCount: number; nextEventTime?: string; nextRegistrationStatus?: string }

const gameOptions = ['AC', 'ACC', 'AC Evo', 'iRacing', 'LMU', 'F1 25']
const carClassOptions = ['GT3', 'GT4', 'Formula']
const timeOptions = [['thisWeek', 'events.filters.thisWeek'], ['thisMonth', 'events.filters.thisMonth'], ['allFuture', 'events.filters.allFuture']] as const

export function EventsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const [gameFilter, setGameFilter] = useState<string[]>([])
  const [carClassFilter, setCarClassFilter] = useState<string[]>([])
  const [timeFilter, setTimeFilter] = useState<string>('allFuture')
  const [sortBy, setSortBy] = useState<string>('time')
  const [showFilters, setShowFilters] = useState(false)

  const items = useMemo<ListItem[]>(() => {
    const now = new Date()
    const standalone = events.filter(e => !e.championshipId)
    const eventItems: ListItem[] = standalone.map(e => ({ type: 'event' as const, data: e }))
    const champItems: ListItem[] = championships.map(ch => {
      const subEvents = events.filter(e => e.championshipId === ch.id)
      const futureEvents = subEvents
        .filter(e => new Date(e.eventStartTime) > now)
        .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())
      const nextEvent = futureEvents[0]
      return {
        type: 'championship' as const,
        data: ch,
        eventCount: subEvents.length,
        nextEventTime: nextEvent?.eventStartTime,
        nextRegistrationStatus: nextEvent ? getEventStatus(nextEvent) : undefined,
      }
    })
    return [...eventItems, ...champItems]
  }, [events, championships])

  const filtered = useMemo(() => {
    const now = new Date()
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    let result = items.filter(item => {
      if (item.type === 'event') {
        if (gameFilter.length > 0 && !gameFilter.includes(item.data.game)) return false
        if (carClassFilter.length > 0 && !carClassFilter.includes(item.data.carClass)) return false
        const start = new Date(item.data.eventStartTime)
        if (timeFilter === 'thisWeek' && start > weekLater) return false
        if (timeFilter === 'thisMonth' && start > monthLater) return false
      }
      if (item.type === 'championship') {
        if (gameFilter.length > 0 && !gameFilter.includes(item.data.game)) return false
        if (carClassFilter.length > 0 && !carClassFilter.includes(item.data.carClass)) return false
        if (item.nextEventTime) {
          const start = new Date(item.nextEventTime)
          if (timeFilter === 'thisWeek' && start > weekLater) return false
          if (timeFilter === 'thisMonth' && start > monthLater) return false
        }
      }
      return true
    })
    if (sortBy === 'popularity') {
      result.sort((a, b) => {
        const aPop = a.type === 'event' ? a.data.currentRegistrations : events.filter(e => e.championshipId === a.data.id).reduce((s, e) => s + e.currentRegistrations, 0)
        const bPop = b.type === 'event' ? b.data.currentRegistrations : events.filter(e => e.championshipId === b.data.id).reduce((s, e) => s + e.currentRegistrations, 0)
        return bPop - aPop
      })
    } else if (sortBy === 'recent') {
      result.sort((a, b) => {
        const aTime = a.type === 'event' ? a.data.registrationCloseAt : (a.nextEventTime || '')
        const bTime = b.type === 'event' ? b.data.registrationCloseAt : (b.nextEventTime || '')
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
    } else {
      result.sort((a, b) => {
        const aTime = a.type === 'event' ? a.data.eventStartTime : (a.nextEventTime || a.data.id)
        const bTime = b.type === 'event' ? b.data.eventStartTime : (b.nextEventTime || b.data.id)
        return new Date(aTime).getTime() - new Date(bTime).getTime()
      })
    }
    return result
  }, [items, gameFilter, carClassFilter, timeFilter, events])

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('events.title')}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-3 py-2 bg-accent rounded-lg text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" /> {t('common.filter')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className={cn('md:w-64 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}>
          <div className="bg-card border border-border rounded-xl p-4 space-y-5 sticky top-20">
            <div>
              <h3 className="text-sm font-semibold mb-2">{t('events.filters.game')}</h3>
              <div className="space-y-1">
                {gameOptions.map(g => (
                  <button
                    key={g}
                    onClick={() => toggleFilter(gameFilter, setGameFilter, g)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                      gameFilter.includes(g) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">{t('events.filters.carClass')}</h3>
              <div className="space-y-1">
                {carClassOptions.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleFilter(carClassFilter, setCarClassFilter, c)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                      carClassFilter.includes(c) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">{t('events.filters.timeRange')}</h3>
              <div className="space-y-1">
                {timeOptions.map(([v, labelKey]) => (
                  <button
                    key={v}
                    onClick={() => setTimeFilter(v)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                      timeFilter === v ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{filtered.length} {state.language === 'zh' ? '项' : 'items'}</span>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              {[['time', t('events.sort.time')], ['popularity', t('events.sort.popularity')], ['recent', t('events.sort.recent')]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setSortBy(v)}
                  className={cn(
                    'px-3 py-1 rounded text-sm transition-colors',
                    sortBy === v ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(item =>
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
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>{t('common.noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
