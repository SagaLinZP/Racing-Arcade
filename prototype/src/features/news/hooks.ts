import { newsRepository, type NewsListFilters } from '@/data/repositories'

export function useNewsList(filters: NewsListFilters = {}) {
  return newsRepository.list(filters)
}

export function useNewsArticle(articleId?: string) {
  return newsRepository.getById(articleId)
}
