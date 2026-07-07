import { useParams } from 'react-router-dom'
import { useRoundDetail } from '@/features/competitions/hooks'
import { RoundDetailView } from '@/features/competitions/RoundDetailView'
import { useDriverList } from '@/features/profile/hooks'
import { useTeamList } from '@/features/teams/hooks'

export function RoundDetailPage() {
  const { competitionId, roundId } = useParams()
  const { competition, round } = useRoundDetail(competitionId, roundId)
  const drivers = useDriverList()
  const teams = useTeamList()

  return <RoundDetailView competition={competition} round={round} drivers={drivers} teams={teams} />
}
