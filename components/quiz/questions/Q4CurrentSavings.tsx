'use client'

interface Props {
  value?: number
  onChange: (v: number | undefined) => void
}

export default function Q4CurrentSavings({ value, onChange }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const stripped = e.target.value.replace(/[^0-9]/g, '')
    if (stripped === '') {
      onChange(undefined)
    } else {
      onChange(parseInt(stripped, 10))
    }
  }

  return (
    <div>
      <p className="font-mono text-teal-400 text-xs uppercase tracking-widest mb-3">
        Question 4
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAF0] mb-2 leading-snug">
        How much do you currently save per month toward any goal?
      </h2>
      <p className="text-[#FAFAF0]/50 text-sm mb-6">
        Amount saved per month toward any goal — include savings accounts, investments, retirement accounts, anything you set aside. Enter 0 if you don&apos;t currently save.
      </p>
      <div className="flex items-center bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl overflow-hidden focus-within:border-coral-400 transition-colors duration-150">
        <span className="px-4 py-4 text-[#FAFAF0]/50 font-mono text-lg border-r border-[#3A3A3A] select-none">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value !== undefined ? value.toString() : ''}
          onChange={handleChange}
          placeholder="e.g. 200"
          className="flex-1 bg-transparent px-4 py-4 font-mono text-lg text-[#FAFAF0] focus:outline-none placeholder:text-[#FAFAF0]/30"
        />
      </div>
    </div>
  )
}
