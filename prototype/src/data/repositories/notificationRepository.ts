import { notifications, type Notification } from '@/data/notifications'

export interface NotificationListFilters {
  unreadOnly?: boolean
  limit?: number
}

export const notificationRepository = {
  list(filters: NotificationListFilters = {}): Notification[] {
    const { unreadOnly = false, limit } = filters
    const result = unreadOnly ? notifications.filter(notification => !notification.isRead) : notifications
    return typeof limit === 'number' ? result.slice(0, limit) : result
  },

  getById(id?: string) {
    if (!id) return undefined
    return notifications.find(notification => notification.id === id)
  },
}
