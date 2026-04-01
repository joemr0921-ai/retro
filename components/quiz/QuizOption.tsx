'use client'

import { cn } from '@/lib/utils'

interface ExpandableInput {
  placeholder: string
  value: string
  onChange: (v: string) => void
}

interface QuizOptionProps {
  label: string
  selected: boolean
  onClick: () => void
  expandable?: ExpandableInput
}

export default function QuizOption({ label, selected, onClick, expandable }: QuizOptionProps) {
  const showInput = selected && expandable

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 font-body text-[#FAFAF0]',
          selected
            ? 'border-coral-400 bg-coral-400/10 shadow-retro-coral'
            : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A] hover:bg-[#1F1F1F]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors duration-150',
              selected ? 'border-coral-400 bg-coral-400' : 'border-[#3A3A3A]'
            )}
          />
          <span className="text-sm sm:text-base leading-snug">{label}</span>
        </div>
      </button>

      {/* Inline expandable input — slides in when this option is selected */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          showInput ? 'max-h-20 mt-2' : 'max-h-0'
        )}
      >
        {expandable && (
          <input
            type="text"
            value={expandable.value}
            onChange={(e) => expandable.onChange(e.target.value)}
            placeholder={expandable.placeholder}
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
          />
        )}
      </div>
    </div>
  )
}
