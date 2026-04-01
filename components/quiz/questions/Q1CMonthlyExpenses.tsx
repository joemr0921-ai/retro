'use client'

import { useState } from 'react'

const TOOLTIP = "Include only the essentials — rent or mortgage, utilities, car payment, insurance, and groceries. Do not include debt payments, dining out, shopping, or entertainment. Example: Rent $1,200 + Car payment $350 + Utilities $150 + Groceries $400 + Insurance $200 = $2,300/month"

interface Props {
  value: number | undefined
  onChange: (v: number | undefined) => void
}

export default function Q1CMonthlyExpenses({ value, onChange }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  function handleChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, '')
    onChange(digits === '' ? undefined : parseInt(digits, 10))
  }

  return (
    <div>
      {/* Title row with ⓘ icon */}
      <div className="flex items-start gap-2 mb-3">
        <h2 className="font-display text-2xl font-bold text-[#FAFAF0]">
          What are your total essential monthly expenses?
        </h2>
        <button
          type="button"
          aria-label="What counts as an essential expense?"
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

      {/* Helper note */}
      <p className="text-[#FAFAF0]/30 text-xs font-mono mb-6">
        Include rent, utilities, car payment, insurance, and groceries. Exclude debt payments, dining out, and entertainment.
      </p>

      {/* Number input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-lg pointer-events-none">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value !== undefined ? value.toLocaleString() : ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. 2300"
          className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl pl-9 pr-4 py-4 font-mono text-lg focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
        />
      </div>
    </div>
  )
}
