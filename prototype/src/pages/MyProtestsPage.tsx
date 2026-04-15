import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { protests } from '@/data/protests'
import { events } from '@/data/events'
import { drivers } from '@/data/drivers'
import { cn } from '@/lib/utils'
import { Shield, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

export function MyProtestsPage() {
  const { t } = useTranslation()
  const { state } = useApp()
  const lang = state.language
  const [tab, setTab] = useState<'submitted' | 'received'>('submitted')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [appealId, setAppealId] = useState<string | null>(null)
  const [appealReason, setAppealReason] = useState('')

  const userId = state.currentUser?.id || ''
  const submitted = protests.filter(p => p.reporterId === userId)
  const received = protests.filter(p => p.reportedId === userId)
  const current = tab === 'submitted' ? submitted : received

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    return event ? (lang === 'zh' ? event.name_zh : event.name_en) : eventId
  }

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.nickname || driverId

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    reviewing: 'bg-blue-500/10 text-blue-400',
    resolved: 'bg-green-500/10 text-green-400',
    dismissed: 'bg-red-500/10 text-red-400',
  }

  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t('myProtests.title')}</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {([
          { key: 'submitted' as const, label: t('myProtests.submitted'), count: submitted.length },
          { key: 'received' as const, label: t('myProtests.received'), count: received.length },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {current.length > 0 ? (
        <div className="space-y-3">
          {current.map(p => {
            const isOpen = expanded === p.id
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(p.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{t('myProtests.id')}: {p.id.toUpperCase()}</span>
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusColors[p.status])}>
                        {t(`myProtests.statuses.${p.status}`)}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{getEventName(p.eventId)}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{t(`protest.types.${p.type}`)}</span>
                      <span>·</span>
                      <span>{tab === 'submitted' ? getDriverName(p.reportedId) : getDriverName(p.reporterId)}</span>
                      <span>·</span>
                      <span>{new Date(p.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border">
                    <div className="pt-3">
                      <div className="text-xs text-muted-foreground mb-1">{t('protest.description')}</div>
                      <p className="text-sm">{p.description}</p>
                    </div>

                    {p.lapNumber && (
                      <div className="flex gap-4 text-sm">
                        <div><span className="text-muted-foreground">{t('protest.lap')}: </span>{p.lapNumber}</div>
                        {p.location && <div><span className="text-muted-foreground">{t('protest.location')}: </span>{p.location}</div>}
                      </div>
                    )}

                    {p.evidenceUrls.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('protest.evidence')}</div>
                        <div className="space-y-1">
                          {p.evidenceUrls.map((url, i) => (
                            <a key={i} href={url} className="text-sm text-primary hover:underline block">{url}</a>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.resolution && (
                      <div className="bg-accent rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{p.resolution.decision === 'violation' ? 'Violation' : 'No Violation'}</span>
                        </div>
                        {p.resolution.penalty && (
                          <div className="text-sm"><span className="text-muted-foreground">Penalty: </span>{p.resolution.penalty}</div>
                        )}
                        <div className="text-sm text-muted-foreground">{p.resolution.reason}</div>
                      </div>
                    )}

                    {p.status === 'resolved' && (
                      <button
                        onClick={() => setAppealId(p.id)}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {t('myProtests.appeal')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">{t('common.noData')}</div>
      )}

      {appealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg mx-4 w-full">
            <h3 className="font-bold mb-4">{t('myProtests.appealTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('myProtests.appealReason')}</label>
                <textarea
                  value={appealReason}
                  onChange={e => setAppealReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setAppealId(null); setAppealReason('') }}
                  className="px-4 py-2 bg-accent rounded-lg text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => { setAppealId(null); setAppealReason('') }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                >
                  {t('myProtests.submitAppeal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
