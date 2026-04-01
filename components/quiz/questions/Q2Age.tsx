'use client'

interface Props {
  value?: number
  onChange: (v: number) => void
}

export default function Q2Age({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-teal-400 text-xs uppercase tracking-widest mb-3">
        Question 2
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAF0] mb-2 leading-snug">
        How old are you?
      </h2>
      <p className="text-[#FAFAF0]/50 text-sm mb-6">
        Your age helps us estimate your retirement timeline.
      </p>
      <input
        type="number"
        min={18}
        max={80}
        value={value ?? ''}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!isNaN(n)) onChange(n)
        }}
        placeholder="Enter your age"
        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl px-5 py-4 font-mono text-lg focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
      />
      {value !== undefined && (value < 18 || value > 80) && (
        <p className="mt-2 text-coral-400 text-xs font-mono">Please enter an age between 18 and 80.</p>
      )}
    </div>
  )
}
