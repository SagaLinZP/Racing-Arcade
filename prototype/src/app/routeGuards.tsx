import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { competitionRepository, registrationRepository } from '@/data/repositories'
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

export function RequireRoundRegistrant() {
  const { state } = useApp()
  const { competitionId, roundId } = useParams()
  const location = useLocation()
  const competition = competitionRepository.getById(competitionId)
  const round = competitionRepository.getRound(competitionId, roundId)

  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!state.hasCompletedProfile) {
    return <Navigate to="/register/complete" replace state={{ from: location }} />
  }

  if (!round) {
    return <Outlet />
  }

  if (!registrationRepository.isDriverRegistered(round.id, state.currentUser?.id)) {
    const target = `/events/${competition?.id ?? competitionId}/rounds/${round.id}`
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
