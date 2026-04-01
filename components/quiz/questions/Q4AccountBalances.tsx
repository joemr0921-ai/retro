'use client'

import { AccountBalance } from '@/lib/quiz/types'

interface Props {
  accounts: AccountBalance[]
  onChange: (balances: AccountBalance[]) => void
}

function digitsOnly(raw: string): string {
  return raw.replace(/[^\d]/g, '')
}

export default function Q4AccountBalances({ accounts, onChange }: Props) {
  function update(index: number, field: 'balance' | 'contribution', raw: string) {
    const next = accounts.map((a, i) =>
      i === index ? { ...a, [field]: digitsOnly(raw) } : a
    )
    onChange(next)
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-2">
        Tell us about each of your accounts
      </h2>
      <p className="text-[#FAFAF0]/40 text-sm font-mono mb-6">
        Approximate values are fine — RAI uses these to personalize your plan.
      </p>

      <div className="flex flex-col gap-4">
        {accounts.map((account, i) => (
          <div
            key={account.accountType}
            className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4"
          >
            <p className="font-mono text-xs text-[#FAFAF0]/50 uppercase tracking-widest mb-3">
              {account.accountType}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Current balance */}
              <div>
                <label className="text-[#FAFAF0]/40 text-xs font-mono mb-1.5 block">
                  Current balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFAF0]/40 font-mono text-sm pointer-events-none">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={account.balance}
                    onChange={(e) => update(i, 'balance', e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-lg pl-7 pr-3 py-2.5 font-mono text-sm focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
                  />
                </div>
              </div>

              {/* Monthly contribution */}
              <div>
                <label className="text-[#FAFAF0]/40 text-xs font-mono mb-1.5 block">
                  Monthly contribution
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFAF0]/40 font-mono text-sm pointer-events-none">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={account.contribution}
                    onChange={(e) => update(i, 'contribution', e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-lg pl-7 pr-3 py-2.5 font-mono text-sm focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
