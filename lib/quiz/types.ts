export type MilestoneNumber = 1 | 2 | 3 | 4 | 5 | 6

// Every possible question key in the quiz flow
export type QuestionKey =
  | 'q1'     // Employment status
  | 'q2'     // Retirement journey (determines branching)
  | 'q3a'    // Single account type  (only if q2 = 3)
  | 'q3b'    // Multiple account types (only if q2 = 4)
  | 'q4'     // Account balances per account (only if q2 = 3 or 4)
  | 'q5'     // Current monthly savings
  | 'q6'     // Future monthly savings
  | 'q7'     // Age
  | 'q8'     // Retirement goal
  | 'q9'     // Biggest concern
  | 'q10'    // Open ended (optional)
  | 'review' // Summary/confirm screen — user reads and submits

// One account row in Q4
export interface AccountBalance {
  accountType: string   // display name, e.g. "Roth IRA" or the custom text for "Other"
  balance: string       // stored as string so input can be empty; parse to number when using
  contribution: string  // stored as string for same reason
}

export interface QuizAnswers {
  // Q1
  employmentStatus?: string
  // Q2 — 1=no saving, 2=personal savings only, 3=one account, 4=multiple accounts
  retirementJourney?: 1 | 2 | 3 | 4
  // Q3A
  singleAccountType?: string
  singleAccountCustom?: string
  // Q3B
  multipleAccountTypes?: string[]
  multipleAccountCustom?: string
  // Q4
  accountBalances?: AccountBalance[]
  // Q5
  currentMonthlySavings?: number
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
export type MilestoneStatus = 'complete' | 'caution' | 'current' | 'future'
