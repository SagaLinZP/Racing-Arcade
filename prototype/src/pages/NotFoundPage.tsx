import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'

export function NotFoundPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const isZh = state.language === 'zh'

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="text-sm font-semibold text-primary mb-2">404</div>
        <h1 className="text-2xl font-bold mb-3">
          {isZh ? '页面不存在' : 'Page not found'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isZh ? '这个链接没有匹配到 Racing Arcade 的页面。' : 'This link does not match a Racing Arcade page.'}
        </p>
        <Link
          to="/"
          className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {t('common.back')}
        </Link>
      </div>
    </div>
  )
}
