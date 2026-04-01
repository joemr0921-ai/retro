'use client'

interface Props {
  value: number | undefined
  onChange: (v: number) => void
}

export default function Q6FutureSavings({ value, onChange }: Props) {
  function handleChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, '')
    onChange(digits === '' ? 0 : parseInt(digits, 10))
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-6">
        How much are you willing or able to save per month going forward?
      </h2>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-lg pointer-events-none">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value !== undefined && value !== 0 ? value.toString() : ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. 300"
          className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl pl-9 pr-4 py-4 font-mono text-lg focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
        />
      </div>

      <p className="text-[#FAFAF0]/30 text-xs font-mono mt-3">
        It is okay to enter $0 — RAI meets you where you are.
      </p>
    </div>
  )
}
