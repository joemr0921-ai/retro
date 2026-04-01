'use client'

interface Props {
  value: number | undefined
  onChange: (v: number | undefined) => void
}

export default function Q7Age({ value, onChange }: Props) {
  function handleChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, '')
    if (digits === '') {
      onChange(undefined)
    } else {
      const n = parseInt(digits, 10)
      onChange(n)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        How old are you?
      </h2>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value !== undefined ? value.toString() : ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. 27"
          maxLength={2}
          className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl px-4 py-4 font-mono text-lg focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
        />
      </div>

      <p className="text-[#FAFAF0]/30 text-xs font-mono mt-3">
        Must be between 18 and 80.
      </p>
    </div>
  )
}
