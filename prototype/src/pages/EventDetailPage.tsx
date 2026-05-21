import { useParams } from 'react-router-dom'
import { useEventDetail } from '@/features/events/hooks'
import { EventDetailView } from '@/features/events/EventDetailView'
import { useDriverList } from '@/features/profile/hooks'
import { useTeamList } from '@/features/teams/hooks'

export function EventDetailPage() {
  const { id } = useParams()
  const event = useEventDetail(id)
  const drivers = useDriverList()
  const teams = useTeamList()

  return <EventDetailView event={event} drivers={drivers} teams={teams} />
}
