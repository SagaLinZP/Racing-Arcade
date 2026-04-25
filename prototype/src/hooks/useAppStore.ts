import { createContext, useContext } from 'react'

export interface EventRegistrationOverride {
  isRegistered: boolean
  registrationCount: number
}

export interface AppState {
  isLoggedIn: boolean
  hasCompletedProfile: boolean
  currentUser: { id: string; nickname: string; avatar: string; region: 'CN' | 'AP' | 'AM' | 'EU' } | null
  currentRegion: 'CN' | 'AP' | 'AM' | 'EU'
  language: 'en' | 'zh'
  registrationOverrides: Record<string, EventRegistrationOverride>
}

export const defaultState: AppState = {
  isLoggedIn: true,
  hasCompletedProfile: true,
  currentUser: { id: 'd1', nickname: 'SpeedDemon', avatar: '', region: 'CN' },
  currentRegion: 'CN',
  language: 'en',
  registrationOverrides: {},
}

export const AppContext = createContext<{
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}>({
  state: defaultState,
  setState: () => {},
})

export function useApp() {
  return useContext(AppContext)
}
