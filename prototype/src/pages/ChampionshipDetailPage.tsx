import { useParams } from 'react-router-dom'
import { ChampionshipDetailView } from '@/features/championships/ChampionshipDetailView'
import { useChampionshipDetail, useChampionshipRouteState } from '@/features/championships/hooks'
import { useDriverList } from '@/features/profile/hooks'
import { useTeamList } from '@/features/teams/hooks'

export function ChampionshipDetailPage() {
  const { id } = useParams()
  const detail = useChampionshipDetail(id)
  const { tab, eventId, setRouteState } = useChampionshipRouteState()
  const drivers = useDriverList()
  const teams = useTeamList()

  return (
    <ChampionshipDetailView
      detail={detail}
      activeTab={tab}
      routeEventId={eventId}
      setRouteState={setRouteState}
      drivers={drivers}
      teams={teams}
    />
  )
}
