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
  employmentStatus: string | null
  employerMatch: string | null
  emergencyFundStatus: string | null
  emergencyFundAmount: number | null
  monthlyExpenses: number
  highInterestDebt: unknown   // JSONB — either an array of entries or { status: string }
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
      .select([
        'ai_explanation',
        'ai_action_step',
        'employment_status',
        'employer_match',
        'emergency_fund_status',
        'emergency_fund_amount',
        'monthly_expenses',
        'high_interest_debt',
      ].join(', '))
      .eq('user_id', userData.id)
      .single()

    if (!data) return null

    return {
      aiExplanation: data.ai_explanation as string | null,
      aiActionStep: data.ai_action_step as string | null,
      employmentStatus: data.employment_status as string | null,
      employerMatch: data.employer_match as string | null,
      emergencyFundStatus: data.emergency_fund_status as string | null,
      emergencyFundAmount: data.emergency_fund_amount as number | null,
      monthlyExpenses: (data.monthly_expenses as number) ?? 0,
      highInterestDebt: data.high_interest_debt ?? null,
    }
  } catch {
    return null
  }
}

// ─── Milestone status logic ───────────────────────────────────────────────────
//
// Deterministic — driven entirely by quiz answers stored in Supabase.
// Key rule: a milestone can be ✅ complete even if it's numbered above the
// current recommended milestone (out-of-order completion).
//
// Status meanings:
//   complete  ✅ — confirmed done based on quiz answers
//   caution   ⚠️ — skipped: numbered below current but not confirmed done
//   current   🔵 — RAI's recommendation (the lowest incomplete milestone)
//   future    ⬜ — not yet reached and not yet assessed

// Employment types where Milestone 1 doesn't apply (no employer match available)
const M1_NA_STATUSES = [
  'Self-Employed / Sole Proprietor',
  'Independent Contractor / 1099',
  'Student',
  'Unemployed / Between jobs',
]

function parseDebtStatus(raw: unknown): string | null {
  try {
    const val = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(val)) return 'has_debt_entries'          // filled out the debt table
    if (val && typeof val === 'object' && 'status' in val) return (val as { status: string }).status
    return null
  } catch {
    return null
  }
}

function computeMilestoneStatuses(
  recommended: MilestoneNumber,
  data: QuizData | null,
): Record<MilestoneNumber, MilestoneStatus> {
  const emp = data?.employmentStatus ?? null
  const m1IsNA = M1_NA_STATUSES.includes(emp ?? '')

  // M1: complete only when user explicitly confirmed full match capture
  const m1Complete = !m1IsNA &&
    data?.employerMatch === 'Yes, I contribute enough to get the full match'

  // M2: complete when they have a fund AND it covers ≥ 3 months of expenses
  const hasYesFund = data?.emergencyFundStatus?.startsWith('Yes') ?? false
  const fundAmount = data?.emergencyFundAmount ?? 0
  const target3Month = (data?.monthlyExpenses ?? 0) * 3
  const m2Complete = hasYesFund && fundAmount >= target3Month

  // M3: complete only when user explicitly said no high-interest debt
  const debtStatus = parseDebtStatus(data?.highInterestDebt)
  const m3Complete = debtStatus === 'No, I have no high-interest debt'

  // M4–M6: logic not yet built — always future
  function isComplete(n: MilestoneNumber): boolean {
    if (n === 1) return m1Complete
    if (n === 2) return m2Complete
    if (n === 3) return m3Complete
    return false
  }

  // If ANY milestone numbered higher than 'recommended' is complete, the user
  // skipped the recommended one — render it with the skipped+current style.
  const laterMilestoneComplete = ([2, 3, 4, 5, 6] as MilestoneNumber[])
    .filter(m => m > recommended)
    .some(m => isComplete(m))

  return ([1, 2, 3, 4, 5, 6] as MilestoneNumber[]).reduce((acc, n) => {
    if (n === recommended) {
      acc[n] = laterMilestoneComplete ? 'skipped' : 'current'
    } else if (n === 1 && m1IsNA) {
      // M1 not applicable for this employment type — render as gray
      acc[n] = 'future'
    } else if (isComplete(n)) {
      // Complete milestones show ✅ regardless of whether they're above or below current
      acc[n] = 'complete'
    } else if (n < recommended) {
      // Below current and not confirmed done = was skipped
      acc[n] = 'caution'
    } else {
      acc[n] = 'future'
    }
    return acc
  }, {} as Record<MilestoneNumber, MilestoneStatus>)
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

  const milestoneStatuses = computeMilestoneStatuses(milestoneNumber, quizData)

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
