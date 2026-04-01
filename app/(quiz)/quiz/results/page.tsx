import { redirect } from 'next/navigation'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { MILESTONES } from '@/lib/quiz/milestones'
import { MilestoneNumber, MilestoneStatus } from '@/lib/quiz/types'
import { createAdminClient } from '@/lib/supabase/admin'
import MilestoneCard from '@/components/quiz/results/MilestoneCard'
import MilestoneTimeline from '@/components/quiz/results/MilestoneTimeline'
import Disclaimer from '@/components/quiz/results/Disclaimer'

interface Props {
  searchParams: { m?: string }
}

// ─── Fetch quiz data from Supabase ────────────────────────────────────────────

interface QuizData {
  aiExplanation: string | null
  aiActionStep: string | null
  accountTypes: string[]
  retirementJourney: number
}

async function getQuizData(clerkUserId: string): Promise<QuizData | null> {
  try {
    const supabase = createAdminClient()

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (!userData) return null

    const { data } = await supabase
      .from('quiz_responses')
      .select('ai_explanation, ai_action_step, account_types, retirement_journey')
      .eq('user_id', userData.id)
      .single()

    if (!data) return null

    return {
      aiExplanation: data.ai_explanation as string | null,
      aiActionStep: data.ai_action_step as string | null,
      accountTypes: (data.account_types as string[]) ?? [],
      retirementJourney: (data.retirement_journey as number) ?? 1,
    }
  } catch {
    return null
  }
}

// ─── Milestone status logic ───────────────────────────────────────────────────
//
// For each of the 6 milestones, determine whether it's:
//   complete  ✅ — clear evidence the user has completed it
//   caution   ⚠️ — milestone was skipped but completion isn't confirmed
//   current   🔵 — this is the recommended milestone
//   future    ⬜ — not yet reached

function getMilestoneStatus(
  n: MilestoneNumber,
  recommended: MilestoneNumber,
  accountTypes: string[],
  retirementJourney: number
): MilestoneStatus {
  if (n === recommended) return 'current'
  if (n > recommended) return 'future'

  // n < recommended — check if actually completed or just skipped
  const has401k = accountTypes.some((t) => t === '401k' || t === 'Roth 401k')
  const hasRothOrHSA = accountTypes.some((t) => t === 'Roth IRA' || t === 'HSA (Health Savings Account)')
  const hasBrokerage = accountTypes.includes('Brokerage Account')

  switch (n) {
    case 1:
      // Complete if they have a 401k or Roth 401k (capturing employer match)
      return has401k ? 'complete' : 'caution'
    case 2:
      // We don't ask about emergency fund yet — show caution so they revisit
      return 'caution'
    case 3:
      // We don't ask about debt yet — show caution so they revisit
      return 'caution'
    case 4:
      // Complete if they have a Roth IRA or HSA
      return hasRothOrHSA ? 'complete' : 'caution'
    case 5:
      // We don't have maxing data yet — show caution
      return 'caution'
    case 6:
      // Complete if they have a brokerage account
      return hasBrokerage ? 'complete' : 'caution'
    default:
      return 'future'
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({ searchParams }: Props) {
  const raw = parseInt(searchParams.m ?? '', 10)

  if (isNaN(raw) || raw < 1 || raw > 6) {
    redirect('/quiz')
  }

  const milestoneNumber = raw as MilestoneNumber
  const milestone = MILESTONES[milestoneNumber]

  const user = await currentUser()
  const quizData = user ? await getQuizData(user.id) : null

  const aiContent =
    quizData?.aiExplanation && quizData?.aiActionStep
      ? { explanation: quizData.aiExplanation, actionStep: quizData.aiActionStep }
      : null

  // Build status map for all 6 milestones
  const milestoneStatuses = ([1, 2, 3, 4, 5, 6] as MilestoneNumber[]).reduce(
    (acc, n) => {
      acc[n] = getMilestoneStatus(
        n,
        milestoneNumber,
        quizData?.accountTypes ?? [],
        quizData?.retirementJourney ?? 1
      )
      return acc
    },
    {} as Record<MilestoneNumber, MilestoneStatus>
  )

  return (
    <div className="w-full max-w-xl animate-fade-up">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="font-mono text-xs text-[#FAFAF0]/40 uppercase tracking-widest mb-3">
          Your personalized starting point
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#FAFAF0] mb-2">
          Your ReTro Milestone
        </h1>
        <p className="text-[#FAFAF0]/50 text-sm">
          {aiContent
            ? 'Analyzed by RAI — ReTro\'s Retirement Advice Intelligence'
            : 'Based on your answers, here\'s exactly where to focus first.'}
        </p>
      </div>

      {/* Milestone card with optional RAI personalization */}
      <div className="mb-6">
        <MilestoneCard milestone={milestone} aiContent={aiContent ?? undefined} />
      </div>

      {/* Timeline showing all 6 milestones with status indicators */}
      <div className="mb-6">
        <MilestoneTimeline current={milestoneNumber} statuses={milestoneStatuses} />
      </div>

      {/* Disclaimer */}
      <div className="mb-8">
        <Disclaimer />
      </div>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="block w-full text-center py-4 rounded-xl bg-coral-400 text-[#0F0F0F] font-display font-bold text-base shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
      >
        Go to My Dashboard →
      </Link>
    </div>
  )
}
