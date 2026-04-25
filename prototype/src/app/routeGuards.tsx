import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { eventRepository } from '@/data/repositories'
import { isUserRegisteredForEvent } from '@/domain/events'
import { useApp } from '@/hooks/useAppStore'

function renderRouteContent(children?: ReactNode) {
  return children ?? <Outlet />
}

export function GuestOnlyRoute({ children }: { children?: ReactNode }) {
  const { state } = useApp()

  if (state.isLoggedIn) {
    return <Navigate to={state.hasCompletedProfile ? '/' : '/register/complete'} replace />
  }

  return renderRouteContent(children)
}

export function RequireAuth({
  allowIncompleteProfile = false,
  children,
}: {
  allowIncompleteProfile?: boolean
  children?: ReactNode
}) {
  const { state } = useApp()
  const location = useLocation()

  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowIncompleteProfile && !state.hasCompletedProfile) {
    return <Navigate to="/register/complete" replace state={{ from: location }} />
  }

  return renderRouteContent(children)
}

export function RequireCompleteProfile({ children }: { children?: ReactNode }) {
  const { state } = useApp()
  const location = useLocation()

  if (state.isLoggedIn && !state.hasCompletedProfile) {
    return <Navigate to="/register/complete" replace state={{ from: location }} />
  }

  return renderRouteContent(children)
}

export function RequireEventRegistrant() {
  const { state } = useApp()
  const { id } = useParams()
  const location = useLocation()
  const event = eventRepository.getById(id)

  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!state.hasCompletedProfile) {
    return <Navigate to="/register/complete" replace state={{ from: location }} />
  }

  if (!event) {
    return <Outlet />
  }

  if (!isUserRegisteredForEvent(event, state.currentUser?.id)) {
    return <Navigate to={event.championshipId ? `/championships/${event.championshipId}` : `/events/${event.id}`} replace />
  }

  return <Outlet />
}
