'use client'

import QuizOption from '@/components/quiz/QuizOption'

const OPTIONS = [
  "I don't know where to start",
  "I don't make enough to save",
  "I don't understand the account types",
  'I feel too far behind',
  'I just keep putting it off',
  'Other',
]

interface Props {
  value: string | undefined
  customValue: string | undefined
  onChange: (v: string, custom?: string) => void
}

export default function Q9BiggestConcern({ value, customValue, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        What feels most overwhelming about retirement planning?
      </h2>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <QuizOption
            key={opt}
            label={opt}
            selected={value === opt}
            onClick={() => onChange(opt, opt === 'Other' ? customValue : undefined)}
            expandable={
              opt === 'Other'
                ? {
                    placeholder: 'Tell us more...',
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
