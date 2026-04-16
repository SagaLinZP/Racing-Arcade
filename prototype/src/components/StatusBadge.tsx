import { cn } from '@/lib/utils'

const colors: Record<string, string> = {
  RegistrationOpen: 'bg-green-500/20 text-green-400 border-green-500/30',
  RegistrationClosed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  InProgress: 'bg-red-500/20 text-red-400 border-red-500/30',
  Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ResultsPublished: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  Draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
      {label}
    </span>
  )
}
