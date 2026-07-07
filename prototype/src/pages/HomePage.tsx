import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/hooks/useLocale'
import { CompetitionCard } from '@/components/CompetitionCard'
import { useHomeCompetitionHighlights, useCompetitionList } from '@/features/competitions/hooks'
import { ChevronRight, Radio } from 'lucide-react'
import { getCompetitionStatus } from '@/domain/status'

export function HomePage() {
  const { t } = useTranslation()
  const { text } = useLocale()

  const competitions = useCompetitionList()
  const liveCompetitions = competitions.filter(c => getCompetitionStatus(c) === 'InProgress')
  const mixedItems = useHomeCompetitionHighlights()

  return (
    <div className="space-y-16 pb-16">
      <section className="max-w-7xl mx-auto px-4 pt-12">
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #9f1239 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl">
            <span className="text-primary text-sm font-semibold mb-2 tracking-wider uppercase">MOZA Racing Official</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              {text('2026 赛季正式开启', '2026 Season is Here')}
            </h1>
            <p className="text-white/70 text-sm md:text-base mb-6">
              {text('加入全球最精彩的模拟赛车赛事，展示你的竞速实力', 'Join the most exciting sim racing events and showcase your racing skills')}
            </p>
            <Link to="/events" className="self-start px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              {t('home.viewAllEvents')}
            </Link>
          </div>
        </div>
      </section>

      {liveCompetitions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-xl font-bold">{t('home.liveNow')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mixedItems
              .filter(item => getCompetitionStatus(item.competition) === 'InProgress')
              .map(item => <CompetitionCard key={item.competition.id} item={item} />)}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t('home.upcomingEvents')}</h2>
          <Link to="/events" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('home.viewAllEvents')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mixedItems.map(item => (
            <CompetitionCard key={item.competition.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
