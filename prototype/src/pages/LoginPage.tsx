import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'

export function LoginPage() {
  const { t } = useTranslation()
  const { state, setState } = useApp()

  const handleLogin = () => {
    setState(s => ({
      ...s,
      isLoggedIn: true,
      currentUser: { id: 'd1', nickname: 'SpeedDemon', avatar: '', region: 'CN' },
    }))
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">RA</div>
          <h1 className="text-2xl font-bold mb-2">{t('auth.title')}</h1>
          <p className="text-muted-foreground">{t('auth.subtitle')}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"/></svg>
            {t('auth.pitHouse')}
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] text-white rounded-lg font-semibold hover:bg-[#5865F2]/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            {t('auth.discord')}
          </button>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1b2838] text-white rounded-lg font-semibold hover:bg-[#1b2838]/90 border border-[#2a475e] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            {t('auth.steam')}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {state.currentRegion} · {state.language === 'en' ? 'English' : '中文'}
        </p>
      </div>
    </div>
  )
}
