export interface Protest {
  id: string
  eventId: string
  reporterId: string
  reportedId: string
  type: 'dangerous' | 'blocking' | 'other'
  description: string
  evidenceUrls: string[]
  lapNumber?: number
  location?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  createdAt: string
  deadline: string
  resolution?: {
    decision: string
    penalty?: string
    reason: string
  }
}

export const protests: Protest[] = [
  {
    id: 'p1',
    eventId: 'e4',
    reporterId: 'd1',
    reportedId: 'd3',
    type: 'dangerous',
    description: 'Lap 12 at Eau Rouge, car #3 made an unsafe rejoin after going off track, causing contact with my car.',
    evidenceUrls: ['https://youtu.be/example1'],
    lapNumber: 12,
    location: 'Eau Rouge',
    status: 'resolved',
    createdAt: '2026-04-16T19:00:00Z',
    deadline: '2026-04-18T19:00:00Z',
    resolution: {
      decision: 'violation',
      penalty: '5-second time penalty applied',
      reason: 'Unsafe rejoin after off-track excursion. Car #3 failed to check for oncoming traffic.',
    },
  },
  {
    id: 'p2',
    eventId: 'e4',
    reporterId: 'd10',
    reportedId: 'd1',
    type: 'blocking',
    description: 'Multiple blocking attempts on the straight between turns 1 and 2 during laps 30-35.',
    evidenceUrls: [],
    lapNumber: 30,
    location: 'Kemmel Straight',
    status: 'pending',
    createdAt: '2026-04-16T20:30:00Z',
    deadline: '2026-04-18T20:30:00Z',
  },
]
