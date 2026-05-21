import { AlertTriangle } from 'lucide-react'
import { useApp } from '@/hooks/useAppStore'
import { useLocale } from '@/hooks/useLocale'

export function BannedUserBanner() {
  const { state } = useApp()
  const { text } = useLocale()

  if (!state.isLoggedIn || !state.isBanned) return null

  return (
    <div className="border-b border-destructive/30 bg-destructive/10">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span>{text('当前账号已被限制参赛，请联系管理员。', 'This account is restricted from racing. Please contact an administrator.')}</span>
      </div>
    </div>
  )
}
