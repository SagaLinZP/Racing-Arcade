import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { Camera, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { gamePlatforms, type GamePlatform } from '@/domain/gamePlatforms'

const countries = [
  'China', 'Japan', 'South Korea', 'United States', 'Canada', 'Brazil', 'United Kingdom',
  'Germany', 'France', 'Italy', 'Spain', 'Australia', 'India', 'Singapore', 'Mexico',
  'Argentina', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Finland', 'Russia',
].sort()

export function RegisterPage() {
  const { t } = useTranslation()
  const { state, setState } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    nickname: '',
    country: '',
    language: state.language,
    games: [] as GamePlatform[],
  })

  const canSubmit = form.nickname && form.country && form.games.length > 0

  const toggleGame = (game: GamePlatform) => {
    setForm(f => ({
      ...f,
      games: f.games.includes(game) ? f.games.filter(g => g !== game) : [...f.games, game],
    }))
  }

  const handleSubmit = () => {
    setState(s => ({
      ...s,
      isLoggedIn: true,
      hasCompletedProfile: true,
      currentUser: { id: 'd5', nickname: form.nickname, avatar: '', region: 'CN' },
      language: form.language,
      registrationOverrides: {},
    }))

    const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from
    navigate(from?.pathname ? `${from.pathname}${from.search ?? ''}` : '/', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{t('register.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('register.subtitle')}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                {form.nickname ? form.nickname[0].toUpperCase() : '?'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('register.nickname')} *</label>
            <input
              value={form.nickname}
              onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
              placeholder={t('register.nicknamePlaceholder')}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('register.country')} *</label>
            <select
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('register.countryPlaceholder')}</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('register.languagePreference')} *</label>
            <div className="flex gap-3">
              {['en', 'zh'].map(l => (
                <button
                  key={l}
                  onClick={() => setForm(f => ({ ...f, language: l as 'en' | 'zh' }))}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                    form.language === l ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:border-primary/50'
                  )}
                >
                  {l === 'en' ? 'English' : '中文'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('register.primaryGames')} *</label>
            <div className="flex flex-wrap gap-2">
              {gamePlatforms.map(game => (
                <button
                  key={game}
                  onClick={() => toggleGame(game)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1.5',
                    form.games.includes(game)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {form.games.includes(game) && <Check className="w-3 h-3" />}
                  {game}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full py-3 rounded-lg font-semibold text-sm transition-colors',
              canSubmit
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-accent text-muted-foreground cursor-not-allowed'
            )}
          >
            {t('register.completeRegistration')}
          </button>
        </div>
      </div>
    </div>
  )
}
