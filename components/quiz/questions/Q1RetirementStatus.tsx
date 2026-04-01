import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  { label: "I don't save toward retirement at all", value: 1 },
  { label: 'I only save to a personal savings account', value: 2 },
  { label: 'I save to just one retirement account (401k, IRA, brokerage, HSA, etc.)', value: 3 },
  { label: 'I save monthly to more than one retirement option (401k, IRA, brokerage, HSA, etc.)', value: 4 },
  { label: 'I save monthly and use multiple retirement accounts (401k, IRA, brokerage, HSA, etc.)', value: 5 },
]

interface Props {
  value?: number
  onChange: (v: number) => void
}

export default function Q1RetirementStatus({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-teal-400 text-xs uppercase tracking-widest mb-3">
        Question 1
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAF0] mb-6 leading-snug">
        Where are you in your retirement journey?
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
