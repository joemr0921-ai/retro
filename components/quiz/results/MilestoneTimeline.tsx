import { MILESTONES } from '@/lib/quiz/milestones'
import { MilestoneNumber, MilestoneStatus } from '@/lib/quiz/types'
import { cn } from '@/lib/utils'

interface Props {
  current: MilestoneNumber
  statuses: Record<MilestoneNumber, MilestoneStatus>
}

// Visual config per status — circle border/bg/text, label colour
function statusStyle(status: MilestoneStatus) {
  switch (status) {
    case 'complete':
      return {
        circleClass: 'border-teal-500 bg-teal-500/10 text-teal-400',
        labelClass: 'text-teal-400',
      }
    case 'skipped':
    case 'current':
      return {
        circleClass: 'border-coral-400 bg-coral-400/20 text-coral-400 shadow-retro-coral',
        labelClass: 'text-coral-400 font-bold',
      }
    case 'caution':
      return {
        circleClass: 'border-yellow-300 bg-yellow-300/10 text-yellow-300',
        labelClass: 'text-yellow-300',
      }
    case 'future':
    default:
      return {
        circleClass: 'border-[#2A2A2A] bg-[#0F0F0F] text-[#FAFAF0]/30',
        labelClass: 'text-[#FAFAF0]/30',
      }
  }
}

// The icon shown INSIDE the circle
function circleIcon(status: MilestoneStatus, n: number) {
  if (status === 'complete') return <span className="text-base leading-none">✅</span>
  if (status === 'caution')  return <span className="text-base leading-none">⚠️</span>
  return <span>{n}</span>
}

export default function MilestoneTimeline({ current, statuses }: Props) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
      <p className="font-mono text-xs text-[#FAFAF0]/40 uppercase tracking-widest mb-6 text-center">
        The ReTro Milestones
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mb-6">
        <span className="font-mono text-[10px] text-teal-400">✅ Completed</span>
        <span className="font-mono text-[10px] text-coral-400">⚠️ Skipped / Revisit</span>
        <span className="font-mono text-[10px] text-coral-400">● You are here</span>
        <span className="font-mono text-[10px] text-[#FAFAF0]/30">○ Future</span>
      </div>

      {/* Desktop: horizontal row */}
      <div className="hidden sm:flex items-start gap-2">
        {Object.values(MILESTONES).map((m) => {
          const status = statuses[m.number as MilestoneNumber]
          const { circleClass, labelClass } = statusStyle(status)

          return (
            <div key={m.number} className="flex-1 flex flex-col items-center gap-2">

              {/* Circle — wrapped in relative so the ⚠️ overlay can be positioned */}
              <div className="relative">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm transition-all',
                    circleClass
                  )}
                >
                  {circleIcon(status, m.number)}
                </div>

                {/* ⚠️ overlay badge — only on skipped milestones */}
                {status === 'skipped' && (
                  <span className="absolute -top-1 -right-1 text-xs leading-none select-none">
                    ⚠️
                  </span>
                )}
              </div>

              {/* Milestone title */}
              <p className={cn('text-center text-xs leading-tight font-mono', labelClass)}>
                {m.title}
              </p>

              {/* "You are here" badge */}
              {(status === 'current' || status === 'skipped') && (
                <span className="font-mono text-[10px] text-coral-400 bg-coral-400/10 border border-coral-400/30 rounded-full px-2 py-0.5 uppercase tracking-widest">
                  You are here
                </span>
              )}

              {/* "Revisit" badge — only on skipped milestones, shown below "You are here" */}
              {status === 'skipped' && (
                <span className="font-mono text-[10px] text-yellow-300 bg-yellow-300/10 border border-yellow-300/30 rounded-full px-2 py-0.5 uppercase tracking-widest">
                  Revisit
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
          const { circleClass, labelClass } = statusStyle(status)
          const isHighlighted = status === 'current' || status === 'skipped'

          return (
            <div
              key={m.number}
              className={cn(
                'flex items-center gap-4 rounded-xl p-3 border transition-all',
                isHighlighted ? 'border-coral-400 bg-coral-400/5' : 'border-transparent'
              )}
            >
              {/* Circle with optional ⚠️ overlay */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs',
                    circleClass
                  )}
                >
                  {circleIcon(status, m.number)}
                </div>
                {status === 'skipped' && (
                  <span className="absolute -top-1 -right-1 text-xs leading-none select-none">
                    ⚠️
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn('font-mono text-xs font-bold truncate', labelClass)}>
                  {m.title}
                </p>
                {status === 'current' && (
                  <p className="font-mono text-[10px] text-coral-400/60 mt-0.5">← You are here</p>
                )}
                {status === 'skipped' && (
                  <p className="font-mono text-[10px] text-coral-400/60 mt-0.5">← You are here · Revisit</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
