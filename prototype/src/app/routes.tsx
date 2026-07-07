import type { ReactNode } from 'react'
import { GuestOnlyRoute, RequireAuth, RequireCompleteProfile, RequireRoundRegistrant } from '@/app/routeGuards'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { HomePage } from '@/pages/HomePage'
import { EventsPage } from '@/pages/EventsPage'
import { CompetitionDetailPage } from '@/pages/CompetitionDetailPage'
import { RoundDetailPage } from '@/pages/RoundDetailPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { DriverPage } from '@/pages/DriverPage'
import { MyEventsPage } from '@/pages/MyEventsPage'
import { ProtestPage } from '@/pages/ProtestPage'
import { MyProtestsPage } from '@/pages/MyProtestsPage'
import { TeamManagePage } from '@/pages/TeamManagePage'
import { TeamPublicPage } from '@/pages/TeamPublicPage'
import { NewsPage } from '@/pages/NewsPage'
import { NewsDetailPage } from '@/pages/NewsDetailPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export interface AppRouteConfig {
  path?: string
  element: ReactNode
  children?: AppRouteConfig[]
}

export const appRoutes: AppRouteConfig[] = [
  {
    element: <GuestOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <RequireAuth allowIncompleteProfile />,
    children: [
      { path: '/register/complete', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireCompleteProfile />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:competitionId', element: <CompetitionDetailPage /> },
      { path: '/events/:competitionId/rounds/:roundId', element: <RoundDetailPage /> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
      { path: '/driver/:id', element: <DriverPage /> },
      { path: '/team/:id', element: <TeamPublicPage /> },
      { path: '/news', element: <NewsPage /> },
      { path: '/news/:id', element: <NewsDetailPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/my-events', element: <MyEventsPage /> },
          { path: '/my-protests', element: <MyProtestsPage /> },
          { path: '/my-team', element: <TeamManagePage /> },
        ],
      },
      {
        element: <RequireRoundRegistrant />,
        children: [
          { path: '/events/:competitionId/rounds/:roundId/sessions/:sessionId/protest/new', element: <ProtestPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
