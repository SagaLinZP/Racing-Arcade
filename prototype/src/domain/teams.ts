import type { Region } from './common'

export interface TeamMember {
  userId: string
  role: 'captain' | 'member'
  joinedAt: string
}

export interface Team {
  id: string
  name: string
  logo: string
  description: string
  region: Region
  captainId: string
  members: TeamMember[]
  totalEntries: number
  bestResult: number
  totalPoints: number
}
