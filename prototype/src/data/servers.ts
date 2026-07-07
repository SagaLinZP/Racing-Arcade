export interface ServerLog {
  time: string
  message: string
}

export interface ServerInstance {
  splitId: string
  stageId: string
  serverName?: string
  status: 'stopped' | 'running' | 'error'
  startedAt?: string
  onlineCount?: number
  logs: ServerLog[]
}

export const serverInstances: ServerInstance[] = []

export function getServerInstance(splitId: string): ServerInstance | undefined {
  return serverInstances.find(s => s.splitId === splitId)
}
