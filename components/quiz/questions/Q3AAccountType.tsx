'use client'

import QuizOption from '@/components/quiz/QuizOption'

const ACCOUNT_TYPES = [
  '401k',
  'Roth 401k',
  'Roth IRA',
  'Traditional IRA',
  '403b',
  '457b',
  'Pension Plan',
  'HSA (Health Savings Account)',
  'Other',
]

interface Props {
  value: string | undefined
  customValue: string | undefined
  onChange: (account: string, custom?: string) => void
}

export default function Q3AAccountType({ value, customValue, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        Which retirement account do you currently save to?
      </h2>
      <div className="flex flex-col gap-3">
        {ACCOUNT_TYPES.map((account) => (
          <QuizOption
            key={account}
            label={account}
            selected={value === account}
            onClick={() => onChange(account, account === 'Other' ? customValue : undefined)}
            expandable={
              account === 'Other'
                ? {
                    placeholder: 'What type of account?',
                    value: customValue ?? '',
                    onChange: (v) => onChange('Other', v),
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
