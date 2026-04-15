import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { EventCard } from '@/components/EventCard'
import { events } from '@/data/events'
import { cn } from '@/lib/utils'
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'

const gameOptions = ['ACC PC', 'ACC Crossplay', 'AC Evo PC', 'iRacing PC', 'LMU PC', 'AMS2 PC']
const statusOptions = ['RegistrationOpen', 'Pending', 'RegistrationClosed', 'InProgress', 'Completed', 'Cancelled']
const carClassOptions = ['GT3', 'GT4', 'Porsche Cup', 'LMP2', 'Formula', 'GTE', 'TCR']

export function EventsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const [gameFilter, setGameFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [carClassFilter, setCarClassFilter] = useState<string[]>([])
  const [regionFilter, setRegionFilter] = useState<string>('current')
  const [timeFilter, setTimeFilter] = useState<string>('allFuture')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('time')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = events.filter(e => {
      if (regionFilter === 'current' && !e.regions.includes(state.currentRegion)) return false
      if (gameFilter.length > 0 && !gameFilter.includes(e.game)) return false
      if (statusFilter.length > 0 && !statusFilter.includes(e.status)) return false
      if (carClassFilter.length > 0 && !carClassFilter.includes(e.carClass)) return false
      if (typeFilter === 'standalone' && e.championshipId) return false
      if (typeFilter === 'championship' && !e.championshipId) return false
      return true
    })
    if (sortBy === 'popularity') result.sort((a, b) => b.currentRegistrations - a.currentRegistrations)
    else if (sortBy === 'recent') result.sort((a, b) => new Date(b.registrationOpenAt).getTime() - new Date(a.registrationOpenAt).getTime())
    else result.sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())
    return result
  }, [events, gameFilter, statusFilter, carClassFilter, regionFilter, typeFilter, sortBy, state.currentRegion])

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
        {/* Filters Sidebar */}
        <div className={cn('md:w-64 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}>
          <div className="bg-card border border-border rounded-xl p-4 space-y-5 sticky top-20">
            {/* Game Platform */}
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

            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold mb-2">{t('events.filters.status')}</h3>
              <div className="space-y-1">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleFilter(statusFilter, setStatusFilter, s)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                      statusFilter.includes(s) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {t(`eventDetail.statusNames.${s}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Car Class */}
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

            {/* Region */}
            <div>
              <h3 className="text-sm font-semibold mb-2">{t('events.filters.region')}</h3>
              <div className="space-y-1">
                {[['current', t('events.filters.currentRegion')], ['all', t('events.filters.allRegions')]].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setRegionFilter(v)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                      regionFilter === v ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <h3 className="text-sm font-semibold mb-2">{t('events.filters.type')}</h3>
              <div className="space-y-1">
                {[['all', t('events.filters.all')], ['standalone', t('events.filters.standalone')], ['championship', t('events.filters.championship')]].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setTypeFilter(v)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded text-sm transition-colors',
                      typeFilter === v ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{filtered.length} events</span>
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

          {/* Event Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(e => <EventCard key={e.id} event={e} />)}
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
