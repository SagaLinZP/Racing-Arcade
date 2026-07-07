import type { Registration, RegistrationStatus } from '@/domain/registrations'
export type { Registration, RegistrationStatus } from '@/domain/registrations'
import { competitions } from './competitions'
import { drivers } from './drivers'

let regSeq = 1
function mockGuid(): string {
  return '7656119' + String(8100000000 + regSeq)
}

function seedRegistrations(): Registration[] {
  const out: Registration[] = []
  for (const comp of competitions) {
    for (const round of comp.rounds) {
      const approvedIds = round.registeredDriverIds ?? []
      approvedIds.forEach((driverId, i) => {
        const d = drivers.find(x => x.id === driverId)
        out.push({
          id: `reg_${regSeq}`,
          competitionId: comp.id,
          roundId: round.id,
          driverId,
          platformId: mockGuid(),
          preferredNumber: 11 + i,
          teamId: d?.teamId,
          status: 'approved',
          submittedAt: round.registrationOpenAt,
          reviewedAt: round.registrationOpenAt,
          reviewedBy: 'admin1',
        })
        regSeq++
      })
      const others = drivers.filter(d => !approvedIds.includes(d.id)).slice(0, 3)
      others.forEach((d, i) => {
        const status: RegistrationStatus = i === 2 ? 'waitlisted' : 'approved'
        out.push({
          id: `reg_${regSeq}`,
          competitionId: comp.id,
          roundId: round.id,
          driverId: d.id,
          platformId: mockGuid(),
          preferredNumber: 51 + i,
          teamId: d.teamId,
          status,
          submittedAt: round.registrationOpenAt,
        })
        regSeq++
      })
    }
  }
  return out
}

export const registrations: Registration[] = seedRegistrations()

export function getRoundRegistrations(roundId: string): Registration[] {
  return registrations.filter(r => r.roundId === roundId)
}

export function getApprovedDriverIds(roundId: string): string[] {
  return registrations
    .filter(r => r.roundId === roundId && r.status === 'approved')
    .map(r => r.driverId)
}

export function countRoundRegistrations(roundId: string, status?: RegistrationStatus): number {
  return registrations.filter(r => r.roundId === roundId && (!status || r.status === status)).length
}

export function isDriverRegistered(roundId: string, driverId?: string): boolean {
  if (!driverId) return false
  return registrations.some(r => r.roundId === roundId && r.driverId === driverId && r.status === 'approved')
}
