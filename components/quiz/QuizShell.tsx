'use client'

interface QuizShellProps {
  step: number        // 1-indexed for display
  totalSteps: number
  onBack: () => void
  children: React.ReactNode
}

export default function QuizShell({ step, totalSteps, onBack, children }: QuizShellProps) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="w-full max-w-xl">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#FAFAF0]/40 hover:text-[#FAFAF0]/70 transition-colors duration-150 font-mono text-xs uppercase tracking-widest"
          >
            ← Back
          </button>
          <span className="font-mono text-xs text-[#FAFAF0]/40 uppercase tracking-widest">
            {step} of {totalSteps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-coral-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        {children}
      </div>
    </div>
  )
}
