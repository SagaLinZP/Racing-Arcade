import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { Globe, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const regions = ['CN', 'AP', 'AM', 'EU'] as const

export function Footer() {
  const { t } = useTranslation()
  const { state, setState } = useApp()
  const [regionOpen, setRegionOpen] = useState(false)
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setRegionOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold text-primary mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">RA</div>
              Racing Arcade
            </div>
            <p className="text-sm text-muted-foreground max-w-md">{t('footer.about')}</p>
          </div>
          <div>
            <div className="relative inline-block mb-4" ref={regionRef}>
              <button
                onClick={() => setRegionOpen(!regionOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg border border-border transition-colors"
              >
                <Globe className="w-4 h-4" />
                {t(`region.${state.currentRegion}`)}
                <ChevronDown className="w-3 h-3" />
              </button>
              {regionOpen && (
                <div className="absolute bottom-full mb-1 left-0 w-40 bg-popover border border-border rounded-lg shadow-lg py-1">
                  {regions.map(r => (
                    <button
                      key={r}
                      onClick={() => { setState(s => ({ ...s, currentRegion: r })); setRegionOpen(false) }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors',
                        state.currentRegion === r ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {t(`region.${r}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <h4 className="text-sm font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.help')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">{t('footer.social')}</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold">D</a>
              <a href="#" className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold">X</a>
              <a href="#" className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold">YT</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
