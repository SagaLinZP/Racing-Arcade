import { useCallback } from 'react'
import type { Competition, Round } from '@/domain/competitions'
import { getRoundCapacity, getEstimatedSplitCount, getSplitPlan } from '@/domain/registrationOps'
import { registrationRepository } from '@/data/repositories'
import { useApp, type RoundRegistrationOverride } from '@/hooks/useAppStore'
import type { RegistrationStatus } from '@/domain/registrations'

export interface RoundRegistrationSnapshot {
  status: RegistrationStatus | null
  isRegistered: boolean
  registrationCount: number
  capacity: number
  estimatedSplits: number
  isFull: boolean
  progressPercent: number
  minPerGroup: number
}

export function getRoundRegistrationSnapshot(
  round: Round,
  comp: Competition | undefined,
  driverId: string | undefined,
  overrides: Record<string, RoundRegistrationOverride> | undefined,
): RoundRegistrationSnapshot {
  const safeOverrides = overrides ?? {}
  const override = safeOverrides[round.id]
  const baseCount = registrationRepository.countByRound(round.id, 'approved')
  const registrationCount = override?.registrationCount ?? baseCount
  const capacity = getRoundCapacity(round)
  const plan = getSplitPlan(round, registrationCount, comp)
  const estimatedSplits = getEstimatedSplitCount(round, registrationCount, comp)
  const baseRegistered = registrationRepository.isDriverRegistered(round.id, driverId)
  const status = override?.status !== undefined
    ? override.status
    : baseRegistered
      ? 'approved'
      : null

  return {
    status,
    isRegistered: status === 'approved' || status === 'waitlisted',
    registrationCount,
    capacity,
    estimatedSplits,
    isFull: Number.isFinite(capacity) ? registrationCount >= capacity : false,
    progressPercent: Number.isFinite(capacity) && capacity > 0
      ? Math.min(100, (registrationCount / capacity) * 100)
      : 0,
    minPerGroup: plan.minPerGroup,
  }
}

export function useRoundRegistration() {
  const { state, setState } = useApp()

  const getSnapshot = useCallback(
    (round: Round, comp?: Competition) => {
      return getRoundRegistrationSnapshot(round, comp, state.currentUser?.id, state.registrationOverrides)
    },
    [state.currentUser?.id, state.registrationOverrides],
  )

  const register = useCallback((round: Round, comp?: Competition) => {
    setState(prev => {
      const overrides = prev.registrationOverrides ?? {}
      const snapshot = getRoundRegistrationSnapshot(round, comp, prev.currentUser?.id, overrides)
      if (snapshot.isRegistered) return prev

      return {
        ...prev,
        registrationOverrides: {
          ...overrides,
          [round.id]: {
            status: snapshot.isFull ? 'waitlisted' : 'approved',
            registrationCount: snapshot.registrationCount + 1,
          },
        },
      }
    })
  }, [setState])

  const unregister = useCallback((round: Round, comp?: Competition) => {
    setState(prev => {
      const overrides = prev.registrationOverrides ?? {}
      const snapshot = getRoundRegistrationSnapshot(round, comp, prev.currentUser?.id, overrides)
      if (!snapshot.isRegistered) return prev

      return {
        ...prev,
        registrationOverrides: {
          ...overrides,
          [round.id]: {
            status: 'withdrawn',
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
