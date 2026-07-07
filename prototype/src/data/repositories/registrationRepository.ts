import {
  registrations,
  getRoundRegistrations,
  getApprovedDriverIds,
  countRoundRegistrations,
  isDriverRegistered,
} from '@/data/registrations'
import type { Registration, RegistrationStatus } from '@/domain/registrations'

export interface RegistrationListFilters {
  roundId?: string
  driverId?: string
  competitionId?: string
  status?: RegistrationStatus
}

export const registrationRepository = {
  list(filters: RegistrationListFilters = {}): Registration[] {
    const { roundId, driverId, competitionId, status } = filters
    return registrations.filter(r => {
      if (roundId && r.roundId !== roundId) return false
      if (driverId && r.driverId !== driverId) return false
      if (competitionId && r.competitionId !== competitionId) return false
      if (status && r.status !== status) return false
      return true
    })
  },

  listByDriver(driverId?: string): Registration[] {
    if (!driverId) return []
    return registrations.filter(r => r.driverId === driverId)
  },

  listByRound(roundId: string): Registration[] {
    return getRoundRegistrations(roundId)
  },

  getApprovedDriverIds(roundId: string): string[] {
    return getApprovedDriverIds(roundId)
  },

  countByRound(roundId: string, status?: RegistrationStatus): number {
    return countRoundRegistrations(roundId, status)
  },

  isDriverRegistered(roundId: string, driverId?: string): boolean {
    return isDriverRegistered(roundId, driverId)
  },
}
