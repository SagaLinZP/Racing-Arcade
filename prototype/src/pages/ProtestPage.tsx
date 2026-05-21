import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useAppStore'
import { useLocale } from '@/hooks/useLocale'
import { useEventDetail } from '@/features/events/hooks'
import { useDriverList } from '@/features/profile/hooks'
import { cn } from '@/lib/utils'
import { Shield, AlertTriangle, Upload } from 'lucide-react'

export function ProtestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state } = useApp()
  const { field } = useLocale()
  const event = useEventDetail(id)
  const drivers = useDriverList()

  const [targetDriver, setTargetDriver] = useState('')
  const [type, setType] = useState<'dangerous' | 'blocking' | 'other'>('dangerous')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState('')
  const [lapNumber, setLapNumber] = useState('')
  const [location, setLocation] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  if (!event) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>

  const registeredDrivers = event.registeredDriverIds
    .map(dId => drivers.find(d => d.id === dId))
    .filter(d => d && d.id !== state.currentUser?.id)

  const typeOptions: Array<{ key: 'dangerous' | 'blocking' | 'other'; color: string }> = [
    { key: 'dangerous', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    { key: 'blocking', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    { key: 'other', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  ]

  const handleSubmit = () => setShowSuccess(true)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
        &larr; {t('common.back')}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('protest.title')}</h1>
          <p className="text-sm text-muted-foreground">{field(event, 'name')}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('protest.target')}</label>
          <select
            value={targetDriver}
            onChange={e => setTargetDriver(e.target.value)}
            className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          >
            <option value="">{t('protest.targetPlaceholder')}</option>
            {registeredDrivers.map(d => d && (
              <option key={d.id} value={d.id}>{d.nickname}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('protest.type')}</label>
          <div className="flex gap-2">
            {typeOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setType(opt.key)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                  type === opt.key ? opt.color : 'bg-accent text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {t(`protest.types.${opt.key}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('protest.description')}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('protest.descriptionPlaceholder')}
            rows={5}
            className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('protest.evidence')}</label>
          <div className="flex gap-2">
            <input
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              placeholder={t('protest.evidencePlaceholder')}
              className="flex-1 px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
            <button className="px-4 py-2.5 bg-accent border border-border rounded-lg text-sm hover:bg-accent/80 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('protest.lap')}</label>
            <input
              type="number"
              value={lapNumber}
              onChange={e => setLapNumber(e.target.value)}
              placeholder="e.g., 12"
              className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('protest.location')}</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t('protest.locationPlaceholder')}
              className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!targetDriver || !description}
          className={cn(
            'w-full px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors',
            targetDriver && description
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-accent text-muted-foreground cursor-not-allowed'
          )}
        >
          <Shield className="w-4 h-4" /> {t('protest.submit')}
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 w-full text-center">
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-1">{t('protest.success')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('protest.submit')}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
