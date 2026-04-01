import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { recommendMilestone } from '@/lib/quiz/recommendMilestone'
import { MilestoneNumber, QuizAnswers, AccountBalance } from '@/lib/quiz/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JOURNEY_LABELS: Record<number, string> = {
  1: "Does not save toward retirement at all",
  2: "Only saves to a personal savings account — no retirement investing",
  3: "Saves to exactly one retirement account",
  4: "Saves to multiple retirement accounts and/or investments",
}

function buildPrompt(body: Record<string, unknown>): string {
  const journey = JOURNEY_LABELS[body.retirementJourney as number] ?? 'Unknown'
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

  return `You are RAI — ReTro's Retirement Advice Intelligence. You are warm, encouraging, and speak in plain English. You never use jargon without explaining it. You always make the user feel capable of improving their situation regardless of where they are starting from.

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
- Employer match is an instant return on your money — 50% or 100% match on your contribution, depending on the employer. Who says no to free money?
- This always comes before anything else: before paying extra debt, before opening a Roth IRA, before anything. Free money first.
- Age and income matter for tone: a 22-year-old just starting out gets encouragement; a 35-year-old who has been missing the match for years gets gentle urgency about the compounding cost.
- If the user doesn't know their match: encourage them to check their most recent pay stub for their current 401k contribution %, then contact HR to find out the employer match %. One conversation could be worth thousands of dollars.
- If the user doesn't know if their employer offers a match: encourage them to ask HR this week. It takes one email and the answer could change everything.

MILESTONE 2 — Build Your Safety Net (Emergency Fund)
Save 3-6 months of living expenses in a liquid account before investing.

Who this applies to: Everyone — no exceptions.
Completed when: User has 3-6 months (or more) of living expenses saved in an accessible account.

Key talking points for Milestone 2:
- 59% of Americans in 2025 cannot cover a $1,000 surprise expense. ReTro wants you on the other side of that number.
- 80% of Gen Zers worry about covering immediate expenses if they lost their income tomorrow. You don't have to be in that group.
- Without an emergency fund, one unexpected expense — a car repair, a medical bill, a job loss — could force you to pull from retirement accounts early. Early withdrawals come with a 10% IRS penalty plus income taxes. One bad month could cost you years of progress.
- Your monthly baseline number is the foundation: add up every consistent expense (rent, utilities, car payment, subscriptions) plus realistic estimates for variables (groceries, gas, eating out, hobbies). That total is your monthly number. 3x = minimum target. 6x = goal.
- Keep the emergency fund in a high-yield savings account (HYSA) — it should earn interest while it waits, not sit flat in a checking account.
- Revisit this number once a year or any time your life changes significantly: new home, new job, new family member.

Response guidance by situation for Milestone 2:
- User has 3-6 months saved → Milestone 2 complete. Acknowledge it, remind them to keep funds in a HYSA and revisit as expenses grow.
- User has more than 6 months saved → Milestone 2 complete. Celebrate it, note that the fund should grow with their lifestyle.
- User has some savings but less than 3 months → Milestone 2 is current. Help them calculate their monthly number and set a 3-month target first.
- User has no emergency fund → Milestone 2 is current with urgency. Use the 59% stat, explain the retirement penalty risk, guide them to calculate their monthly baseline today.
- User isn't sure how much they have → Milestone 2 needs attention. Encourage them to check their savings balance today and calculate their monthly baseline.

MILESTONE 3 — Eliminate High-Interest Debt
Pay off any debt with an interest rate above 6% before investing further.

Key rule: If the user mentions credit cards, personal loans, or high-interest debt anywhere in their answers, assign Milestone 3.

MILESTONE 4 — Open Tax-Advantaged Accounts
Open a Roth IRA and/or an HSA. For people who are saving but haven't opened these specific account types yet.

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
- If they mention ANY debt, credit cards, or loans → Milestone 3
- If they have a 401k/Roth 401k → check if they're capturing the full match before moving past M1
- If they have 1 retirement account but no Roth IRA or HSA → Milestone 4
- If they have 2+ accounts but aren't maxing → Milestone 5
- A high income does NOT automatically mean a high milestone — base it on actual saving behavior
- Age matters for tone: younger users get encouragement, older users get gentle urgency
- Always be encouraging — never make the user feel behind or hopeless

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S QUIZ ANSWERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Employment: ${body.employmentStatus}
- Retirement journey: ${journey}
- Accounts: ${accountTypes.length > 0 ? accountTypes.join(', ') : 'None'}
- Employer match status: ${body.employerMatch ?? 'Not asked (no 401k/Roth 401k selected)'}
- Account details:
${accountSummary}
- Current monthly savings (all goals): $${body.currentMonthlySavings}/month
- Willing to save per month going forward: $${body.futureMonthlySavings}/month
- Age: ${body.age} years old
- Retirement goal: ${body.retirementGoal}
- Biggest concern: ${biggestConcern}
- Their description of their situation: ${openEnded}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You must respond with only a valid JSON object. Do not wrap it in markdown code blocks. Do not include any text before or after the JSON. Do not use triple backticks. Do not write \`\`\`json or \`\`\`. Your entire response must be parseable by JSON.parse() with no cleaning required.

Correct response (start your reply with the opening brace and end with the closing brace — nothing else):
{
  "milestone": <integer 1 through 6>,
  "explanation": "<2-3 sentences in warm, encouraging plain English — explain specifically why this milestone fits their situation, using relevant talking points from above>",
  "actionStep": "<one concrete, specific action the user can take TODAY — not generic advice, tailored to their exact situation and employment type>"
}`
}

