'use client'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function Q8OpenEnded({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-teal-400 text-xs uppercase tracking-widest mb-3">
        Question 8
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#FAFAF0] mb-2 leading-snug">
        In your own words, describe your current financial situation and what you most want to change.
      </h2>
      <p className="text-[#FAFAF0]/50 text-sm mb-6">
        This helps us give you a more accurate and personalized recommendation. Share as much or as little as you like.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. I have some credit card debt, I just started my first real job, and I want to start saving but don't know where to begin..."
        rows={5}
        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-[#FAFAF0] rounded-xl px-5 py-4 font-body text-sm leading-relaxed resize-none focus:outline-none focus:border-coral-400 transition-colors duration-150 placeholder:text-[#FAFAF0]/30"
      />
      <p className="mt-2 text-[#FAFAF0]/30 text-xs font-mono text-right">
        {value.length > 0 ? `${value.length} characters` : 'Optional — skip if you prefer'}
      </p>
    </div>
  )
}
