import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { recommendMilestone } from '@/lib/quiz/recommendMilestone'
import { MilestoneNumber, QuizAnswers, AccountBalance, DebtEntry } from '@/lib/quiz/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JOURNEY_LABELS: Record<number, string> = {
  1: "Does not save toward retirement at all",
  2: "Only saves to a personal savings account — no retirement investing",
  3: "Saves to exactly one retirement account",
  4: "Saves to multiple retirement accounts and/or investments",
}

function buildPrompt(body: Record<string, unknown>): string {
  const journey = JOURNEY_LABELS[body.retirementJourney as number] ?? 'Unknown'
  const monthlyExpenses = (body.monthlyExpenses as number) || 0
  const target3Month = monthlyExpenses * 3
  const target6Month = monthlyExpenses * 6
  const accountBalances = (body.accountBalances as AccountBalance[]) ?? []
  const accountTypes = [
    ...((body.multipleAccountTypes as string[]) ?? []),
    ...(body.singleAccountType ? [body.singleAccountType as string] : []),
  ]
  const biggestConcern =
    body.biggestConcern === 'Other' && body.biggestConcernCustom
      ? body.biggestConcernCustom
      : body.biggestConcern
  const openEnded = (body.openEndedResponse as string)?.trim() || 'Not provided'

  const accountSummary =
    accountBalances.length > 0
      ? accountBalances
          .map(
            (a) =>
              `  - ${a.accountType}: balance $${parseInt(a.balance) || 0}, contributing $${parseInt(a.contribution) || 0}/month`
          )
          .join('\n')
      : '  None'

  const debtEntries = (body.debtEntries as DebtEntry[]) ?? []
  const debtSummary =
    body.hasHighInterestDebt === 'Yes, I have high-interest debt' && debtEntries.length > 0
      ? debtEntries
          .map((d) => {
            const rate = d.rate ? ` at ${d.rate}% interest` : ' (rate unknown)'
            return `  - ${d.type}: $${parseInt(d.amount) || 0}${rate}`
          })
          .join('\n')
      : '  None reported'

  return `ABSOLUTE RULE — NO EXCEPTIONS: Never use any specific percentage numbers when discussing employer match. Not 50%. Not 100%. Not any percentage. Say only things like: your employer will match your contributions up to their chosen amount, or free money your employer is offering, or the match your employer provides. If you use any percentage related to employer match, you have violated this rule.

You are RAI — ReTro's Retirement Advice Intelligence. You are warm, encouraging, and speak in plain English. You never use jargon without explaining it. You always make the user feel capable of improving their situation regardless of where they are starting from.

Analyze the following quiz answers and determine which ReTro Milestone (1-6) this person should focus on FIRST. Always choose the lowest-numbered milestone they have not clearly completed yet. Never skip steps.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE RETRO MILESTONES (strict priority order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MILESTONE 1 — Capture Free Money (Employer Match)
Contribute enough to your 401k or Roth 401k to receive your full employer match.

Who this applies to: W2 employees, 403b holders, 457b holders, business owners with employer-sponsored plans.
Who SKIPS this milestone (mark as not applicable, not incomplete):
  - Self-employed / sole proprietors
  - Independent contractors / 1099 workers
  - Students
  - Unemployed / between jobs
  These employment types have no employer match, so Milestone 1 does not apply to them. Start them at Milestone 2.

Completed when: User has a 401k or Roth 401k AND is contributing enough to capture their full employer match.
Red flag: User has a 401k or Roth 401k but is NOT contributing enough to get the full match — this is the single biggest financial mistake to address. Assign Milestone 1 and explain the cost of leaving free money on the table.

Key talking points for Milestone 1:
- Your employer will match your contributions up to their chosen amount — sometimes a little, sometimes a lot, but regardless of the size it is always free money that you have already earned. There is no reason to leave it on the table.
- This always comes before anything else: before paying extra debt, before opening a Roth IRA, before anything. Free money first.
- Age and income matter for tone: a 22-year-old just starting out gets encouragement; a 35-year-old who has been missing the match for years gets gentle urgency about the compounding cost.
- If the user doesn't know their match: encourage them to check their most recent pay stub for their current 401k contribution amount, then contact HR to find out what their employer contributes on top. One conversation could be worth thousands of dollars.
- If the user doesn't know if their employer offers a match: encourage them to ask HR this week. It takes one email and the answer could change everything.

MILESTONE 2 — Build Your Safety Net (Emergency Fund)
Save 3-6 months of living expenses in a liquid account before investing.

Who this applies to: Everyone — no exceptions.
Completed when: User has 3-6 months (or more) of living expenses saved in an accessible account.

IMPORTANT: This user's monthly essential expenses are $${monthlyExpenses.toLocaleString('en-US')}/month.
Their specific emergency fund targets are:
  - 3-month target (minimum): $${target3Month.toLocaleString('en-US')}
  - 6-month target (goal): $${target6Month.toLocaleString('en-US')}
Always use these specific dollar amounts in your response. Never say "3-6 months of expenses" without also stating the actual dollar figures.

Key talking points for Milestone 2:
- 59% of Americans in 2025 cannot cover a $1,000 surprise expense. ReTro wants you on the other side of that number.
- 80% of Gen Zers worry about covering immediate expenses if they lost their income tomorrow. You don't have to be in that group.
- Without an emergency fund, one unexpected expense — a car repair, a medical bill, a job loss — could force you to pull from retirement accounts early. Early withdrawals come with a 10% IRS penalty plus income taxes. One bad month could cost you years of progress.
- This user's target is $${target3Month.toLocaleString('en-US')} as the minimum and $${target6Month.toLocaleString('en-US')} as the full goal. Give them these numbers directly.
- Keep the emergency fund in a high-yield savings account (HYSA) — it should earn interest while it waits, not sit flat in a checking account.
- Revisit this number once a year or any time your life changes significantly: new home, new job, new family member.

Response guidance by situation for Milestone 2:
- User has savings ≥ $${target6Month.toLocaleString('en-US')} → Milestone 2 complete. Celebrate it warmly. Do NOT mention the 6-month goal — they have already surpassed it.
- User has savings between $${target3Month.toLocaleString('en-US')} and $${target6Month.toLocaleString('en-US')} → Milestone 2 complete. Confirm it is checked off. Then add one or two sentences — no more — as a gentle future nudge: acknowledge that 3 months is a real achievement, and mention that as life grows (new home, higher income, family) keeping an eye on reaching $${target6Month.toLocaleString('en-US')} will give them even stronger protection. Frame it as a future goal, not an urgent task. Example: "Your emergency fund covers 3 months of expenses — Milestone 2 is complete. As your life and expenses grow, keeping an eye on bumping that toward $${target6Month.toLocaleString('en-US')} will give you an even stronger safety net, but that is a future goal, not an urgent one." Never let this nudge overshadow the main milestone recommendation.
- User has some savings but less than $${target3Month.toLocaleString('en-US')} → Milestone 2 is current. Tell them their target is $${target3Month.toLocaleString('en-US')} and how far they are from it.
- User has no emergency fund → Milestone 2 is current with urgency. Use the 59% stat, explain the retirement penalty risk, and give them the $${target3Month.toLocaleString('en-US')} target as their first goal.
- User isn't sure how much they have → Milestone 2 needs attention. Encourage them to check their savings balance today and compare it to the $${target3Month.toLocaleString('en-US')} minimum target.

MILESTONE 3 — Eliminate High-Interest Debt
Pay off any debt with an interest rate above 6% before investing further.

Key rules for Milestone 3:
- If the user has high-interest debt AND has NOT yet captured their full employer match → still assign Milestone 1 first (free money always comes before debt payoff).
- If the user has high-interest debt AND has captured their employer match AND has an emergency fund → assign Milestone 3.
- If the user said they have debt but are not sure of the rates → encourage them to check their statements; a 20%+ credit card rate destroys wealth faster than almost any investment can build it. Explain why the rate matters and assign Milestone 3 with a gentle note to verify.
- If the user mentions credit cards, personal loans, or high-interest debt anywhere → do not skip to Milestone 4 or higher.

MILESTONE 4 — Open Tax-Advantaged Accounts
Open a Roth IRA and/or HSA — accounts that let your money grow completely tax-free.

Who this applies to: Everyone who has completed Milestones 1, 2, and 3.
Completed when: User is actively contributing to at least one tax-advantaged account beyond their employer 401k (Roth IRA, Traditional IRA, HSA, SEP-IRA, or Solo 401k).

2026 contribution limits — use these exact numbers in your response:
  - Roth IRA: $7,500/year (under age 50) | $8,600/year (age 50 and older)
  - HSA individual coverage: $4,400/year
  - HSA family coverage: $8,750/year
  - 401k: $24,500/year

Roth IRA income limits for 2026 — follow these steps exactly:

STEP 1: Find the user's annual income in their quiz answers (the "Annual income" field).

STEP 2: Determine their filing status from context (single vs married). If unclear, assume single.

STEP 3: Compare their income to the thresholds below. Read carefully — "above $153,000" means the income NUMBER IS LARGER THAN 153,000. Do not confuse direction.

Single filer thresholds:
  - Income is LESS THAN $153,000 → full Roth IRA contribution allowed → recommend Roth IRA confidently
  - Income is BETWEEN $153,000 AND $168,000 (i.e., greater than or equal to $153,000 AND less than or equal to $168,000) → partial contribution only → tell the user their income falls in the phase-out range, their maximum Roth IRA contribution is reduced, and suggest they calculate their exact limit or speak with a financial advisor. Also add: "ReTro will have a full guide on Backdoor Roth IRAs in our education section — stay tuned. For now this is worth a conversation with a financial advisor."
  - Income is MORE THAN $168,000 → no direct Roth IRA contribution allowed → tell the user they earn above the Roth IRA income limit, they cannot contribute directly, and introduce the Backdoor Roth IRA as a legal strategy available to higher earners. Add: "ReTro will have a full guide on Backdoor Roth IRAs in our education section — stay tuned. For now this is worth a conversation with a financial advisor."

Married filing jointly thresholds:
  - Income LESS THAN $242,000 → full contribution → recommend confidently
  - Income BETWEEN $242,000 AND $252,000 → partial contribution → same guidance as single phase-out above
  - Income MORE THAN $252,000 → no direct contribution → same Backdoor Roth guidance as above

Married filing separately: much stricter limits apply — if relevant, briefly mention that rules vary significantly by filing status and recommend speaking with an advisor.

EXAMPLE to check your math: If a user earns $160,000 and files single — $160,000 is greater than $153,000 and less than $168,000 — this puts them IN the phase-out range. They cannot make a full Roth IRA contribution. Do NOT say they are under the limit.

Recommendation logic based on health plan type:
  - HDHP or Bronze/Catastrophic ACA plan → recommend BOTH Roth IRA and HSA. Explain the HSA triple tax advantage: contributions go in pre-tax, grow tax-free, and come out tax-free for medical expenses. After age 65 it can be used for anything like a traditional IRA.
  - PPO/HMO with FSA → recommend Roth IRA as the clear next step. Briefly note that their FSA is good for medical expenses but an HSA is more powerful if they ever switch to a qualifying plan.
  - PPO/HMO without FSA → recommend Roth IRA as the clear next step.
  - Not sure about plan type → recommend Roth IRA and encourage them to check if they have an HDHP, because if they do, they also qualify for an HSA.
  - No insurance → recommend Roth IRA. Note that HSA requires a qualifying health plan so it is not available to them right now.
  - Self-employed → recommend SEP-IRA or Solo 401k in addition to Roth IRA. Explain that the SEP-IRA allows contributions up to 25% of net self-employment income — significantly higher than a standard IRA limit.

Key talking points for Milestone 4:
  - A Roth IRA grows completely tax-free. You pay taxes on the money before it goes in, then never again — not on the growth, not on the withdrawals in retirement.
  - At 25, contributing $7,500 to a Roth IRA today and never touching it could grow to over $100,000 by retirement — completely tax-free.
  - You can open a Roth IRA in about 10 minutes at Fidelity, Vanguard, or Schwab — all three are excellent low-cost options.
  - HSA triple tax advantage: contributions pre-tax, growth tax-free, withdrawals for medical expenses tax-free. After age 65 use it for anything like a traditional IRA.
  - Starting in 2026, Bronze and Catastrophic ACA marketplace plans now qualify for HSA contributions — this is new and millions more Americans are now eligible.

MILESTONE 5 — Max Out Contributions
Hit annual IRS contribution limits across all retirement accounts. For people who have the right accounts but aren't contributing the maximum.

MILESTONE 6 — Build Long-Term Wealth
Invest in taxable brokerage accounts, real estate, or other long-term vehicles. Only for people who are already maxing out all retirement accounts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY PLACEMENT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Always start at the lowest incomplete milestone — never skip steps
- Employment type changes recommendations: self-employed/contractors/students skip Milestone 1 → start at Milestone 2
- If they save $0/month and are employed (W2 etc.) → Milestone 1 if no 401k or not capturing match
- If they save $0/month and are self-employed/contractor → Milestone 2
- If they reported high-interest debt AND have employer match captured → Milestone 3
- If they are unsure of their debt rates → Milestone 3 with a note to check statements
- If they have debt BUT have not yet captured employer match → still Milestone 1 first
- If they have a 401k/Roth 401k → check if they're capturing the full match before moving past M1
- If they have 1 retirement account but no Roth IRA or HSA → Milestone 4
- If they have 2+ accounts but aren't maxing → Milestone 5
- A high income does NOT automatically mean a high milestone — base it on actual saving behavior
- Age matters for tone: younger users get encouragement, older users get gentle urgency
- Always be encouraging — never make the user feel behind or hopeless

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUT-OF-ORDER MILESTONE RECOGNITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
People often complete milestones out of order without realizing it. Your job is to recognize this, celebrate what they have done, and guide them back to the right sequence warmly.

For every milestone assign one of these exact status strings in milestoneStatuses:
- "complete" — user has clearly achieved this milestone based on their answers
- "caution"  — milestone was NOT completed but the user has moved past it (they skipped it); flag this gently in your explanation
- "current"  — the lowest incomplete milestone and your recommendation (exactly ONE milestone gets this)
- "future"   — not yet reached
- "na"       — not applicable (ONLY for Milestone 1 when the user is self-employed, a contractor, a student, or unemployed — they have no employer match)

How to assign statuses:
1. Find the LOWEST incomplete (or skipped) milestone — assign it "current"
2. Every milestone numbered BELOW "current" that is confirmed done → "complete"
3. Every milestone numbered BELOW "current" that is NOT confirmed done → "caution"
4. Every milestone numbered ABOVE "current" → "future"
5. Milestone 1 for no-employer-match employment types → "na"

Milestone completion criteria:
- M1 complete: user has a 401k or Roth 401k AND their employer_match answer confirms they are capturing the full match
- M1 na: self-employed / contractor / student / unemployed
- M2 complete: emergency_fund_amount ≥ monthly_expenses × 3 (use the exact figures provided below)
- M3 complete: user explicitly states no high-interest debt
- M4 complete: user has a Roth IRA or HSA in their account types
- M5 complete: contributions are near IRS annual limits (rare — default to "caution" unless clearly maxed)
- M6 complete: user has a brokerage account

When you detect "caution" milestones (skipped), your explanation MUST follow this exact four-part structure:

PART 1 — Celebrate by NAME. Open by calling out the specific milestone numbers they have already completed. Do not be vague. Say "Milestone 2" and "Milestone 3" — not "some milestones" or "later steps."
  Example opener: "You have already knocked out Milestones 2 and 3 — that is impressive. Most people your age have not done either."

PART 2 — Name the skip directly. Tell them exactly which milestone they skipped. Use the phrase "you skipped Milestone X" or "you missed Milestone X." Be direct but warm — not accusatory.
  Example: "But we noticed you skipped Milestone 1 — and that one is worth going back for."

PART 3 — Explain WHY the skipped milestone matters. Give a concrete, specific reason tied to their situation. For Milestone 1: it is free money their employer is already offering. For Milestone 2: without it one bad month could force early retirement withdrawals with a penalty. Keep this to one or two sentences.

PART 4 — Give them the shortcut. Tell them that once they complete the skipped milestone, they can jump AHEAD — skipping the milestones they have already completed. Name the exact milestone they will jump to.
  Example: "Once you lock that in and start capturing your full employer match, you can skip straight to Milestone 4. You have already handled 2 and 3 — no need to revisit them."

Combination rules — always send them to the LOWEST incomplete milestone first, then tell them where they jump to:
- M2 complete, M1 not done → current = M1. Jump-to after completing M1 = M3. Say: "Once you have M1 locked in, jump straight to Milestone 3."
- M2 and M3 complete, M1 not done → current = M1. Jump-to = M4. Say: "Once you have M1 locked in, jump straight to Milestone 4. You have already handled 2 and 3."
- M3 complete, M1 and M2 not done → current = M1. After M1, next is M2 (not skippable — everyone needs the emergency fund). Say: "After M1, your next step is Milestone 2. Once you have both, you can jump straight to Milestone 4."
- M1 complete, M3 complete, M2 not done → current = M2. Jump-to after M2 = M4. Say: "Once your emergency fund is built, you can jump straight to Milestone 4. Milestone 3 is already behind you."

Frame every skipped milestone as an opportunity, never a mistake. The user made smart moves — they just did them in a slightly different order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S QUIZ ANSWERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Employment: ${body.employmentStatus}
- Health insurance plan: ${body.healthPlanType ?? 'Not answered'}
- Annual income: $${body.annualIncome}
- Monthly essential expenses: $${monthlyExpenses}/month (3-month emergency fund target: $${target3Month.toLocaleString('en-US')} | 6-month target: $${target6Month.toLocaleString('en-US')})
- Emergency fund status: ${body.emergencyFundStatus ?? 'Not answered'}
- Emergency fund amount: ${
  body.emergencyFundAmount != null
    ? `$${(body.emergencyFundAmount as number).toLocaleString('en-US')} — this covers approximately ${((body.emergencyFundAmount as number) / monthlyExpenses).toFixed(1)} months of their $${monthlyExpenses.toLocaleString('en-US')}/month expenses (3-month minimum target: $${target3Month.toLocaleString('en-US')} | 6-month goal: $${target6Month.toLocaleString('en-US')})`
    : 'Not provided — user has no emergency fund or is unsure of the amount'
}
- Retirement journey: ${journey}
- Accounts: ${accountTypes.length > 0 ? accountTypes.join(', ') : 'None'}
- Employer match status: ${body.employerMatch ?? 'Not asked (no 401k/Roth 401k selected)'}
- Account details:
${accountSummary}
- Current monthly retirement contributions (from account balances): $${(body.accountBalances as AccountBalance[])?.reduce((sum, a) => sum + (parseInt(a.contribution as string) || 0), 0) ?? 0}/month
- Willing to save per month going forward: $${body.futureMonthlySavings}/month
- Age: ${body.age} years old
- Retirement goal: ${body.retirementGoal}
- High-interest debt status: ${body.hasHighInterestDebt ?? 'Not answered'}
- High-interest debt details:
${debtSummary}
- Biggest concern: ${biggestConcern}
- Their description of their situation: ${openEnded}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You must respond with only a valid JSON object. Do not wrap it in markdown code blocks. Do not include any text before or after the JSON. Do not use triple backticks. Do not write \`\`\`json or \`\`\`. Your entire response must be parseable by JSON.parse() with no cleaning required.

Correct response (start your reply with the opening brace and end with the closing brace — nothing else):
{
  "milestone": <integer 1 through 6>,
  "milestoneStatuses": {
    "1": "<complete|caution|current|future|na>",
    "2": "<complete|caution|current|future|na>",
    "3": "<complete|caution|current|future|na>",
    "4": "<complete|caution|current|future|na>",
    "5": "<complete|caution|current|future|na>",
    "6": "<complete|caution|current|future|na>"
  },
  "explanation": "<2-3 sentences in warm, encouraging plain English — if any milestones are 'caution' (skipped), address that here using the guidance above>",
  "actionStep": "<one concrete, specific action the user can take TODAY — not generic advice, tailored to their exact situation and employment type>"
}`
}

