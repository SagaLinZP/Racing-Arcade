import { driverRepository, teamRepository } from '@/data/repositories'

export function useTeamDetail(teamId?: string) {
  const team = teamRepository.getById(teamId)
  const captain = driverRepository.getById(team?.captainId)
  const members = team?.members
    .map(member => ({
      ...member,
      driver: driverRepository.getById(member.userId),
    }))
    .filter(member => member.driver) ?? []

  return {
    team,
    captain,
    members,
  }
}

export function useTeamByMember(userId?: string) {
  const team = teamRepository.getByMemberId(userId)
  return useTeamDetail(team?.id)
}

export function useTeamList() {
  return teamRepository.list()
}
