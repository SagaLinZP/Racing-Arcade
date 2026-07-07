export type RegistrationStatus = 'approved' | 'rejected' | 'waitlisted' | 'withdrawn'

export interface Registration {
  id: string
  competitionId: string
  roundId: string
  driverId: string
  platformId: string
  preferredNumber?: number
  teamId?: string
  status: RegistrationStatus
  splitNumber?: number
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  note?: string
}
