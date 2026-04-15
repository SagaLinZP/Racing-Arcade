import { createContext, useContext } from 'react'

export interface AppState {
  isLoggedIn: boolean
  currentUser: { id: string; nickname: string; avatar: string; region: 'CN' | 'AP' | 'AM' | 'EU' } | null
  currentRegion: 'CN' | 'AP' | 'AM' | 'EU'
  language: 'en' | 'zh'
}

export const defaultState: AppState = {
  isLoggedIn: true,
  currentUser: { id: 'd1', nickname: 'SpeedDemon', avatar: '', region: 'CN' },
  currentRegion: 'CN',
  language: 'en',
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
