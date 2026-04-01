'use client'

import { useState } from 'react'
import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'No, I have no high-interest debt',
  'Yes, I have high-interest debt',
  "I have debt but I'm not sure of the interest rates",
]

const TOOLTIP = "High-interest debt is generally any debt with an interest rate above 6-7%. Common examples include credit cards (often 20-29%), payday loans, and personal loans from non-bank lenders. Mortgages, federal student loans, and most car loans typically do NOT qualify as high-interest debt."

interface Props {
  value: string | undefined
  onChange: (v: string) => void
}

export default function QDebtA({ value, onChange }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <div>
      {/* Title row with ⓘ icon */}
      <div className="flex items-start gap-2 mb-3">
        <h2 className="font-display text-2xl font-bold text-[#FAFAF0]">
          Do you have any high-interest debt?
        </h2>
        <button
          type="button"
          aria-label="What counts as high-interest debt?"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          onClick={() => setTooltipOpen((v) => !v)}
          className="flex-shrink-0 mt-1.5 text-[#FAFAF0]/40 hover:text-teal-400 transition-colors duration-150 text-sm leading-none"
        >
          ⓘ
        </button>
      </div>

      {/* Tooltip — inline so it never overflows on mobile */}
      {tooltipOpen && (
        <div
          className="mb-4 rounded-xl border border-teal-500/30 bg-[#1A1A1A] p-4 text-xs font-mono text-[#FAFAF0]/70 leading-relaxed"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
        >
          {TOOLTIP}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <QuizOption
            key={opt}
            label={opt}
            selected={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </div>
  )
}