// ─── AI placement (15-second timeout) ────────────────────────────────────────

async function getAiPlacement(body: Record<string, unknown>): Promise<{
  milestone: MilestoneNumber
  explanation: string
  actionStep: string
  milestoneStatuses: Record<string, string> | null
}> {
  console.log('[quiz/submit] Starting Anthropic API call...')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create(
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: buildPrompt(body) }],
    },
    { timeout: 15_000 }
  )

  console.log('[quiz/submit] Anthropic API responded. Parsing response...')

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('')

  console.log('[quiz/submit] Raw AI response text:', text.slice(0, 300))

  // Strip markdown code fences if the model wraps the JSON despite instructions.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  const parsed = JSON.parse(cleaned) as {
    milestone: number
    milestoneStatuses?: Record<string, string>
    explanation: string
    actionStep: string
  }

  const milestone = parsed.milestone as MilestoneNumber

  if (!milestone || milestone < 1 || milestone > 6) {
    throw new Error(`Invalid milestone from AI: ${milestone}`)
  }

  console.log(`[quiz/submit] AI chose Milestone ${milestone}`, parsed.milestoneStatuses ?? 'no statuses')

  return {
    milestone,
    explanation: parsed.explanation,
    actionStep: parsed.actionStep,
    milestoneStatuses: parsed.milestoneStatuses ?? null,
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    console.log('[quiz/submit] POST received')

    // 1. Verify the user is signed in
    const { userId } = await auth()
    if (!userId) {
      console.log('[quiz/submit] No userId — returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[quiz/submit] Authenticated. userId:', userId)

    // 2. Parse the request body
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const {
      employmentStatus,
      annualIncome,
      monthlyExpenses,
      retirementJourney,
      singleAccountType,
      singleAccountCustom,
      multipleAccountTypes,
      multipleAccountCustom,
      accountBalances,
      futureMonthlySavings,
      age,
      retirementGoal,
      biggestConcern,
      biggestConcernCustom,
      healthPlanType,
      employerMatch,
      emergencyFundStatus,
      emergencyFundAmount,
      hasHighInterestDebt,
      debtEntries,
      openEndedResponse,
      confirmedSummary,
    } = body

    console.log('[quiz/submit] Body parsed:', {
      employmentStatus, annualIncome, retirementJourney, age, futureMonthlySavings, retirementGoal,
    })

    // 3. Validate required fields
    if (
      typeof employmentStatus !== 'string' ||
      typeof annualIncome !== 'number' ||
      typeof monthlyExpenses !== 'number' ||
      typeof retirementJourney !== 'number' ||
      typeof age !== 'number' ||
      typeof futureMonthlySavings !== 'number' ||
      typeof retirementGoal !== 'string' ||
      typeof biggestConcern !== 'string'
    ) {
      console.log('[quiz/submit] Validation failed')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build fallback answers object for rule-based milestone logic
    const fallbackAnswers: QuizAnswers = {
      employmentStatus: employmentStatus as string,
      annualIncome: annualIncome as number,
      monthlyExpenses: monthlyExpenses as number,
      retirementJourney: retirementJourney as 1|2|3|4,
      singleAccountType: singleAccountType as string | undefined,
      singleAccountCustom: singleAccountCustom as string | undefined,
      multipleAccountTypes: (multipleAccountTypes as string[]) ?? [],
      multipleAccountCustom: multipleAccountCustom as string | undefined,
      accountBalances: (accountBalances as AccountBalance[]) ?? [],
      futureMonthlySavings: futureMonthlySavings as number,
      age: age as number,
      retirementGoal: retirementGoal as string,
      biggestConcern: biggestConcern as string,
      biggestConcernCustom: biggestConcernCustom as string | undefined,
      openEndedResponse: (openEndedResponse as string) ?? '',
      confirmedSummary: (confirmedSummary as string) ?? '',
    }

    // 4. Ask RAI (Claude) to analyze answers and determine the milestone.
    let milestone: MilestoneNumber
    let aiExplanation: string | null = null
    let aiActionStep: string | null = null
    let aiMilestoneStatuses: Record<string, string> | null = null

    try {
      const aiResult = await getAiPlacement(body)
      milestone = aiResult.milestone
      aiExplanation = aiResult.explanation
      aiActionStep = aiResult.actionStep
      aiMilestoneStatuses = aiResult.milestoneStatuses
      console.log('[quiz/submit] AI placement succeeded. Milestone:', milestone)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.log('[quiz/submit] AI placement failed:', errMsg)
      console.log('[quiz/submit] Falling back to rule-based milestone logic...')
      milestone = recommendMilestone(fallbackAnswers)
      console.log('[quiz/submit] Fallback milestone:', milestone)
    }

    // 5. Save to Supabase
    console.log('[quiz/submit] Saving to Supabase...')
    const supabase = createAdminClient()

    // Upsert user row — links Clerk user ID to a database row
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(
        { clerk_user_id: userId },
        { onConflict: 'clerk_user_id' }
      )
      .select('id')
      .single()

    if (userError || !userData) {
      console.log('[quiz/submit] Supabase user upsert error:', userError)
      return NextResponse.json({ ok: true, milestone, warning: 'Data not saved' })
    }

    console.log('[quiz/submit] User upserted. DB user id:', userData.id)

    // Upsert quiz response — overwrites if they retake the quiz
    const { error: quizError } = await supabase
      .from('quiz_responses')
      .upsert(
        {
          user_id: userData.id,

          // ── New quiz fields ──────────────────────────────────────────────────
          employment_status: employmentStatus,
          retirement_journey: retirementJourney,
          account_types: [
            ...((multipleAccountTypes as string[]) ?? []),
            ...(singleAccountType ? [singleAccountType as string] : []),
          ],
          account_balances: accountBalances ?? [],
          future_monthly_savings: futureMonthlySavings,
          age,
          retirement_age_goal: retirementGoal,
          health_plan_type: (healthPlanType as string) ?? null,
          employer_match: (employerMatch as string) ?? null,
          emergency_fund_status: (emergencyFundStatus as string) ?? null,
          emergency_fund_amount: (emergencyFundAmount as number) ?? null,
          high_interest_debt: (debtEntries as DebtEntry[])?.length > 0
            ? JSON.stringify(debtEntries)
            : (hasHighInterestDebt ? JSON.stringify({ status: hasHighInterestDebt }) : null),
          biggest_concern: biggestConcern,
          biggest_concern_custom: biggestConcernCustom ?? null,
          open_ended_response: (openEndedResponse as string) ?? null,
          confirmed_summary: (confirmedSummary as string) ?? null,
          recommended_milestone: milestone,
          ai_explanation: aiExplanation,
          ai_action_step: aiActionStep,
          milestone_statuses: aiMilestoneStatuses ?? null,

          monthly_expenses: monthlyExpenses as number,

          // ── Old schema columns — nulled out so stale data never lingers ──────
          retirement_status: retirementJourney, // kept for backward compat (nullable after migration)
          income: annualIncome as number,
          current_savings: null,
          future_savings: null,
        },
        { onConflict: 'user_id' }
      )

    if (quizError) {
      console.log('[quiz/submit] Supabase quiz upsert error:', quizError)
      return NextResponse.json({ ok: true, milestone, warning: 'Quiz data not saved' })
    }

    console.log('[quiz/submit] Quiz response saved. Returning milestone:', milestone)

    return NextResponse.json({ ok: true, milestone })

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[quiz/submit] Unexpected top-level error:', errMsg)
    return NextResponse.json({ ok: true, milestone: 1, warning: 'Unexpected error — showing default milestone' })
  }
}
