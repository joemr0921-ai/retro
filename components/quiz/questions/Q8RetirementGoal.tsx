'use client'

import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'Before 50',
  '50-60',
  '60-65',
  '65-70',
  "I haven't thought about it yet",
]

interface Props {
  value: string | undefined
  onChange: (v: string) => void
}

export default function Q8RetirementGoal({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        When do you hope to retire?
      </h2>
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
