import { notificationRepository, type NotificationListFilters } from '@/data/repositories'

export function useNotificationList(filters: NotificationListFilters = {}) {
  return notificationRepository.list(filters)
}
