'use client'

import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'W2 Employee (traditional paycheck from employer)',
  'Self-Employed / Sole Proprietor',
  'Business Owner with employees',
  'Independent Contractor / 1099',
  'Part-time / Seasonal worker',
  'Student',
  'Unemployed / Between jobs',
]

interface Props {
  value: string | undefined
  onChange: (v: string) => void
}

export default function Q1EmploymentStatus({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        What is your current employment status?
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
