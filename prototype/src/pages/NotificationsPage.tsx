import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/hooks/useLocale'
import { useNotificationList } from '@/features/notifications/hooks'
import { cn } from '@/lib/utils'
import { Bell, CheckCheck, Flag, XCircle, Trophy, Shield, AlertTriangle, Users, Clock } from 'lucide-react'

const typeIcons: Record<string, typeof Bell> = {
  registration: Flag,
  cancellation: XCircle,
  results: Trophy,
  protest: Shield,
  penalty: AlertTriangle,
  team: Users,
  waitlist: Clock,
  system: Bell,
}

export function NotificationsPage() {
  const { t } = useTranslation()
  const { field, dateTime } = useLocale()
  const notifications = useNotificationList()
  const [items, setItems] = useState(notifications)

  const markAllRead = () => setItems(items.map(n => ({ ...n, isRead: true })))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
        <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <CheckCheck className="w-4 h-4" /> {t('notifications.markAllRead')}
        </button>
      </div>

      <div className="space-y-2">
        {items.map(n => {
          const Icon = typeIcons[n.type] || Bell
          return (
            <Link
              key={n.id}
              to={n.link}
              className={cn('flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors',
                !n.isRead && 'border-primary/30 bg-primary/5'
              )}
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                !n.isRead ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm', !n.isRead && 'font-semibold')}>{field(n, 'title')}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{field(n, 'body')}</div>
                <div className="text-xs text-muted-foreground mt-1">{dateTime(n.createdAt)}</div>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
