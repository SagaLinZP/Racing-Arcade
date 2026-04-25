import { useCallback } from 'react'
import {
  getEstimatedSplits,
  getEventCapacity,
  isUserRegisteredForEvent,
  type SimEvent,
} from '@/domain/events'
import { useApp, type EventRegistrationOverride } from '@/hooks/useAppStore'

export interface EventRegistrationSnapshot {
  isRegistered: boolean
  registrationCount: number
  capacity: number
  estimatedSplits: number
  isFull: boolean
  progressPercent: number
}

export function getEventRegistrationSnapshot(
  event: SimEvent,
  userId: string | undefined,
  overrides: Record<string, EventRegistrationOverride> | undefined,
): EventRegistrationSnapshot {
  const safeOverrides = overrides ?? {}
  const override = safeOverrides[event.id]
  const registrationCount = override?.registrationCount ?? event.currentRegistrations
  const capacity = getEventCapacity(event)

  return {
    isRegistered: override?.isRegistered ?? isUserRegisteredForEvent(event, userId),
    registrationCount,
    capacity,
    estimatedSplits: getEstimatedSplits(event, registrationCount),
    isFull: registrationCount >= capacity,
    progressPercent: capacity > 0 ? Math.min(100, (registrationCount / capacity) * 100) : 0,
  }
}

export function useEventRegistration() {
  const { state, setState } = useApp()

  const getSnapshot = useCallback((event: SimEvent) => {
    return getEventRegistrationSnapshot(event, state.currentUser?.id, state.registrationOverrides)
  }, [state.currentUser?.id, state.registrationOverrides])

  const register = useCallback((event: SimEvent) => {
    setState(prev => {
      const overrides = prev.registrationOverrides ?? {}
      const snapshot = getEventRegistrationSnapshot(event, prev.currentUser?.id, overrides)
      if (snapshot.isRegistered) return prev

      return {
        ...prev,
        registrationOverrides: {
          ...overrides,
          [event.id]: {
            isRegistered: true,
            registrationCount: snapshot.registrationCount + 1,
          },
        },
      }
    })
  }, [setState])

  const unregister = useCallback((event: SimEvent) => {
    setState(prev => {
      const overrides = prev.registrationOverrides ?? {}
      const snapshot = getEventRegistrationSnapshot(event, prev.currentUser?.id, overrides)
      if (!snapshot.isRegistered) return prev

      return {
        ...prev,
        registrationOverrides: {
          ...overrides,
          [event.id]: {
            isRegistered: false,
            registrationCount: Math.max(0, snapshot.registrationCount - 1),
          },
        },
      }
    })
  }, [setState])

  return {
    getSnapshot,
    register,
    unregister,
  }
}
