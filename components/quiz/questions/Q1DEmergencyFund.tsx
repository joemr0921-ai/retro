'use client'

import { useState } from 'react'
import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'Yes, I have money set aside in a savings account for emergencies',
  "No, I don't have an emergency fund yet",
  "I'm not sure",
]

const TOOLTIP = "An emergency fund is money sitting in a regular savings account — easily accessible if life throws you a curveball. This is NOT money in a 401k, IRA, or any account where you would face penalties for withdrawing early. Think of it as your financial safety net that you never touch unless you truly need it. Most people keep this separate from their everyday checking account."

interface Props {
  value: string | undefined
  onChange: (v: string) => void
}

export default function Q1DEmergencyFund({ value, onChange }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <div>
      {/* Title row with ⓘ icon */}
      <div className="flex items-start gap-2 mb-3">
        <h2 className="font-display text-2xl font-bold text-[#FAFAF0]">
          Do you have an emergency fund?
        </h2>
        <button
          type="button"
          aria-label="What is an emergency fund?"
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
