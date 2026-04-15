export interface Team {
  id: string
  name: string
  logo: string
  description: string
  region: 'CN' | 'AP' | 'AM' | 'EU'
  captainId: string
  members: Array<{ userId: string; role: 'captain' | 'member'; joinedAt: string }>
  totalEntries: number
  bestResult: number
  totalPoints: number
}

export const teams: Team[] = [
  {
    id: 't1',
    name: 'Dragon Racing',
    logo: '',
    description: 'Asia-based racing team focused on GT3 competition.',
    region: 'AP',
    captainId: 'd1',
    members: [
      { userId: 'd1', role: 'captain', joinedAt: '2026-01-01T00:00:00Z' },
      { userId: 'd2', role: 'member', joinedAt: '2026-01-15T00:00:00Z' },
    ],
    totalEntries: 12,
    bestResult: 1,
    totalPoints: 380,
  },
  {
    id: 't2',
    name: 'Apex Velocity',
    logo: '',
    description: 'Trans-Atlantic racing team competing in multiple series.',
    region: 'AM',
    captainId: 'd3',
    members: [
      { userId: 'd3', role: 'captain', joinedAt: '2026-01-05T00:00:00Z' },
      { userId: 'd4', role: 'member', joinedAt: '2026-02-01T00:00:00Z' },
    ],
    totalEntries: 18,
    bestResult: 1,
    totalPoints: 620,
  },
  {
    id: 't3',
    name: 'Thunder Squad',
    logo: '',
    description: 'Pacific racing team with diverse experience.',
    region: 'AP',
    captainId: 'd6',
    members: [
      { userId: 'd6', role: 'captain', joinedAt: '2026-01-10T00:00:00Z' },
      { userId: 'd7', role: 'member', joinedAt: '2026-02-05T00:00:00Z' },
    ],
    totalEntries: 10,
    bestResult: 3,
    totalPoints: 250,
  },
  {
    id: 't4',
    name: 'Continental Racing',
    logo: '',
    description: 'European racing powerhouse.',
    region: 'EU',
    captainId: 'd8',
    members: [
      { userId: 'd8', role: 'captain', joinedAt: '2026-01-01T00:00:00Z' },
      { userId: 'd10', role: 'member', joinedAt: '2026-01-20T00:00:00Z' },
    ],
    totalEntries: 22,
    bestResult: 1,
    totalPoints: 890,
  },
]
