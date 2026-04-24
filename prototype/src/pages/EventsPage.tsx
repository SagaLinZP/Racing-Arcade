import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { EventCard, ChampionshipCard } from '@/components/EventCard'
import { events } from '@/data/events'
import { championships } from '@/data/championships'
import { getEventStatus } from '@/lib/utils'

const REGISTERABLE_STATUSES = ['RegistrationOpen', 'RegistrationClosed']

type ListItem =
  | { type: 'event'; data: typeof events[number] }
  | { type: 'championship'; data: typeof championships[number]; eventCount: number; nextEvent?: typeof events[number]; nextRegistrationStatus?: string }

export function EventsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language

  const { registerable, completed } = useMemo(() => {
    const regItems: ListItem[] = []
    const compItems: ListItem[] = []

    const standalone = events.filter(e => !e.championshipId)
    for (const e of standalone) {
      const s = getEventStatus(e)
      if (REGISTERABLE_STATUSES.includes(s)) {
        regItems.push({ type: 'event', data: e })
      } else if (s === 'Completed') {
        compItems.push({ type: 'event', data: e })
      }
    }

    for (const ch of championships) {
      const subEvents = events.filter(e => e.championshipId === ch.id)
      const eventCount = subEvents.length

      const regEvents = subEvents
        .filter(e => REGISTERABLE_STATUSES.includes(getEventStatus(e)))
        .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())

      const hasCompleted = subEvents.some(e => getEventStatus(e) === 'Completed')

      if (regEvents.length > 0) {
        regItems.push({
          type: 'championship',
          data: ch,
          eventCount,
          nextEvent: regEvents[0],
          nextRegistrationStatus: getEventStatus(regEvents[0]),
        })
      }

      if (hasCompleted && regEvents.length === 0) {
        compItems.push({
          type: 'championship',
          data: ch,
          eventCount,
        })
      }
    }

    regItems.sort((a, b) => {
      const aTime = a.type === 'event' ? a.data.registrationOpenAt : events.filter(e => e.championshipId === a.data.id && REGISTERABLE_STATUSES.includes(getEventStatus(e)))[0]?.registrationOpenAt || ''
      const bTime = b.type === 'event' ? b.data.registrationOpenAt : events.filter(e => e.championshipId === b.data.id && REGISTERABLE_STATUSES.includes(getEventStatus(e)))[0]?.registrationOpenAt || ''
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    compItems.sort((a, b) => {
      const aTime = a.type === 'event' ? a.data.eventStartTime : events.filter(e => e.championshipId === a.data.id).sort((x, y) => new Date(y.eventStartTime).getTime() - new Date(x.eventStartTime).getTime())[0]?.eventStartTime || ''
      const bTime = b.type === 'event' ? b.data.eventStartTime : events.filter(e => e.championshipId === b.data.id).sort((x, y) => new Date(y.eventStartTime).getTime() - new Date(x.eventStartTime).getTime())[0]?.eventStartTime || ''
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return { registerable: regItems, completed: compItems }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t('events.title')}</h1>

      {registerable.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">{lang === 'zh' ? '报名中' : 'Open for Registration'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registerable.map(item =>
              item.type === 'event' ? (
                <EventCard key={item.data.id} event={item.data} />
              ) : (
                <ChampionshipCard
                  key={item.data.id}
                  championship={item.data}
                  eventCount={item.eventCount}
                  nextEvent={item.nextEvent}
                  nextRegistrationStatus={item.nextRegistrationStatus}
                />
              )
            )}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">{lang === 'zh' ? '已结束赛事' : 'Completed Events'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(item =>
              item.type === 'event' ? (
                <EventCard key={item.data.id} event={item.data} />
              ) : (
                <ChampionshipCard
                  key={item.data.id}
                  championship={item.data}
                  eventCount={item.eventCount}
                />
              )
            )}
          </div>
        </section>
      )}

      {registerable.length === 0 && completed.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>{t('common.noData')}</p>
        </div>
      )}
    </div>
  )
}
