export const gamePlatforms = ['AC', 'ACC', 'AC Evo', 'iRacing', 'LMU', 'rF2', 'ETS2'] as const

export type GamePlatform = (typeof gamePlatforms)[number]

export const gamePlatformColors: Record<GamePlatform, string> = {
  AC: 'bg-yellow-500',
  ACC: 'bg-orange-500',
  'AC Evo': 'bg-blue-500',
  iRacing: 'bg-green-500',
  LMU: 'bg-purple-500',
  rF2: 'bg-cyan-500',
  ETS2: 'bg-amber-600',
}
