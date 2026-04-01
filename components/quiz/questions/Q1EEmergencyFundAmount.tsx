'use client'

interface Props {
  value: number | undefined
  onChange: (v: number | undefined) => void
}

export default function Q1EEmergencyFundAmount({ value, onChange }: Props) {
  function handleChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, '')
    onChange(digits === '' ? undefined : parseInt(digits, 10))
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-3">
        How much do you have in your emergency fund?
      </h2>

      <p className="text-[#FAFAF0]/30 text-xs font-mono mb-6">
        Your best estimate is fine — round numbers work great.
      </p>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAFAF0]/50 font-mono text-lg pointer-events-none">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value !== undefined ? value.toLocaleString() : ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. 5000"
          className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl pl-9 pr-4 py-4 font-mono text-lg focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
        />
      </div>
    </div>
  )
}
