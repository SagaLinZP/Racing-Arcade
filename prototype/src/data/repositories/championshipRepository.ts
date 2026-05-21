import { championships } from '@/data/championships'
import type { Championship } from '@/domain/championships'
import type { Region } from '@/domain/common'

export interface ChampionshipListFilters {
  ids?: readonly string[]
  region?: Region
}

export const championshipRepository = {
  list(filters: ChampionshipListFilters = {}): Championship[] {
    const { ids, region } = filters
    let result = championships

    if (ids) {
      const idSet = new Set(ids)
      result = result.filter(championship => idSet.has(championship.id))
    }

    if (region) {
      result = result.filter(championship => championship.regions.includes(region))
    }

    return result
  },

  getById(id?: string) {
    if (!id) return undefined
    return championships.find(championship => championship.id === id)
  },
}
