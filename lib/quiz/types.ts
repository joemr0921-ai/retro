export type MilestoneNumber = 1 | 2 | 3 | 4 | 5 | 6

// Every possible question key in the quiz flow
export type QuestionKey =
  | 'q1'        // Employment status
  | 'q1a'       // Health insurance plan type
  | 'q1b'       // Annual income
  | 'q1c'       // Monthly essential expenses
  | 'q1d'       // Emergency fund status (yes / no / not sure)
  | 'q1e'       // Emergency fund amount (only if q1d = yes)
  | 'q2'        // Retirement journey (determines branching)
  | 'q3a'       // Single account type  (only if q2 = 3)
  | 'q3b'       // Multiple account types (only if q2 = 4)
  | 'q3c'       // Employer match status (only if 401k or Roth 401k selected in q3a/q3b)
  | 'q4'        // Account balances per account (only if q2 = 3 or 4)
  | 'q_debt_a'  // High-interest debt check (everyone)
  | 'q_debt_b'  // Debt details (only if q_debt_a = yes)
  | 'q6'        // Future monthly savings
  | 'q7'     // Age
  | 'q8'     // Retirement goal
  | 'q9'     // Biggest concern
  | 'q10'    // Open ended (optional)
  | 'review' // Summary/confirm screen — user reads and submits

// One debt row in Q_DEBT_B
export interface DebtEntry {
  type: string    // e.g. "Credit Card"
  amount: string  // stored as string so input can be empty; parse to number when using
  rate: string    // optional; empty string means not provided
}

// One account row in Q4
export interface AccountBalance {
  accountType: string   // display name, e.g. "Roth IRA" or the custom text for "Other"
  balance: string       // stored as string so input can be empty; parse to number when using
  contribution: string  // stored as string for same reason
}

export interface QuizAnswers {
  // Q1
  employmentStatus?: string
  // Q1A
  healthPlanType?: string
  // Q1B
  annualIncome?: number
  // Q1C
  monthlyExpenses?: number
  // Q1D
  emergencyFundStatus?: string
  // Q1E — only populated when emergencyFundStatus === 'Yes...'
  emergencyFundAmount?: number
  // Q2 — 1=no saving, 2=personal savings only, 3=one account, 4=multiple accounts
  retirementJourney?: 1 | 2 | 3 | 4
  // Q3A
  singleAccountType?: string
  singleAccountCustom?: string
  // Q3B
  multipleAccountTypes?: string[]
  multipleAccountCustom?: string
  // Q3C — only present when 401k or Roth 401k was selected
  employerMatch?: string
  // Q4
  accountBalances?: AccountBalance[]
  // Q_DEBT_A
  hasHighInterestDebt?: string
  // Q_DEBT_B (only populated when hasHighInterestDebt === 'Yes, I have high-interest debt')
  debtEntries?: DebtEntry[]
  // Q6
  futureMonthlySavings?: number
  // Q7
  age?: number
  // Q8
  retirementGoal?: string
  // Q9
  biggestConcern?: string
  biggestConcernCustom?: string
  // Q10 — optional
  openEndedResponse?: string
  // Generated on the review screen, confirmed by user before submission
  confirmedSummary?: string
}

export interface MilestoneContent {
  number: MilestoneNumber
  title: string
  tagline: string
  primaryAction: string
  bullets: string[]
  color: 'coral' | 'teal' | 'yellow'
}

// The personalized content returned by the AI and stored in Supabase
export interface AiPlacement {
  milestone: MilestoneNumber
  explanation: string   // 2-3 sentences explaining why this milestone
  actionStep: string    // one specific action tailored to their situation
}

// Status badge shown on each milestone row in the results timeline
// 'skipped' = this is the current recommended milestone BUT the user has
// already completed a later milestone out of order — show coral + ⚠️ overlay
export type MilestoneStatus = 'complete' | 'caution' | 'current' | 'skipped' | 'future'
