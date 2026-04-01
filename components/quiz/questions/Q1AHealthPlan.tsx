'use client'

import { useState } from 'react'
import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'HDHP with HSA (High Deductible Health Plan)',
  'Bronze or Catastrophic ACA Marketplace plan',
  'PPO or HMO with FSA option',
  'PPO or HMO without FSA',
  "I have insurance but I'm not sure what type",
  "I don't have health insurance",
]

const TOOLTIP = `Here is a quick breakdown of common health plan types:

HSA — paired with a High Deductible Health Plan or Bronze/Catastrophic ACA plan. Triple tax advantage: contributions go in pre-tax, grow tax-free, and come out tax-free for medical expenses. Unused funds roll over every year and can be invested for retirement.

FSA — offered through many employer plans. Contributions go in pre-tax but funds typically must be used within the year. Not available to self-employed.

PPO/HMO — traditional plans with lower deductibles. Generally do not qualify for HSA contributions.

Not sure? Check your insurance card, HR benefits portal, or annual enrollment documents.`

interface Props {
  value: string | undefined
  onChange: (v: string) => void
}

export default function Q1AHealthPlan({ value, onChange }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <div>
      {/* Title row with ⓘ icon */}
      <div className="flex items-start gap-2 mb-3">
        <h2 className="font-display text-2xl font-bold text-[#FAFAF0]">
          What type of health insurance plan do you have?
        </h2>
        <button
          type="button"
          aria-label="Learn about health plan types"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
          onClick={() => setTooltipOpen((v) => !v)}
          className="flex-shrink-0 mt-1.5 text-[#FAFAF0]/40 hover:text-teal-400 transition-colors duration-150 text-sm leading-none"
        >
          ⓘ
        </button>
      </div>

      {/* Tooltip */}
      {tooltipOpen && (
        <div
          className="mb-4 rounded-xl border border-teal-500/30 bg-[#1A1A1A] p-4 text-xs font-mono text-[#FAFAF0]/70 leading-relaxed whitespace-pre-line"
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
