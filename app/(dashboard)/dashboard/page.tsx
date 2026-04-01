import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { MILESTONES } from '@/lib/quiz/milestones'

async function getQuizResult(clerkUserId: string) {
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
      .select('recommended_milestone')
      .eq('user_id', userData.id)
      .single()

    return data?.recommended_milestone ?? null
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const recommendedMilestone = await getQuizResult(user.id)
  const milestone = recommendedMilestone ? MILESTONES[recommendedMilestone] : null

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-2xl font-bold">
                <span className="text-coral-400">Re</span>
                <span className="text-[#FAFAF0]">Tro</span>
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#FAFAF0]">
              Hey, {user.firstName ?? 'Future Millionaire'} 👋
            </h1>
            <p className="text-[#FAFAF0]/50 mt-1">
              Your ReTro journey starts here.
            </p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {milestone ? (
          /* Quiz complete — show their milestone */
          <div className="bg-[#1A1A1A] border border-coral-400/30 rounded-2xl p-8 mb-6 shadow-retro-coral">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-coral-400 uppercase tracking-widest mb-2">
                  ✦ Your ReTro Milestone
                </p>
                <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-1">
                  Milestone {milestone.number}: {milestone.title}
                </h2>
                <p className="text-[#FAFAF0]/50 text-sm leading-relaxed">
                  {milestone.tagline}
                </p>
              </div>
              <Link
                href={`/quiz/results?m=${milestone.number}`}
                className="flex-shrink-0 bg-coral-400 text-[#0F0F0F] font-display font-bold text-sm px-5 py-2.5 rounded-xl shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                View my plan →
              </Link>
            </div>
          </div>
        ) : (
          /* Quiz not taken — prompt with RAI branding */
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-10 text-center mb-6">
            <p className="font-mono text-teal-400 text-xs uppercase tracking-widest mb-3">
              Step 1
            </p>
            <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-3">
              Let RAI find your starting point.
            </h2>
            <p className="text-[#FAFAF0]/50 max-w-sm mx-auto leading-relaxed text-sm mb-2">
              Answer a few quick questions and RAI — ReTro&apos;s Retirement Advice Intelligence — will
              analyze your situation to find exactly which ReTro Milestone to focus on first.
            </p>
            <p className="text-[#FAFAF0]/30 font-mono text-xs mb-8">
              Takes about 3 minutes.
            </p>
            <Link
              href="/quiz"
              className="inline-block bg-coral-400 text-[#0F0F0F] font-display font-bold px-8 py-4 rounded-xl shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
            >
              Start the Quiz — Meet RAI →
            </Link>
          </div>
        )}

        {/* Quick stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Your milestone', value: milestone ? `#${milestone.number}` : 'Pending' },
            { label: 'Retirement plan', value: 'Coming soon' },
            { label: 'Subscription', value: 'Free tier' },
          ].map((item) => (
            <div key={item.label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <p className="text-[#FAFAF0]/40 text-xs font-mono uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="font-display font-bold text-xl text-[#FAFAF0]">{item.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
