import type { Region } from './common'
import type { GamePlatform } from './gamePlatforms'

export interface Driver {
  id: string
  nickname: string
  avatar: string
  country: string
  region: Region
  bio_zh: string
  bio_en: string
  iracingId?: string
  steamBound: boolean
  ownedDeviceIds: string[]
  displayedDeviceIds: string[]
  showDevices: boolean
  totalEntries: number
  wins: number
  podiums: number
  totalPoints: number
  teamId?: string
  primaryGames: GamePlatform[]
}
