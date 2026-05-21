import { news, type NewsArticle } from '@/data/news'
import type { Region } from '@/domain/common'

export interface NewsListFilters {
  ids?: readonly string[]
  region?: Region
  limit?: number
}

export const newsRepository = {
  list(filters: NewsListFilters = {}): NewsArticle[] {
    const { ids, region, limit } = filters
    let result = news

    if (ids) {
      const idSet = new Set(ids)
      result = result.filter(article => idSet.has(article.id))
    }

    if (region) {
      result = result.filter(article => article.regions.includes(region))
    }

    return typeof limit === 'number' ? result.slice(0, limit) : result
  },

  getById(id?: string) {
    if (!id) return undefined
    return news.find(article => article.id === id)
  },
}
