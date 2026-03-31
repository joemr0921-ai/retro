import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4
                    backdrop-blur-md bg-[#0F0F0F]/80 border-b border-[#2A2A2A]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-display text-2xl font-bold tracking-tight">
          <span className="text-coral-400">Re</span>
          <span className="text-cream">Tro</span>
        </span>
        <span className="hidden sm:inline-block text-xs font-mono text-[#3A3A3A]
                         bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#2A2A2A]">
          BETA
        </span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-cream/70">
        <a href="#features" className="hover:text-coral-400 transition-colors">Features</a>
        <a href="#pricing"  className="hover:text-coral-400 transition-colors">Pricing</a>
        <a href="#how"      className="hover:text-coral-400 transition-colors">How It Works</a>
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-sm font-medium text-cream/70 hover:text-cream transition-colors px-3 py-1.5">
              Log in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-sm font-semibold bg-coral-400 text-[#0F0F0F]
                               px-4 py-2 rounded-lg hover:bg-coral-300
                               transition-all shadow-retro hover:shadow-none
                               hover:translate-x-[2px] hover:translate-y-[2px]">
              Get Started
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="text-sm font-semibold bg-coral-400 text-[#0F0F0F]
                       px-4 py-2 rounded-lg hover:bg-coral-300
                       transition-all shadow-retro hover:shadow-none
                       hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Dashboard →
          </Link>
        </SignedIn>
      </div>
    </nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center
                        text-center px-6 pt-24 pb-16 overflow-hidden">

      {/* Retro grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,107,71,0.07) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,107,71,0.07) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coral-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10  rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="relative z-10 inline-flex items-center gap-2 bg-[#1A1A1A]
                      border border-[#2A2A2A] rounded-full px-4 py-1.5 mb-8
                      text-sm font-mono text-teal-400 animate-fade-in">
        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse-slow" />
        For the generation that got here late — but not too late
      </div>

      {/* Main headline */}
      <h1 className="relative z-10 font-display font-bold tracking-tight
                     text-5xl sm:text-6xl md:text-7xl lg:text-display-xl
                     text-cream leading-[1.05] mb-6 max-w-4xl animate-fade-up">
        Retirement planning{' '}
        <span className="relative inline-block">
          <span className="text-gradient-coral">feels retro.</span>
          <svg
            className="absolute -bottom-2 left-0 w-full"
            viewBox="0 0 300 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 6 Q37.5 0 75 6 Q112.5 12 150 6 Q187.5 0 225 6 Q262.5 12 300 6"
              stroke="#ff6b47"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>
        <br />
        <span className="text-cream">{"We're making it "}</span>
        <span className="text-gradient-teal">your future.</span>
      </h1>

      {/* Subheadline */}
      <p
        className="relative z-10 text-lg sm:text-xl text-cream/60 max-w-2xl mb-10
                   leading-relaxed animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        Stop pretending retirement is something you&apos;ll think about &ldquo;later.&rdquo;
        ReTro makes it stupidly simple — free tools, plain-English education,
        and an AI that actually explains what a Roth IRA is.
      </p>

      {/* CTA Buttons */}
      <div
        className="relative z-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-up"
        style={{ animationDelay: '0.2s' }}
      >
        <SignUpButton mode="modal">
          <button className="group inline-flex items-center gap-2 bg-coral-400 text-[#0F0F0F]
                             font-display font-bold text-lg px-8 py-4 rounded-xl
                             shadow-retro-coral transition-all duration-150
                             hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]
                             active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
            Start Your ReTro Journey
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </SignUpButton>
        <a
          href="#features"
          className="inline-flex items-center gap-2 text-cream/70 font-medium
                     text-base hover:text-cream transition-colors"
        >
          See how it works
          <span className="text-teal-400">↓</span>
        </a>
      </div>

      {/* Social proof */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-center gap-6
                   mt-16 text-sm text-cream/40 font-mono animate-fade-in"
        style={{ animationDelay: '0.4s' }}
      >
        <span>✦ No finance degree required</span>
        <span>✦ Free to start</span>
        <span>✦ Cancel anytime</span>
        <span>✦ Takes 3 minutes</span>
      </div>
    </section>
  )
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { value: '64%',   label: 'of Americans 18–29 have zero retirement savings' },
    { value: '$0',    label: 'cost to understand where you stand right now' },
    { value: '35yrs', label: 'is how long compound interest needs to work magic' },
    { value: '3min',  label: 'to get your free personalized baseline plan' },
  ]

  return (
    <section className="py-20 px-6 border-y border-[#2A2A2A]">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.value} className="text-center">
            <div className="font-display font-bold text-4xl md:text-5xl text-gradient-coral mb-2">
              {s.value}
            </div>
            <p className="text-cream/40 text-sm leading-relaxed">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

