export type Region = 'CN' | 'AP' | 'AM' | 'EU'

export type Language = 'en' | 'zh'

export type CarClass = 'GT3' | 'GT4' | 'Porsche Cup' | 'LMP2' | 'Formula' | 'GTE' | 'TCR'

export interface ScoringTableEntry {
  position: number
  points: number
  note_zh?: string
  note_en?: string
}
