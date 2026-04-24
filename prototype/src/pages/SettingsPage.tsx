import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { mozaDevices } from '@/data/mozaDevices'
import { drivers } from '@/data/drivers'
import { cn } from '@/lib/utils'
import { gamePlatforms } from '@/data/gamePlatforms'
import { User, Gamepad2, Monitor, Link2, Bell, Camera, Check, Unlink } from 'lucide-react'

export function SettingsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['r16', 'crp'])
  const [showDevices, setShowDevices] = useState(true)
  const [selectedGames, setSelectedGames] = useState<string[]>(['ACC', 'iRacing'])
  const [iracingId, setIracingId] = useState('12345')
  const [iracingPublic, setIracingPublic] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pitHouseEnabled, setPitHouseEnabled] = useState(true)

  const currentDriver = drivers.find(d => d.id === state.currentUser?.id)
  const ownedDevices = mozaDevices.filter(d => currentDriver?.ownedDeviceIds.includes(d.id))

  const tabs = [
    { icon: User, label: t('settings.profile') },
    { icon: Gamepad2, label: t('settings.gaming') },
    { icon: Monitor, label: t('settings.mozaDevices') },
    { icon: Link2, label: t('settings.accounts') },
    { icon: Bell, label: t('settings.notifPrefs') },
  ]

  const toggleGame = (game: string) => {
    setSelectedGames(prev => prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game])
  }
  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 flex-shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={cn('flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === idx ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-xl p-6">
          {activeTab === 0 && (
            <div className="space-y-5">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold">S</div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.nickname')}</label>
                <input defaultValue="SpeedDemon" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.bio')}</label>
                <textarea rows={3} defaultValue="Experienced sim racer, specializing in GT3 events." className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.country')}</label>
                <select defaultValue="China" className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>China</option><option>Japan</option><option>United States</option><option>Germany</option><option>United Kingdom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.language')}</label>
                <div className="flex gap-3">
                  {['en', 'zh'].map(l => (
                    <button key={l} className={cn('flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                      state.language === l ? 'bg-primary/10 border-primary text-primary' : 'border-border'
                    )}>{l === 'en' ? 'English' : '中文'}</button>
                  ))}
                </div>
              </div>
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{t('common.save')}</button>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.iracingId')}</label>
                <div className="flex gap-3">
                  <input value={iracingId} onChange={e => setIracingId(e.target.value)} className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button onClick={() => setIracingPublic(!iracingPublic)} className={cn('px-3 py-2 rounded-lg text-sm border', iracingPublic ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground')}>
                    {iracingPublic ? t('settings.public') : t('settings.private')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.steam')}</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium text-green-400">✓ {t('settings.bound')}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('settings.primaryGames')}</label>
                <div className="flex flex-wrap gap-2">
                  {gamePlatforms.map(game => (
                    <button key={game} onClick={() => toggleGame(game)} className={cn('px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1.5',
                      selectedGames.includes(game) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'
                    )}>
                      {selectedGames.includes(game) && <Check className="w-3 h-3" />}
                      {game}
                    </button>
                  ))}
                </div>
              </div>
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('common.save')}</button>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2 text-sm">
                <Gamepad2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{t('settings.pitHouseSyncHint')}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">{t('settings.devices')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ownedDevices.map(device => (
                    <button
                      key={device.id}
                      onClick={() => toggleDevice(device.id)}
                      className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors text-left',
                        selectedDevices.includes(device.id) ? 'bg-primary/10 border-primary' : 'border-border'
                      )}
                    >
                      <span className="text-lg">{device.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-muted-foreground">{device.category}</div>
                      </div>
                      {selectedDevices.includes(device.id) && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <span className="text-sm">{t('settings.showDevices')}</span>
                <button onClick={() => setShowDevices(!showDevices)} className={cn('w-11 h-6 rounded-full transition-colors relative', showDevices ? 'bg-primary' : 'bg-accent')}>
                  <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all', showDevices ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </div>
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('common.save')}</button>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4">
              {[
                { name: t('settings.pitHouse'), status: t('settings.bound'), canUnbind: false },
                { name: t('settings.discord'), status: t('settings.bound'), canUnbind: true },
                { name: t('settings.steam'), status: t('settings.notBound'), canUnbind: false },
              ].map(account => (
                <div key={account.name} className="flex items-center justify-between px-4 py-4 bg-accent rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{account.name}</div>
                    <div className={cn('text-xs', account.status === t('settings.bound') ? 'text-green-400' : 'text-muted-foreground')}>{account.status}</div>
                  </div>
                  {account.canUnbind ? (
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Unlink className="w-4 h-4" /> {t('settings.unbind')}
                    </button>
                  ) : account.status === t('settings.notBound') ? (
                    <button className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">{t('settings.bind')}</button>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t('settings.cannotUnbind')}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div><div className="text-sm font-medium">{t('settings.pitHouseToggle')}</div><div className="text-xs text-muted-foreground">{t('settings.pitHouseNotif')}</div></div>
                <button onClick={() => setPitHouseEnabled(!pitHouseEnabled)} className={cn('w-11 h-6 rounded-full transition-colors relative', pitHouseEnabled ? 'bg-primary' : 'bg-accent')}>
                  <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all', pitHouseEnabled ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div><div className="text-sm font-medium">{t('settings.emailToggle')}</div><div className="text-xs text-muted-foreground">{t('settings.emailNotif')}</div></div>
                <button onClick={() => setEmailEnabled(!emailEnabled)} className={cn('w-11 h-6 rounded-full transition-colors relative', emailEnabled ? 'bg-primary' : 'bg-accent')}>
                  <div className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all', emailEnabled ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </div>
              {['Registration', 'Event Cancellation', 'Results', 'Protest', 'Penalty', 'Team', 'Waitlist'].map(type => (
                <div key={type} className="flex items-center justify-between py-2">
                  <span className="text-sm">{type}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="accent-[var(--color-primary)] w-3.5 h-3.5" />PH</label>
                    <input type="checkbox" defaultChecked className="accent-[var(--color-primary)] w-4 h-4" />
                  </div>
                </div>
              ))}
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('common.save')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