function Features() {
  const freeFeatures = [
    {
      icon: '🧮',
      title: 'Retirement Calculator',
      description: 'See exactly how much you need to save each month to retire comfortably. No jargon.',
    },
    {
      icon: '📚',
      title: '2 Free Education Modules',
      description: 'What is a 401(k)? What is a Roth IRA? We explain the basics in plain English.',
    },
    {
      icon: '📊',
      title: 'Basic Savings Snapshot',
      description: 'Instantly see how your current savings rate compares to where you should be.',
    },
  ]

  const premiumFeatures = [
    {
      icon: '🤖',
      title: 'AI Chat Assistant',
      description: 'Ask anything and get a real answer — not a Wikipedia page.',
    },
    {
      icon: '🗺️',
      title: 'Personalized Retirement Plan',
      description: 'A custom roadmap built around your income, goals, and timeline.',
    },
    {
      icon: '🏆',
      title: 'Milestone Tracking',
      description: 'Hit savings milestones and unlock achievements. Retirement planning should feel rewarding.',
    },
    {
      icon: '🎓',
      title: 'Full Education Library',
      description: '20+ modules covering everything from index funds to tax-loss harvesting.',
    },
    {
      icon: '📈',
      title: 'Progress Dashboard',
      description: 'Visual charts showing your net worth trajectory and projected retirement age.',
    },
    {
      icon: '🔔',
      title: 'Smart Reminders',
      description: 'Monthly nudges to increase contributions when you get a raise or hit a life milestone.',
    },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="font-mono text-sm text-teal-400 uppercase tracking-widest">
            What&apos;s included
          </span>
          <h2 className="font-display font-bold text-display-md text-cream mt-3 mb-4">
            Start free. Upgrade when ready.
          </h2>
          <p className="text-cream/50 text-lg max-w-xl mx-auto">
            Everything you need to stop procrastinating on your future.
          </p>
        </div>

        <div id="pricing" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#2A2A2A] border border-[#3A3A3A] text-cream/60
                               font-mono text-xs px-3 py-1 rounded-full">
                FREE FOREVER
              </span>
              <span className="font-display text-2xl font-bold text-cream">$0 / mo</span>
            </div>
            <div className="space-y-5">
              {freeFeatures.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <h3 className="font-display font-semibold text-cream text-base">{f.title}</h3>
                    <p className="text-cream/50 text-sm mt-0.5 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <SignUpButton mode="modal">
              <button className="mt-8 w-full py-3 border-2 border-[#3A3A3A] rounded-xl
                                 text-cream/70 font-semibold hover:border-cream/30
                                 hover:text-cream transition-all">
                Start Free →
              </button>
            </SignUpButton>
          </div>

          {/* Premium Tier */}
          <div className="relative bg-[#1A1A1A] border-2 border-coral-400 rounded-2xl p-8 shadow-retro-coral">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2
                            bg-coral-400 text-[#0F0F0F] font-mono font-bold
                            text-xs px-4 py-1.5 rounded-full whitespace-nowrap">
              ✦ MOST POPULAR
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-coral-400/20 border border-coral-400/40 text-coral-400
                               font-mono text-xs px-3 py-1 rounded-full">
                PREMIUM
              </span>
              <div>
                <span className="font-display text-2xl font-bold text-cream">$9 </span>
                <span className="text-cream/50 text-sm">/ month</span>
              </div>
            </div>
            <div className="space-y-5">
              {premiumFeatures.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <h3 className="font-display font-semibold text-cream text-base">{f.title}</h3>
                    <p className="text-cream/50 text-sm mt-0.5 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <SignUpButton mode="modal">
              <button className="mt-8 w-full py-3 bg-coral-400 text-[#0F0F0F] rounded-xl
                                 font-display font-bold text-base
                                 shadow-retro hover:shadow-none
                                 hover:translate-x-[2px] hover:translate-y-[2px]
                                 transition-all">
                Start Your ReTro Journey →
              </button>
            </SignUpButton>
            <p className="text-center text-cream/30 text-xs mt-3 font-mono">
              7-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Answer 5 questions',
      description: 'Tell us your age, income, and what "retire comfortably" means to you. Takes under 3 minutes.',
      color: 'text-coral-400',
      borderColor: 'border-coral-400/30',
      bgColor: 'bg-coral-400/10',
    },
    {
      number: '02',
      title: 'Get your plan',
      description: 'ReTro instantly builds a personalized savings roadmap — no advisor needed, no confusing spreadsheets.',
      color: 'text-teal-400',
      borderColor: 'border-teal-400/30',
      bgColor: 'bg-teal-400/10',
    },
    {
      number: '03',
      title: 'Track and level up',
      description: 'Hit milestones, learn as you go, and use the AI assistant whenever a question comes up.',
      color: 'text-yellow-300',
      borderColor: 'border-yellow-300/30',
      bgColor: 'bg-yellow-300/10',
    },
  ]

  return (
    <section id="how" className="py-24 px-6 bg-[#1A1A1A]/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-sm text-coral-400 uppercase tracking-widest">
            How it works
          </span>
          <h2 className="font-display font-bold text-display-md text-cream mt-3">
            From clueless to confident in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`${step.bgColor} border ${step.borderColor} rounded-2xl p-8
                          relative overflow-hidden hover:scale-[1.02] transition-transform duration-200`}
            >
              <span
                className={`absolute -top-4 -right-2 font-display font-bold text-8xl
                             ${step.color} opacity-10 select-none pointer-events-none`}
              >
                {step.number}
              </span>
              <span className={`font-mono text-xs ${step.color} uppercase tracking-widest block mb-4`}>
                Step {step.number}
              </span>
              <h3 className="font-display font-bold text-xl text-cream mb-3">{step.title}</h3>
              <p className="text-cream/50 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] bg-coral-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="font-mono text-sm text-yellow-300 uppercase tracking-widest block mb-6">
          The best time was 10 years ago. The second best time is now.
        </span>
        <h2 className="font-display font-bold text-display-lg text-cream mb-6">
          Your future self will{' '}
          <span className="text-gradient-coral">thank you</span>{' '}
          for starting today.
        </h2>
        <p className="text-cream/50 text-xl mb-10 leading-relaxed">
          Free forever. No credit card needed to start.
          Upgrade only when ReTro has genuinely changed how you think about money.
        </p>
        <SignUpButton mode="modal">
          <button className="group inline-flex items-center gap-3 bg-coral-400 text-[#0F0F0F]
                             font-display font-bold text-xl px-10 py-5 rounded-xl
                             shadow-retro-coral transition-all duration-150
                             hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
            Start Your ReTro Journey
            <span className="group-hover:translate-x-1 transition-transform text-2xl">→</span>
          </button>
        </SignUpButton>
        <p className="text-cream/30 text-sm mt-4 font-mono">
          Free plan · No credit card · Takes 3 minutes
        </p>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#2A2A2A] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row
                      items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold">
            <span className="text-coral-400">Re</span>
            <span className="text-cream">Tro</span>
          </span>
          <span className="text-cream/30 text-sm font-mono hidden sm:block">
            Retirement planning feels retro. {"We're"} making it your future.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-cream/40">
          <a href="#" className="hover:text-cream/70 transition-colors">Privacy</a>
          <a href="#" className="hover:text-cream/70 transition-colors">Terms</a>
          <a href="#" className="hover:text-cream/70 transition-colors">Contact</a>
          <span className="font-mono text-cream/20">© 2026 ReTro</span>
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  )
}
