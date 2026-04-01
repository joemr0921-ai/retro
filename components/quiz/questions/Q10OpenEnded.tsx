'use client'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function Q10OpenEnded({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-2">
        In your own words, describe your current financial situation and what you most want to change.
      </h2>
      <p className="text-[#FAFAF0]/40 text-sm font-mono mb-6">
        Optional — skip if you prefer.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="e.g. I have some credit card debt, just started my first real job, and want to start saving but don't know where to begin..."
        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30 resize-none leading-relaxed"
      />

      {value.length > 0 && (
        <p className="text-[#FAFAF0]/20 text-xs font-mono mt-2 text-right">
          {value.length} characters
        </p>
      )}
    </div>
  )
}
