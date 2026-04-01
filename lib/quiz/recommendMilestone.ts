import { QuizAnswers, MilestoneNumber } from './types'

// Fallback logic used if the Claude API call fails.
// Infers a milestone from the new quiz answer structure.
export function recommendMilestone(answers: QuizAnswers): MilestoneNumber {
  const { retirementJourney, accountBalances, multipleAccountTypes, singleAccountType, currentMonthlySavings } = answers

  // Collect all account type names for quick lookup
  const accountTypes = multipleAccountTypes ?? (singleAccountType ? [singleAccountType] : [])
  const has401k = accountTypes.some(t => t === '401k' || t === 'Roth 401k')
  const hasRothOrHSA = accountTypes.some(t => t === 'Roth IRA' || t === 'HSA (Health Savings Account)')
  const hasBrokerage = accountTypes.some(t => t === 'Brokerage Account')

  const totalContribution = (accountBalances ?? []).reduce(
    (sum, a) => sum + (parseInt(a.contribution) || 0), 0
  )
  const savings = currentMonthlySavings ?? 0

  switch (retirementJourney) {
    case 1:
      // No retirement savings at all — start at M1 (get employer match)
      return 1

    case 2:
      // Personal savings only, no retirement account — M1 if no 401k yet, else M3
      return has401k ? 3 : 1

    case 3:
    case 4:
      // Has at least one retirement account
      if (!has401k) return 1                    // Should capture employer match first
      if (!hasRothOrHSA) return 4               // Open a Roth IRA or HSA next
      if (hasBrokerage && savings >= 1000) return 6  // Brokerage + high savings = M6
      if (totalContribution >= 500 || savings >= 500) return 5  // Max out contributions
      return 4

    default:
      return 1
  }
}
