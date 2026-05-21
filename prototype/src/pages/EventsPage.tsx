import { useTranslation } from 'react-i18next'
import { useLocale } from '@/hooks/useLocale'
import { EventCard, ChampionshipCard } from '@/components/EventCard'
import { useEventListSections } from '@/features/events/hooks'

export function EventsPage() {
  const { t } = useTranslation()
  const { text } = useLocale()

  const { registerable, completed } = useEventListSections()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t('events.title')}</h1>

      {registerable.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">{text('报名中', 'Open for Registration')}</h2>
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
          <h2 className="text-lg font-bold mb-4">{text('已结束赛事', 'Completed Events')}</h2>
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
