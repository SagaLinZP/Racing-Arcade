import { useParams, Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCompetitionDetail } from '@/features/competitions/hooks'
import { CompetitionDetailView } from '@/features/competitions/CompetitionDetailView'
import { useDriverList } from '@/features/profile/hooks'
import { useTeamList } from '@/features/teams/hooks'

export function CompetitionDetailPage() {
  const { t } = useTranslation()
  const { competitionId } = useParams()
  const { competition } = useCompetitionDetail(competitionId)
  const drivers = useDriverList()
  const teams = useTeamList()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'info' | 'schedule' | 'standings' | 'results') || 'schedule'

  if (competition && competition.rounds.length === 1) {
    return <Navigate to={`/events/${competition.id}/rounds/${competition.rounds[0].id}`} replace />
  }
  if (!competition) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.noData')}</div>
  }

  const setTab = (tab: string) => setSearchParams({ tab })

  return <CompetitionDetailView competition={competition} drivers={drivers} teams={teams} activeTab={activeTab} setTab={setTab} />
}
