import { mozaDevices } from '@/data/mozaDevices'

export const mozaDeviceRepository = {
  list() {
    return mozaDevices
  },

  listByIds(ids: readonly string[] = []) {
    const idSet = new Set(ids)
    return mozaDevices.filter(device => idSet.has(device.id))
  },
}
