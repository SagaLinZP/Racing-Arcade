import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/hooks/useLocale'
import { useNewsArticle } from '@/features/news/hooks'
import { useEventList } from '@/features/events/hooks'
import { getCoverGradient } from '@/shared/utils/eventVisuals'
import { cn } from '@/lib/utils'

export function NewsDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { field, date } = useLocale()
  const article = useNewsArticle(id)
  const events = useEventList()

  if (!article) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const title = field(article, 'title')
  const content = field(article, 'content')

  const categoryColors: Record<string, string> = {
    event: 'bg-blue-500/10 text-blue-400',
    platform: 'bg-green-500/10 text-green-400',
    review: 'bg-purple-500/10 text-purple-400',
    other: 'bg-gray-500/10 text-gray-400',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
        &larr; {t('common.back')}
      </Link>

      <article>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', categoryColors[article.category])}>
              {t(`news.categories.${article.category}`)}
            </span>
            <span className="text-xs text-muted-foreground">
              {date(article.publishedAt, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2">{title}</h1>
          <div className="text-sm text-muted-foreground">{t('news.publishedAt')}: {article.author}</div>
        </div>

        <div
          className="w-full h-48 md:h-64 rounded-xl mb-8"
          style={{ background: getCoverGradient(article.id) }}
        />

        <div className="text-sm md:text-base leading-relaxed whitespace-pre-line mb-8">
          {content}
        </div>

        {article.relatedEventIds && article.relatedEventIds.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="font-bold mb-3">{t('news.relatedEvents')}</h3>
            <div className="space-y-2">
              {article.relatedEventIds.map(eId => {
                const event = events.find(e => e.id === eId)
                if (!event) return null
                return (
                  <Link
                    key={eId}
                    to={`/events/${eId}`}
                    className="flex items-center gap-3 p-3 bg-accent rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-sm font-medium">{field(event, 'name')}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{event.track}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
