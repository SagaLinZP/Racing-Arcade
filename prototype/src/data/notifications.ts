export interface Notification {
  id: string
  type: 'registration' | 'cancellation' | 'results' | 'protest' | 'penalty' | 'team' | 'waitlist' | 'system'
  title_zh: string
  title_en: string
  body_zh: string
  body_en: string
  link: string
  isRead: boolean
  createdAt: string
}

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'registration',
    title_zh: '报名确认',
    title_en: 'Registration Confirmed',
    body_zh: '您已成功报名 MOZA GT3 挑战赛 - 蒙扎站',
    body_en: 'You have been registered for MOZA GT3 Challenge - Monza',
    link: '/events/e1',
    isRead: false,
    createdAt: '2026-04-15T10:30:00Z',
  },
  {
    id: 'n2',
    type: 'results',
    title_zh: '成绩公布',
    title_en: 'Results Published',
    body_zh: '欧非区LMP2锦标赛 - 斯帕站成绩已公布',
    body_en: 'EU LMP2 Championship - Spa results have been published',
    link: '/events/e4',
    isRead: false,
    createdAt: '2026-04-14T20:00:00Z',
  },
  {
    id: 'n3',
    type: 'cancellation',
    title_zh: '赛事取消通知',
    title_en: 'Event Cancelled',
    body_zh: 'MOZA 独立赛 - 纽博格林已取消，原因：报名人数不足',
    body_en: 'MOZA Standalone - Nürburgring has been cancelled due to insufficient registrations',
    link: '/events/e7',
    isRead: true,
    createdAt: '2026-04-09T15:00:00Z',
  },
  {
    id: 'n4',
    type: 'team',
    title_zh: '车队邀请',
    title_en: 'Team Invitation',
    body_zh: 'Apex Racing 邀请您加入车队',
    body_en: 'Apex Racing has invited you to join the team',
    link: '/my-team',
    isRead: false,
    createdAt: '2026-04-13T14:00:00Z',
  },
  {
    id: 'n5',
    type: 'system',
    title_zh: '平台更新',
    title_en: 'Platform Update',
    body_zh: 'Racing Arcade 已更新至新版本，新增车队管理功能。',
    body_en: 'Racing Arcade has been updated with new team management features.',
    link: '/news',
    isRead: true,
    createdAt: '2026-04-12T09:00:00Z',
  },
]
