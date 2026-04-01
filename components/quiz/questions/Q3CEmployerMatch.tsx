'use client'

import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'Yes, I contribute enough to get the full match',
  "Yes, but I'm not sure if it's enough to get the full match",
  "I contribute something but I don't know how much or what the match is",
  "No, I don't contribute enough to get the full match",
  "No, I don't contribute at all",
  "My employer doesn't offer a match",
]

interface Props {
  value: string | undefined
  onChange: (v: string) => void
}

export default function Q3CEmployerMatch({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        Are you contributing enough to capture your full employer match?
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
