import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import {
  Menu, X, ChevronDown, Bell, Globe, User, LogOut, Calendar,
  Newspaper, Flag, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { notifications } from '@/data/notifications'

const regions = ['CN', 'AP', 'AM', 'EU'] as const

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

export function Navbar() {
  const { t, i18n } = useTranslation()
  const { state, setState } = useApp()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const regionRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useClickOutside(regionRef, () => setRegionOpen(false))
  useClickOutside(userRef, () => setUserMenuOpen(false))
  useClickOutside(notifRef, () => setNotifOpen(false))

  const unreadCount = notifications.filter(n => !n.isRead).length

  const navLinks = [
    { to: '/events', label: t('nav.events'), icon: Flag },
    { to: '/calendar', label: t('nav.calendar'), icon: Calendar },
    { to: '/leaderboard', label: t('nav.leaderboard'), icon: Users },
    { to: '/news', label: t('nav.news'), icon: Newspaper },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">RA</div>
              Racing Arcade
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={regionRef}>
              <button
                onClick={() => setRegionOpen(!regionOpen)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground rounded transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{state.currentRegion}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {regionOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg py-1">
                  {regions.map(r => (
                    <button
                      key={r}
                      onClick={() => { setState(s => ({ ...s, currentRegion: r })); setRegionOpen(false) }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors',
                        state.currentRegion === r ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {t(`region.${r}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const newLang = state.language === 'en' ? 'zh' : 'en'
                setState(s => ({ ...s, language: newLang }))
                i18n.changeLanguage(newLang)
              }}
              className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {state.language === 'en' ? '中文' : 'EN'}
            </button>

            {state.isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg">
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <span className="text-sm font-medium">{t('nav.notifications')}</span>
                      <Link
                        to="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-primary hover:underline"
                      >
                        {t('nav.viewAll')}
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 5).map(n => (
                        <Link
                          key={n.id}
                          to={n.link}
                          onClick={() => setNotifOpen(false)}
                          className={cn(
                            'block px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-0',
                            !n.isRead && 'bg-primary/5'
                          )}
                        >
                          <div className={cn('text-sm', !n.isRead && 'font-semibold')}>{state.language === 'zh' ? n.title_zh : n.title_en}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{state.language === 'zh' ? n.body_zh : n.body_en}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {state.isLoggedIn ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                    {state.currentUser?.nickname?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1">
                    <Link
                      to={`/driver/${state.currentUser?.id}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <User className="w-4 h-4" /> {t('nav.profile')}
                    </Link>
                    <Link
                      to="/my-events"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <Flag className="w-4 h-4" /> {t('nav.myEvents')}
                    </Link>
                    <Link
                      to="/my-team"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <Users className="w-4 h-4" /> {t('nav.myTeam')}
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <Calendar className="w-4 h-4" /> {t('nav.settings')}
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { setState(s => ({ ...s, isLoggedIn: false, currentUser: null, registrationOverrides: {} })); setUserMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
