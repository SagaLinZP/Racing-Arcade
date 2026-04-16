import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AppContext, defaultState, type AppState } from './hooks/useAppStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { CalendarPage } from './pages/CalendarPage'
import { ChampionshipDetailPage } from './pages/ChampionshipDetailPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { DriverPage } from './pages/DriverPage'
import { MyEventsPage } from './pages/MyEventsPage'
import { ProtestPage } from './pages/ProtestPage'
import { MyProtestsPage } from './pages/MyProtestsPage'
import { TeamManagePage } from './pages/TeamManagePage'
import { TeamPublicPage } from './pages/TeamPublicPage'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import './i18n'

export default function App() {
  const [state, setState] = useState<AppState>(defaultState)

  return (
    <AppContext.Provider value={{ state, setState }}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/complete" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/protest/new" element={<ProtestPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
<Route path="/championships/:id" element={<ChampionshipDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/driver/:id" element={<DriverPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/my-protests" element={<MyProtestsPage />} />
            <Route path="/my-team" element={<TeamManagePage />} />
            <Route path="/team/:id" element={<TeamPublicPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
