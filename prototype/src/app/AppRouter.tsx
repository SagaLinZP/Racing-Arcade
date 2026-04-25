import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/app/AppShell'
import { GuestOnlyRoute, RequireAuth, RequireCompleteProfile, RequireEventRegistrant } from '@/app/routeGuards'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { HomePage } from '@/pages/HomePage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { ChampionshipDetailPage } from '@/pages/ChampionshipDetailPage'
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

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ErrorBoundary><AppShell /></ErrorBoundary>}>
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth allowIncompleteProfile />}>
          <Route path="/register/complete" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireCompleteProfile />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/championships/:id" element={<ChampionshipDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/driver/:id" element={<DriverPage />} />
          <Route path="/team/:id" element={<TeamPublicPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/my-protests" element={<MyProtestsPage />} />
            <Route path="/my-team" element={<TeamManagePage />} />
          </Route>

          <Route element={<RequireEventRegistrant />}>
            <Route path="/events/:id/protest/new" element={<ProtestPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
