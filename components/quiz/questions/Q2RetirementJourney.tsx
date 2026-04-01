'use client'

import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  { value: 1 as const, label: "I don't save toward retirement at all" },
  { value: 2 as const, label: 'I only save to a personal savings account — no investing' },
  { value: 3 as const, label: 'I save to just one retirement account' },
  { value: 4 as const, label: 'I save to multiple accounts and other investments' },
]

interface Props {
  value: 1 | 2 | 3 | 4 | undefined
  onChange: (v: 1 | 2 | 3 | 4) => void
}

export default function Q2RetirementJourney({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        Where are you in your retirement journey right now?
      </h2>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <QuizOption
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}
