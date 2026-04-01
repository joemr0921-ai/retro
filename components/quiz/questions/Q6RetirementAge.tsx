import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  'Before 50',
  '50-60',
  '60-65',
  '65-70',
  "I haven't thought about it",
]

interface Props {
  value?: string
  onChange: (v: string) => void
}

export default function Q6RetirementAge({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-teal-400 text-xs uppercase tracking-widest mb-3">
        Question 6
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAF0] mb-6 leading-snug">
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
