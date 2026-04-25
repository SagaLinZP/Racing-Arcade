const coverColors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#2b2d42', '#1b263b', '#415a77', '#2d6a4f']

export function getCoverGradient(id: string): string {
  const idx = parseInt(id.replace(/\D/g, ''), 10) || 0
  const c1 = coverColors[idx % coverColors.length]
  const c2 = coverColors[(idx + 3) % coverColors.length]
  return `linear-gradient(135deg, ${c1}, ${c2})`
}
