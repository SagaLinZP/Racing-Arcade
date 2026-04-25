import { protests } from '@/data/protests'

export const protestRepository = {
  list() {
    return protests
  },

  listByReporterId(reporterId?: string) {
    if (!reporterId) return []
    return protests.filter(protest => protest.reporterId === reporterId)
  },

  listByReportedId(reportedId?: string) {
    if (!reportedId) return []
    return protests.filter(protest => protest.reportedId === reportedId)
  },
}
