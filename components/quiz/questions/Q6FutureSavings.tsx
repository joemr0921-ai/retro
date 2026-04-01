'use client'

import { useState, useEffect } from 'react'
import { AccountBalance } from '@/lib/quiz/types'
import { cn } from '@/lib/utils'

interface Props {
  retirementJourney: 1 | 2 | 3 | 4 | undefined
  accountBalances: AccountBalance[]
  value: number | undefined
  onChange: (v: number | undefined) => void
}

type SavingsOption = '1' | '2' | '3' | '4'

export default function Q6FutureSavings({ retirementJourney, accountBalances, value, onChange }: Props) {
  const calculatedTotal = accountBalances.reduce(
    (sum, a) => sum + (parseInt(a.contribution) || 0), 0
  )

  const isSimpleMode = retirementJourney === 1 || retirementJourney === 2

  const [selectedOption, setSelectedOption] = useState<SavingsOption | null>(null)
  const [extraAmount, setExtraAmount] = useState('')
  const [newTotal, setNewTotal] = useState('')
  const [simpleAmount, setSimpleAmount] = useState('')

  // Clear stale value from a prior visit every time this component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onChange(undefined) }, [])

  function handleOptionSelect(id: SavingsOption) {
    setSelectedOption(id)
    setExtraAmount('')
    setNewTotal('')
    if (id === '1' || id === '4') {
      onChange(calculatedTotal)
    } else {
      onChange(undefined) // wait for sub-input
    }
  }

  // ─── Simple mode (journey 1 or 2 — no retirement accounts) ───────────────────

  if (isSimpleMode) {
    function handleSimpleChange(raw: string) {
      const digits = raw.replace(/[^\d]/g, '')
      setSimpleAmount(digits)
      onChange(digits === '' ? undefined : parseInt(digits, 10))
    }

    return (
      <div>
        <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
          How much are you willing to save per month going forward?
        </h2>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-lg pointer-events-none">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={simpleAmount}
            onChange={(e) => handleSimpleChange(e.target.value)}
            placeholder="e.g. 300"
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl pl-9 pr-4 py-4 font-mono text-lg focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
          />
        </div>

        <p className="text-[#FAFAF0]/30 text-xs font-mono mt-3">
          It is okay to enter $0 — RAI meets you where you are.
        </p>
      </div>
    )
  }

  // ─── Smart mode (journey 3 or 4 — has retirement accounts) ──────────────────

  const options: { id: SavingsOption; label: string }[] = [
    { id: '1', label: 'No, I am maxed out at my current amount' },
    { id: '2', label: 'Yes, I can save a little more' },
    { id: '3', label: 'Yes, I want to increase significantly' },
    { id: '4', label: 'I am not sure yet' },
  ]

  return (
    <div>
      <p className="text-[#FAFAF0]/50 text-sm font-mono mb-2">
        Based on what you shared, you are currently putting{' '}
        <span className="text-coral-400">${calculatedTotal.toLocaleString()}</span> per month toward retirement.
      </p>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-3">
        Are you able or willing to save more than this going forward?
      </h2>
      <p className="text-teal-400 text-xs font-mono mb-6">
        ✦ ReTro recommends saving roughly 20% or more of your annual income toward retirement each year.
      </p>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id
          return (
            <div key={opt.id}>
              <button
                type="button"
                onClick={() => handleOptionSelect(opt.id)}
                className={cn(
                  'w-full text-left px-4 py-4 rounded-xl border font-mono text-sm transition-all duration-150',
                  isSelected
                    ? 'border-coral-400 bg-coral-400/10 text-[#FAFAF0]'
                    : 'border-[#3A3A3A] bg-[#2A2A2A] text-[#FAFAF0]/70 hover:border-[#4A4A4A] hover:text-[#FAFAF0]'
                )}
              >
                {opt.label}
              </button>

              {/* Option 2: how much more per month */}
              {isSelected && opt.id === '2' && (
                <div className="mt-3 ml-1">
                  <p className="text-[#FAFAF0]/50 text-xs font-mono mb-2">How much more per month?</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-base pointer-events-none">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={extraAmount}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, '')
                        setExtraAmount(digits)
                        onChange(digits === '' ? undefined : calculatedTotal + parseInt(digits, 10))
                      }}
                      placeholder="e.g. 100"
                      autoFocus
                      className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl pl-9 pr-4 py-3 font-mono text-base focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
                    />
                  </div>
                </div>
              )}

              {/* Option 3: new total monthly target */}
              {isSelected && opt.id === '3' && (
                <div className="mt-3 ml-1">
                  <p className="text-[#FAFAF0]/50 text-xs font-mono mb-2">What is your new total monthly target?</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-base pointer-events-none">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newTotal}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, '')
                        setNewTotal(digits)
                        onChange(digits === '' ? undefined : parseInt(digits, 10))
                      }}
                      placeholder="e.g. 800"
                      autoFocus
                      className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl pl-9 pr-4 py-3 font-mono text-base focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
