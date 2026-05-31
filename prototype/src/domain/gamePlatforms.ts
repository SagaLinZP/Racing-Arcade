export const gamePlatforms = ['AC', 'ACC'] as const

export type GamePlatform = (typeof gamePlatforms)[number]

export const gamePlatformColors: Record<GamePlatform, string> = {
  AC: 'bg-yellow-500',
  ACC: 'bg-orange-500',
}
