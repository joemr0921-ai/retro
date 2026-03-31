import { UserButton, currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

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

        {/* Placeholder card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-10 text-center">
          <p className="font-mono text-teal-400 text-sm mb-3 uppercase tracking-widest">
            Phase 2 Coming Soon
          </p>
          <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-3">
            Your dashboard is on its way.
          </h2>
          <p className="text-[#FAFAF0]/50 max-w-md mx-auto leading-relaxed">
            The retirement calculator, education modules, and personalized plan builder
            are all coming in Phase 2. You&apos;re already ahead of 64% of your peers
            just by signing up.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 bg-coral-400/10
                          border border-coral-400/30 text-coral-400
                          font-mono text-sm px-5 py-2.5 rounded-full">
            ✦ Account created successfully
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Savings modules completed', value: '0 / 2' },
            { label: 'Retirement plan',            value: 'Pending' },
            { label: 'Subscription',               value: 'Free tier' },
          ].map((item) => (
            <div key={item.label}
                 className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
              <p className="text-[#FAFAF0]/40 text-xs font-mono uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="font-display font-bold text-xl text-[#FAFAF0]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
