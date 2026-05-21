import { teams, type Team } from '@/data/teams'
import type { Region } from '@/domain/common'

export interface TeamListFilters {
  ids?: readonly string[]
  region?: Region
  memberId?: string
}

export const teamRepository = {
  list(filters: TeamListFilters = {}): Team[] {
    const { ids, region, memberId } = filters
    let result = teams

    if (ids) {
      const idSet = new Set(ids)
      result = result.filter(team => idSet.has(team.id))
    }

    if (region) {
      result = result.filter(team => team.region === region)
    }

    if (memberId) {
      result = result.filter(team => team.members.some(member => member.userId === memberId))
    }

    return result
  },

  getById(id?: string) {
    if (!id) return undefined
    return teams.find(team => team.id === id)
  },

  getByMemberId(userId?: string) {
    if (!userId) return undefined
    return teams.find(team => team.members.some(member => member.userId === userId))
  },
}
