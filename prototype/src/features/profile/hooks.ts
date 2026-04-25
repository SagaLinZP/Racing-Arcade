import { driverRepository, mozaDeviceRepository, teamRepository } from '@/data/repositories'
import { eventRepository } from '@/data/repositories/eventRepository'

export function useDriverProfile(driverId?: string) {
  const driver = driverRepository.getById(driverId)
  const team = driver?.teamId ? teamRepository.getById(driver.teamId) : undefined
  const events = driver ? eventRepository.list().filter(event => event.registeredDriverIds.includes(driver.id)) : []
  const results = driver
    ? eventRepository.list().flatMap(event => (event.results || [])
      .filter(result => result.driverId === driver.id)
      .map(result => ({ ...result, event })))
    : []
  const devices = driver?.showDevices ? mozaDeviceRepository.listByIds(driver.displayedDeviceIds) : []

  return {
    driver,
    team,
    events,
    results,
    devices,
  }
}

export function useDriverList() {
  return driverRepository.list()
}

export function useDriverSettingsData(driverId?: string) {
  const driver = driverRepository.getById(driverId)
  return {
    driver,
    ownedDevices: mozaDeviceRepository.listByIds(driver?.ownedDeviceIds ?? []),
  }
}
