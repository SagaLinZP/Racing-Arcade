import { useApp } from '@/hooks/useAppStore'
import type { ScoringTableEntry } from '@/lib/utils'

export function ScoringRulesCard({
  rulesText,
  scoringTable,
}: {
  rulesText?: string
  scoringTable?: ScoringTableEntry[]
}) {
  const { state } = useApp()
  const lang = state.language

  if (!rulesText && (!scoringTable || scoringTable.length === 0)) return null

  const hasNotes = scoringTable?.some(e => (lang === 'zh' ? e.note_zh : e.note_en))

  return (
    <div className="space-y-3">
      {rulesText && (
        <p className="text-sm text-muted-foreground">{rulesText}</p>
      )}
      {scoringTable && scoringTable.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-2 pr-4 w-20">{lang === 'zh' ? '名次' : 'Position'}</th>
                <th className="text-left py-2 pr-4 w-20">{lang === 'zh' ? '积分' : 'Points'}</th>
                {hasNotes && <th className="text-left py-2">{lang === 'zh' ? '备注' : 'Note'}</th>}
              </tr>
            </thead>
            <tbody>
              {scoringTable.map(entry => {
                const note = lang === 'zh' ? entry.note_zh : entry.note_en
                return (
                  <tr key={entry.position} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-2 pr-4 font-bold">
                      {entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : entry.position === 3 ? '🥉' : ''}
                      {' '}{entry.position}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-primary">{entry.points}</td>
                    {hasNotes && <td className="py-2 text-muted-foreground">{note || ''}</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
