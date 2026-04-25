import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { gamePlatformColors, gamePlatforms, type GamePlatform } from '@/domain/gamePlatforms'
import { cn } from '@/lib/utils'
import { filterEvents, getEventsForDate, sortEventsByStartAsc, type SimEvent } from '@/domain/events'
import { useLocale } from '@/hooks/useLocale'
import { useEventList } from '@/features/calendar/hooks'
import { CalendarDays, ChevronLeft, ChevronRight, List, Grid3X3 } from 'lucide-react'

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_ZH = ['日', '一', '二', '三', '四', '五', '六']

const getStartOfWeek = (date: Date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function CalendarPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const { isZh, field, text, date: formatDate, time } = useLocale()
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1))
  const [gameFilter, setGameFilter] = useState<GamePlatform[]>([])
  const [myEventsOnly, setMyEventsOnly] = useState(false)
  const allEvents = useEventList()

  const days = isZh ? DAYS_ZH : DAYS_EN

  const filteredEvents = useMemo(() => {
    return filterEvents(allEvents, {
      games: gameFilter,
      registeredOnly: myEventsOnly,
      userId: state.currentUser?.id,
    })
  }, [allEvents, gameFilter, myEventsOnly, state.currentUser])

  const getEventLink = (e: SimEvent) => {
    if (e.championshipId) {
      return `/championships/${e.championshipId}`
    }
    return `/events/${e.id}`
  }

  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysArray: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) daysArray.push(null)
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(i)
    return daysArray
  }

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate)
    return Array.from({ length: 7 }, (_, idx) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + idx))
  }, [currentDate])

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1))
  }

  const navigateWeek = (dir: number) => {
    const start = getStartOfWeek(currentDate)
    setCurrentDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + dir * 7))
  }

  const monthName = formatDate(currentDate, { year: 'numeric', month: 'long' })
  const weekRangeTitle = `${formatDate(weekDays[0], { month: 'short', day: 'numeric' })} - ${formatDate(weekDays[6], { month: 'short', day: 'numeric', year: 'numeric' })}`

  const toggleGame = (game: GamePlatform) => {
    setGameFilter(prev => prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('calendar.title')}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            title={t('calendar.month')}
            aria-label={t('calendar.month')}
            aria-pressed={viewMode === 'month'}
            className={cn('px-3 py-1.5 rounded-lg text-sm', viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground')}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('week')}
            title={t('calendar.week')}
            aria-label={t('calendar.week')}
            aria-pressed={viewMode === 'week'}
            className={cn('px-3 py-1.5 rounded-lg text-sm', viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground')}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title={t('calendar.list')}
            aria-label={t('calendar.list')}
            aria-pressed={viewMode === 'list'}
            className={cn('px-3 py-1.5 rounded-lg text-sm', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {gamePlatforms.map(g => (
          <button
            key={g}
            onClick={() => toggleGame(g)}
            className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              gameFilter.includes(g) ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {g}
          </button>
        ))}
        {state.isLoggedIn && (
          <button
            onClick={() => setMyEventsOnly(!myEventsOnly)}
            className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              myEventsOnly ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {t('calendar.myEventsOnly')}
          </button>
        )}
      </div>

      {viewMode === 'month' ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-accent rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold">{monthName}</h2>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-accent rounded-lg"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-7">
              {days.map(d => (
                <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground border-b border-border">{d}</div>
              ))}
              {getCalendarDays().map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="min-h-24 border-b border-r border-border p-1" />
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayEvents = getEventsForDate(filteredEvents, date)
                const isToday = new Date().toDateString() === date.toDateString()
                return (
                  <div key={day} className={cn('min-h-24 border-b border-r border-border p-1', isToday && 'bg-primary/5')}>
                    <div className={cn('text-xs font-medium mb-1 px-1', isToday && 'text-primary font-bold')}>{day}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <Link
                          key={e.id}
                          to={getEventLink(e)}
                          className={cn('block px-1.5 py-0.5 rounded text-[10px] text-white truncate hover:opacity-80', gamePlatformColors[e.game as keyof typeof gamePlatformColors] || 'bg-gray-500')}
                        >
                          {field(e, 'name')}
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : viewMode === 'week' ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-accent rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold">{weekRangeTitle}</h2>
            <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-accent rounded-lg"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border">
              {weekDays.map(date => {
                const dayEvents = sortEventsByStartAsc(getEventsForDate(filteredEvents, date))
                const isToday = new Date().toDateString() === date.toDateString()
                return (
                  <div key={date.toISOString()} className={cn('min-h-56 p-3', isToday && 'bg-primary/5')}>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground">{days[date.getDay()]}</div>
                        <div className={cn('text-lg font-bold', isToday && 'text-primary')}>{date.getDate()}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{formatDate(date, { month: 'short' })}</div>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.length === 0 ? (
                        <div className="rounded-lg border border-border/60 px-2 py-3 text-center text-xs text-muted-foreground">{text('暂无赛事', 'No events')}</div>
                      ) : (
                        dayEvents.map(e => (
                          <Link
                            key={e.id}
                            to={getEventLink(e)}
                            className="block rounded-lg border border-border/70 bg-background/40 p-2 hover:border-primary/40 transition-colors"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-primary">
                                {time(e.eventStartTime)}
                              </span>
                              <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] text-white', gamePlatformColors[e.game as keyof typeof gamePlatformColors] || 'bg-gray-500')}>{e.game}</span>
                            </div>
                            <div className="truncate text-xs font-medium">{field(e, 'name')}</div>
                            <div className="mt-1 truncate text-[10px] text-muted-foreground">{e.track}</div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {sortEventsByStartAsc(filteredEvents)
            .map(e => (
              <Link
                key={e.id}
                to={getEventLink(e)}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="w-16 text-center">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(e.eventStartTime, { weekday: 'short' })}
                  </div>
                  <div className="text-xl font-bold">{new Date(e.eventStartTime).getDate()}</div>
                </div>
                <div className={cn('w-1 h-10 rounded-full', gamePlatformColors[e.game as keyof typeof gamePlatformColors] || 'bg-gray-500')} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{field(e, 'name')}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{e.track}</span>
                    <span>·</span>
                    <span>{e.carClass}</span>
                    {e.championshipId && (
                      <>
                        <span>·</span>
                        <span className="text-primary">{text('锦标赛', 'Championship')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{time(e.eventStartTime)}</div>
                  <div className={cn('px-1.5 py-0.5 rounded text-[10px] text-white mt-1', gamePlatformColors[e.game as keyof typeof gamePlatformColors] || 'bg-gray-500')}>{e.game}</div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
