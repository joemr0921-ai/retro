'use client'

import { cn } from '@/lib/utils'

const ACCOUNT_TYPES = [
  '401k',
  'Roth 401k',
  'Roth IRA',
  'Traditional IRA',
  '403b',
  '457b',
  'Pension Plan',
  'HSA (Health Savings Account)',
  'Brokerage Account',
  'SEP-IRA',
  'Solo 401k',
  'Other',
]

interface Props {
  value: string[]
  customValue: string | undefined
  onChange: (accounts: string[], custom?: string) => void
}

export default function Q3BAccountTypes({ value, customValue, onChange }: Props) {
  function toggle(account: string) {
    if (value.includes(account)) {
      const next = value.filter((a) => a !== account)
      onChange(next, account === 'Other' ? undefined : customValue)
    } else {
      onChange([...value, account], customValue)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-2">
        Which retirement accounts do you currently save to?
      </h2>
      <p className="text-[#FAFAF0]/40 text-sm font-mono mb-6">Select all that apply</p>
      <div className="flex flex-col gap-3">
        {ACCOUNT_TYPES.map((account) => {
          const selected = value.includes(account)
          return (
            <div key={account}>
              <button
                type="button"
                onClick={() => toggle(account)}
                className={cn(
                  'w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 font-body text-[#FAFAF0]',
                  selected
                    ? 'border-coral-400 bg-coral-400/10 shadow-retro-coral'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A] hover:bg-[#1F1F1F]'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox indicator */}
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-150',
                      selected ? 'border-coral-400 bg-coral-400' : 'border-[#3A3A3A]'
                    )}
                  >
                    {selected && (
                      <span className="text-[#0F0F0F] text-[10px] font-bold leading-none">✓</span>
                    )}
                  </div>
                  <span className="text-sm sm:text-base leading-snug">{account}</span>
                </div>
              </button>

              {/* Inline text input for "Other" */}
              {account === 'Other' && selected && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customValue ?? ''}
                    onChange={(e) => onChange(value, e.target.value)}
                    placeholder="What type of account?"
                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
