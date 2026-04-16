import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { news } from '@/data/news'
import { getCoverGradient } from '@/data/events'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

export function NewsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const [category, setCategory] = useState<'all' | 'event' | 'platform' | 'review' | 'other'>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  const filtered = news.filter(n => {
    if (category !== 'all' && n.category !== category) return false
    if (regionFilter !== 'all' && !(n.regions || []).includes(regionFilter)) return false
    return true
  })

  const categoryColors: Record<string, string> = {
    event: 'bg-blue-500/10 text-blue-400',
    platform: 'bg-green-500/10 text-green-400',
    review: 'bg-purple-500/10 text-purple-400',
    other: 'bg-gray-500/10 text-gray-400',
  }

  const tabs: Array<{ key: typeof category; label: string }> = [
    { key: 'all', label: t('events.filters.all') },
    { key: 'event', label: t('news.categories.event') },
    { key: 'platform', label: t('news.categories.platform') },
    { key: 'review', label: t('news.categories.review') },
    { key: 'other', label: t('news.categories.other') },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t('news.title')}</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              category === key ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
        <div className="border-l border-border mx-2" />
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          className="px-3 py-1 bg-accent border border-border rounded-lg text-sm"
        >
          <option value="all">{t('events.filters.allRegions')}</option>
          <option value="CN">{t('region.CN')}</option>
          <option value="AP">{t('region.AP')}</option>
          <option value="AM">{t('region.AM')}</option>
          <option value="EU">{t('region.EU')}</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(n => (
          <Link
            key={n.id}
            to={`/news/${n.id}`}
            className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
          >
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-lg flex-shrink-0"
              style={{ background: getCoverGradient(n.id) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', categoryColors[n.category])}>
                  {t(`news.categories.${n.category}`)}
                </span>
                {n.isPinned && <Zap className="w-3 h-3 text-yellow-400" />}
              </div>
              <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2">
                {lang === 'zh' ? n.title_zh : n.title_en}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {lang === 'zh' ? n.content_zh : n.content_en}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{n.author}</span>
                <span>·</span>
                <span>{new Date(n.publishedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
