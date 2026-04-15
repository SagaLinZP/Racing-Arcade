import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { teams } from '@/data/teams'
import { drivers } from '@/data/drivers'
import { cn } from '@/lib/utils'
import { Plus, UserMinus, LogOut, Trash2, Crown, Shield } from 'lucide-react'

export function TeamManagePage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const userId = state.currentUser?.id || ''
  const myTeam = teams.find(tm => tm.members.some(m => m.userId === userId))
  const isCaptain = myTeam?.captainId === userId

  const [showCreate, setShowCreate] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teamDesc, setTeamDesc] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null)

  const getDriver = (driverId: string) => drivers.find(d => d.id === driverId)

  if (!myTeam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('team.manage')}</h1>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">{t('team.noTeam')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('team.createOrJoin')}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> {t('team.create')}
          </button>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full">
              <h3 className="font-bold mb-4">{t('dialogs.createTeam')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('team.name')}</label>
                  <input
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder={t('team.namePlaceholder')}
                    className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('team.bio')}</label>
                  <textarea
                    value={teamDesc}
                    onChange={e => setTeamDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('common.confirm')}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('team.manage')}</h1>
        </div>
        <Link to={`/teams/${myTeam.id}`} className="text-sm text-primary hover:underline">{t('common.viewMore')}</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-lg font-bold">
                {myTeam.name[0]}
              </div>
              <div>
                <h2 className="font-bold text-lg">{myTeam.name}</h2>
                <p className="text-sm text-muted-foreground">{myTeam.region} · {myTeam.members.length} {t('team.members')}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{myTeam.description}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{t('team.members')}</h3>
              {isCaptain && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {t('team.invite')}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {myTeam.members.map(m => {
                const driver = getDriver(m.userId)
                if (!driver) return null
                return (
                  <div key={m.userId} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                    <Link to={`/driver/${m.userId}`} className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold hover:opacity-80">
                      {driver.nickname[0]}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/driver/${m.userId}`} className="text-sm font-medium hover:text-primary">{driver.nickname}</Link>
                        {m.role === 'captain' && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{t(`team.${m.role}`)} · {driver.country}</div>
                    </div>
                    {isCaptain && m.role !== 'captain' && (
                      <button
                        onClick={() => setShowRemoveConfirm(m.userId)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4">{t('team.stats')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent rounded-lg p-3">
                <div className="text-xs text-muted-foreground">{t('leaderboard.entries')}</div>
                <div className="text-lg font-bold">{myTeam.totalEntries}</div>
              </div>
              <div className="bg-accent rounded-lg p-3">
                <div className="text-xs text-muted-foreground">{t('team.bestResult')}</div>
                <div className="text-lg font-bold">P{myTeam.bestResult}</div>
              </div>
              <div className="bg-accent rounded-lg p-3 col-span-2">
                <div className="text-xs text-muted-foreground">{t('leaderboard.totalPoints')}</div>
                <div className="text-lg font-bold">{myTeam.totalPoints}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {!isCaptain && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-muted-foreground rounded-lg text-sm hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" /> {t('team.leave')}
              </button>
            )}
            {isCaptain && (
              <button
                onClick={() => setShowDisbandConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-muted-foreground rounded-lg text-sm hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" /> {t('team.disband')}
              </button>
            )}
          </div>
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full">
            <h3 className="font-bold mb-4">{t('dialogs.inviteMember')}</h3>
            <input
              value={inviteSearch}
              onChange={e => setInviteSearch(e.target.value)}
              placeholder={t('team.invitePlaceholder')}
              className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">{t('team.invite')}</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full">
            <h3 className="font-bold mb-2">{t('team.remove')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('dialogs.removeConfirm')}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRemoveConfirm(null)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={() => setShowRemoveConfirm(null)} className="px-4 py-2 bg-destructive text-white rounded-lg text-sm font-semibold">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full">
            <h3 className="font-bold mb-2">{t('team.leave')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('dialogs.leaveConfirm')}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 bg-destructive text-white rounded-lg text-sm font-semibold">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {showDisbandConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full">
            <h3 className="font-bold mb-2">{t('team.disband')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('dialogs.disbandConfirm')}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDisbandConfirm(false)} className="px-4 py-2 bg-accent rounded-lg text-sm">{t('common.cancel')}</button>
              <button onClick={() => setShowDisbandConfirm(false)} className="px-4 py-2 bg-destructive text-white rounded-lg text-sm font-semibold">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