// ─── AI placement (15-second timeout) ────────────────────────────────────────

async function getAiPlacement(body: Record<string, unknown>): Promise<{
  milestone: MilestoneNumber
  explanation: string
  actionStep: string
}> {
  console.log('[quiz/submit] Starting Anthropic API call...')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create(
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: buildPrompt(body) }],
    },
    { timeout: 15_000 }
  )

  console.log('[quiz/submit] Anthropic API responded. Parsing response...')

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('')

  console.log('[quiz/submit] Raw AI response text:', text.slice(0, 200))

  // Strip markdown code fences if the model wraps the JSON despite instructions.
  // Matches ```json ... ``` or ``` ... ``` and extracts just the inner content.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  const parsed = JSON.parse(cleaned) as {
    milestone: number
    explanation: string
    actionStep: string
  }

  const milestone = parsed.milestone as MilestoneNumber

  if (!milestone || milestone < 1 || milestone > 6) {
    throw new Error(`Invalid milestone from AI: ${milestone}`)
  }

  console.log(`[quiz/submit] AI chose Milestone ${milestone}`)

  return {
    milestone,
    explanation: parsed.explanation,
    actionStep: parsed.actionStep,
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
      retirementJourney,
      singleAccountType,
      singleAccountCustom,
      multipleAccountTypes,
      multipleAccountCustom,
      accountBalances,
      currentMonthlySavings,
      futureMonthlySavings,
      age,
      retirementGoal,
      biggestConcern,
      biggestConcernCustom,
      employerMatch,
      openEndedResponse,
      confirmedSummary,
    } = body

    console.log('[quiz/submit] Body parsed:', {
      employmentStatus, retirementJourney, age, currentMonthlySavings, futureMonthlySavings, retirementGoal,
    })

    // 3. Validate required fields
    if (
      typeof employmentStatus !== 'string' ||
      typeof retirementJourney !== 'number' ||
      typeof age !== 'number' ||
      typeof currentMonthlySavings !== 'number' ||
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
      retirementJourney: retirementJourney as 1|2|3|4,
      singleAccountType: singleAccountType as string | undefined,
      singleAccountCustom: singleAccountCustom as string | undefined,
      multipleAccountTypes: (multipleAccountTypes as string[]) ?? [],
      multipleAccountCustom: multipleAccountCustom as string | undefined,
      accountBalances: (accountBalances as AccountBalance[]) ?? [],
      currentMonthlySavings: currentMonthlySavings as number,
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

    try {
      const aiResult = await getAiPlacement(body)
      milestone = aiResult.milestone
      aiExplanation = aiResult.explanation
      aiActionStep = aiResult.actionStep
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
          current_monthly_savings: currentMonthlySavings,
          future_monthly_savings: futureMonthlySavings,
          age,
          retirement_age_goal: retirementGoal,
          employer_match: (employerMatch as string) ?? null,
          biggest_concern: biggestConcern,
          biggest_concern_custom: biggestConcernCustom ?? null,
          open_ended_response: (openEndedResponse as string) ?? null,
          confirmed_summary: (confirmedSummary as string) ?? null,
          recommended_milestone: milestone,
          ai_explanation: aiExplanation,
          ai_action_step: aiActionStep,

          // ── Old schema columns — nulled out so stale data never lingers ──────
          retirement_status: retirementJourney, // kept for backward compat (nullable after migration)
          income: null,
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
