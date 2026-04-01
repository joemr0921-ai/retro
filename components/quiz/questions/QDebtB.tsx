'use client'

import { useEffect } from 'react'
import { DebtEntry } from '@/lib/quiz/types'
import { cn } from '@/lib/utils'

const DEBT_TYPES = [
  'Credit Card',
  'Personal Loan',
  'Payday Loan',
  'Medical Debt',
  'Private Student Loan',
  'Buy Now Pay Later (BNPL)',
  'Auto Loan (high rate)',
  'Tax Debt (IRS)',
  'Other',
]

const EMPTY_ROW: DebtEntry = { type: '', amount: '', rate: '' }

interface Props {
  value: DebtEntry[]
  onChange: (entries: DebtEntry[]) => void
}

export default function QDebtB({ value, onChange }: Props) {
  // Start with one empty row when the component first mounts
  useEffect(() => {
    if (value.length === 0) onChange([{ ...EMPTY_ROW }])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function updateRow(index: number, patch: Partial<DebtEntry>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    onChange([...value, { ...EMPTY_ROW }])
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  const inputBase =
    'w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl font-mono text-sm focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30'

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-1">
        Tell us about your high-interest debt
      </h2>
      <p className="text-[#FAFAF0]/40 text-sm font-mono mb-5">
        Add each debt separately. Interest rate is optional but helps RAI give better advice.
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_90px_80px_28px] gap-2 mb-1 px-1">
        <span className="text-xs font-mono text-[#FAFAF0]/30 uppercase tracking-wider">Type of debt</span>
        <span className="text-xs font-mono text-[#FAFAF0]/30 uppercase tracking-wider">Amount</span>
        <span className="text-xs font-mono text-[#FAFAF0]/30 uppercase tracking-wider">Rate (if known)</span>
        <span />
      </div>

      {/* Debt rows */}
      <div className="flex flex-col gap-2">
        {value.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_90px_80px_28px] gap-2 items-center">

            {/* Column 1: Type dropdown */}
            <select
              value={row.type}
              onChange={(e) => updateRow(i, { type: e.target.value })}
              className={cn(
                inputBase,
                'px-3 py-3 appearance-none cursor-pointer',
                row.type === '' && 'text-[#FAFAF0]/30'
              )}
            >
              <option value="" disabled>Select type</option>
              {DEBT_TYPES.map((t) => (
                <option key={t} value={t} className="text-[#FAFAF0] bg-[#1A1A1A]">
                  {t}
                </option>
              ))}
            </select>

            {/* Column 2: Amount owed */}
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-sm pointer-events-none">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={row.amount}
                onChange={(e) => updateRow(i, { amount: e.target.value.replace(/[^\d]/g, '') })}
                placeholder="0"
                className={cn(inputBase, 'pl-6 pr-2 py-3')}
              />
            </div>

            {/* Column 3: Interest rate (optional) */}
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={row.rate}
                onChange={(e) => updateRow(i, { rate: e.target.value.replace(/[^\d.]/g, '') })}
                className={cn(inputBase, 'pl-2 pr-6 py-3')}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-sm pointer-events-none">
                %
              </span>
            </div>

            {/* X button — only on rows after the first */}
            {i > 0 ? (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#FAFAF0]/30 hover:text-coral-400 hover:bg-coral-400/10 transition-all duration-150 text-xs"
                aria-label="Remove this debt"
              >
                ✕
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>

      {/* Add row button */}
      <button
        type="button"
        onClick={addRow}
        className="mt-4 text-teal-400 hover:text-teal-300 font-mono text-sm transition-colors duration-150"
      >
        + Add another debt
      </button>
    </div>
  )
}
