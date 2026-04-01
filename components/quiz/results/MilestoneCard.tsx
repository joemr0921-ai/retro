import { MilestoneContent } from '@/lib/quiz/types'
import { cn } from '@/lib/utils'

interface AiContent {
  explanation: string
  actionStep: string
}

interface Props {
  milestone: MilestoneContent
  aiContent?: AiContent   // personalized content from RAI — optional, falls back to generic
}

const colorMap = {
  coral: {
    badge: 'text-coral-400 border-coral-400/30 bg-coral-400/10',
    number: 'text-coral-400',
    border: 'border-coral-400',
    shadow: 'shadow-retro-coral',
    action: 'bg-coral-400/10 border-coral-400/20',
    ai: 'bg-coral-400/5 border-coral-400/15',
  },
  teal: {
    badge: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    number: 'text-teal-400',
    border: 'border-teal-500',
    shadow: 'shadow-retro-teal',
    action: 'bg-teal-500/10 border-teal-500/20',
    ai: 'bg-teal-500/5 border-teal-500/15',
  },
  yellow: {
    badge: 'text-yellow-300 border-yellow-300/30 bg-yellow-300/10',
    number: 'text-yellow-300',
    border: 'border-yellow-300',
    shadow: '',
    action: 'bg-yellow-300/10 border-yellow-300/20',
    ai: 'bg-yellow-300/5 border-yellow-300/15',
  },
}

export default function MilestoneCard({ milestone, aiContent }: Props) {
  const c = colorMap[milestone.color]

  return (
    <div className={cn('bg-[#1A1A1A] border rounded-2xl p-8', c.border, c.shadow)}>
      {/* Milestone badge */}
      <div className={cn('inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border rounded-full px-3 py-1 mb-4', c.badge)}>
        <span className={cn('text-base font-bold', c.number)}>✦</span>
        Milestone {milestone.number}
      </div>

      {/* Title */}
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAFAF0] mb-2">
        {milestone.title}
      </h2>
      <p className={cn('font-mono text-sm mb-6', c.number)}>
        {milestone.tagline}
      </p>

      {/* RAI personalized explanation — shown when available */}
      {aiContent && (
        <div className={cn('border rounded-xl p-5 mb-4', c.ai)}>
          <p className="font-mono text-xs text-[#FAFAF0]/40 uppercase tracking-widest mb-2">
            ✦ Personalized by RAI
          </p>
          <p className="text-[#FAFAF0]/80 text-sm leading-relaxed">
            {aiContent.explanation}
          </p>
        </div>
      )}

      {/* Primary action — RAI version if available, generic fallback otherwise */}
      <div className={cn('border rounded-xl p-5', c.action)}>
        <p className="font-mono text-xs text-[#FAFAF0]/50 uppercase tracking-widest mb-2">
          Your first action
        </p>
        <p className="text-[#FAFAF0] font-body text-base leading-relaxed font-medium">
          {aiContent ? aiContent.actionStep : milestone.primaryAction}
        </p>
      </div>
    </div>
  )
}
