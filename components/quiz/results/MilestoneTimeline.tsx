import { MILESTONES } from '@/lib/quiz/milestones'
import { MilestoneNumber, MilestoneStatus } from '@/lib/quiz/types'
import { cn } from '@/lib/utils'

interface Props {
  current: MilestoneNumber
  statuses: Record<MilestoneNumber, MilestoneStatus>
}

// Returns the icon and color classes for a given milestone status
function statusDisplay(status: MilestoneStatus, milestoneNumber: number) {
  switch (status) {
    case 'complete':
      return {
        icon: '✅',
        circleClass: 'border-teal-500 bg-teal-500/10 text-teal-400',
        labelClass: 'text-teal-400',
        label: null,
        badgeText: null,
      }
    case 'caution':
      return {
        icon: '⚠️',
        circleClass: 'border-yellow-300 bg-yellow-300/10 text-yellow-300',
        labelClass: 'text-yellow-300',
        label: null,
        badgeText: null,
      }
    case 'current':
      return {
        icon: String(milestoneNumber),
        circleClass: 'border-coral-400 bg-coral-400/20 text-coral-400 shadow-retro-coral',
        labelClass: 'text-coral-400 font-bold',
        label: null,
        badgeText: 'You are here',
      }
    case 'future':
    default:
      return {
        icon: String(milestoneNumber),
        circleClass: 'border-[#2A2A2A] bg-[#0F0F0F] text-[#FAFAF0]/30',
        labelClass: 'text-[#FAFAF0]/30',
        label: null,
        badgeText: null,
      }
  }
}

export default function MilestoneTimeline({ current, statuses }: Props) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
      <p className="font-mono text-xs text-[#FAFAF0]/40 uppercase tracking-widest mb-6 text-center">
        The ReTro Milestones
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mb-6">
        <span className="font-mono text-[10px] text-[#FAFAF0]/30">✅ Completed</span>
        <span className="font-mono text-[10px] text-[#FAFAF0]/30">⚠️ Revisit</span>
        <span className="font-mono text-[10px] text-coral-400">● You are here</span>
        <span className="font-mono text-[10px] text-[#FAFAF0]/30">○ Future</span>
      </div>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:flex items-start gap-2">
        {Object.values(MILESTONES).map((m) => {
          const status = statuses[m.number as MilestoneNumber]
          const d = statusDisplay(status, m.number)

          return (
            <div key={m.number} className="flex-1 flex flex-col items-center gap-2">
              {/* Step circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm transition-all',
                  d.circleClass
                )}
              >
                {status === 'complete' || status === 'caution' ? (
                  <span className="text-base leading-none">{d.icon}</span>
                ) : (
                  <span>{d.icon}</span>
                )}
              </div>

              {/* Label */}
              <p className={cn('text-center text-xs leading-tight font-mono', d.labelClass)}>
                {m.title}
              </p>

              {/* "You are here" badge for current milestone */}
              {d.badgeText && (
                <span className="font-mono text-[10px] text-coral-400 bg-coral-400/10 border border-coral-400/30 rounded-full px-2 py-0.5 uppercase tracking-widest">
                  {d.badgeText}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {Object.values(MILESTONES).map((m) => {
          const status = statuses[m.number as MilestoneNumber]
          const d = statusDisplay(status, m.number)
          const isCurrent = status === 'current'

          return (
            <div
              key={m.number}
              className={cn(
                'flex items-center gap-4 rounded-xl p-3 border transition-all',
                isCurrent ? 'border-coral-400 bg-coral-400/5' : 'border-transparent'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-mono font-bold text-xs',
                  d.circleClass
                )}
              >
                {status === 'complete' || status === 'caution' ? (
                  <span className="text-sm leading-none">{d.icon}</span>
                ) : (
                  <span>{d.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-mono text-xs font-bold truncate', d.labelClass)}>
                  {m.title}
                </p>
                {isCurrent && (
                  <p className="font-mono text-[10px] text-coral-400/60 mt-0.5">← You are here</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
