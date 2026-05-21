import { drivers, type Driver } from '@/data/drivers'
import type { Region } from '@/domain/common'

export interface DriverListFilters {
  ids?: readonly string[]
  region?: Region
  teamId?: string
}

export const driverRepository = {
  list(filters: DriverListFilters = {}): Driver[] {
    const { ids, region, teamId } = filters
    let result = drivers

    if (ids) {
      const idSet = new Set(ids)
      result = result.filter(driver => idSet.has(driver.id))
    }

    if (region) {
      result = result.filter(driver => driver.region === region)
    }

    if (teamId) {
      result = result.filter(driver => driver.teamId === teamId)
    }

    return result
  },

  getById(id?: string) {
    if (!id) return undefined
    return drivers.find(driver => driver.id === id)
  },
}
