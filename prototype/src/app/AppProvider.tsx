import { useState, type ReactNode } from 'react'
import { AppContext, defaultState, type AppState } from '@/hooks/useAppStore'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  )
}
