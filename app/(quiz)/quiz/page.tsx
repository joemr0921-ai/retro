'use client'

import { useReducer, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QuizAnswers, QuestionKey, AccountBalance } from '@/lib/quiz/types'
import QuizShell from '@/components/quiz/QuizShell'
import Q1EmploymentStatus from '@/components/quiz/questions/Q1EmploymentStatus'
import Q1BIncome from '@/components/quiz/questions/Q1BIncome'
import Q1CMonthlyExpenses from '@/components/quiz/questions/Q1CMonthlyExpenses'
import Q1DEmergencyFund from '@/components/quiz/questions/Q1DEmergencyFund'
import Q1EEmergencyFundAmount from '@/components/quiz/questions/Q1EEmergencyFundAmount'
import Q2RetirementJourney from '@/components/quiz/questions/Q2RetirementJourney'
import Q3AAccountType from '@/components/quiz/questions/Q3AAccountType'
import Q3BAccountTypes from '@/components/quiz/questions/Q3BAccountTypes'
import Q3CEmployerMatch from '@/components/quiz/questions/Q3CEmployerMatch'
import Q4AccountBalances from '@/components/quiz/questions/Q4AccountBalances'
import QDebtA from '@/components/quiz/questions/QDebtA'
import QDebtB from '@/components/quiz/questions/QDebtB'
import Q6FutureSavings from '@/components/quiz/questions/Q6FutureSavings'
import Q7Age from '@/components/quiz/questions/Q7Age'
import Q8RetirementGoal from '@/components/quiz/questions/Q8RetirementGoal'
import Q9BiggestConcern from '@/components/quiz/questions/Q9BiggestConcern'
import Q10OpenEnded from '@/components/quiz/questions/Q10OpenEnded'
import Q11Review from '@/components/quiz/questions/Q11Review'
import { cn } from '@/lib/utils'

// ─── Question sequence logic ───────────────────────────────────────────────────
//
// The sequence is dynamic:
//   - Q3A/Q3B/Q4 only appear if the user chose option 3 or 4 in Q2.
//   - Q3C only appears if 401k or Roth 401k was selected in Q3A or Q3B.
//   - Options 1 and 2 in Q2 skip straight to Q5.

function has401k(answers: Partial<QuizAnswers>): boolean {
  if (answers.retirementJourney === 3) {
    return answers.singleAccountType === '401k' || answers.singleAccountType === 'Roth 401k'
  }
  if (answers.retirementJourney === 4) {
    return (answers.multipleAccountTypes ?? []).some(
      (t) => t === '401k' || t === 'Roth 401k'
    )
  }
  return false
}

function getSequence(answers: Partial<QuizAnswers>): QuestionKey[] {
  const seq: QuestionKey[] = ['q1', 'q1b', 'q1c', 'q1d']
  if (answers.emergencyFundStatus === 'Yes, I have money set aside in a savings account for emergencies') {
    seq.push('q1e')
  }
  seq.push('q2')

  if (answers.retirementJourney === 3) {
    seq.push('q3a')
    if (has401k(answers)) seq.push('q3c')
    seq.push('q4')
  } else if (answers.retirementJourney === 4) {
    seq.push('q3b')
    if (has401k(answers)) seq.push('q3c')
    seq.push('q4')
  }

  seq.push('q_debt_a')
  if (
    answers.hasHighInterestDebt === 'Yes, I have high-interest debt' ||
    answers.hasHighInterestDebt === "I have debt but I'm not sure of the interest rates"
  ) seq.push('q_debt_b')
  seq.push('q6', 'q7', 'q8', 'q9', 'q10', 'review')
  return seq
}

// ─── Validation per question ───────────────────────────────────────────────────

function isQuestionValid(q: QuestionKey, answers: Partial<QuizAnswers>): boolean {
  switch (q) {
    case 'q1':
      return !!answers.employmentStatus
    case 'q1b':
      return typeof answers.annualIncome === 'number' && answers.annualIncome > 0
    case 'q1c':
      return typeof answers.monthlyExpenses === 'number' && answers.monthlyExpenses > 0
    case 'q1d':
      return !!answers.emergencyFundStatus
    case 'q1e':
      return typeof answers.emergencyFundAmount === 'number' && answers.emergencyFundAmount >= 0
    case 'q2':
      return answers.retirementJourney !== undefined
    case 'q3a':
      if (!answers.singleAccountType) return false
      if (answers.singleAccountType === 'Other') return !!answers.singleAccountCustom?.trim()
      return true
    case 'q3b':
      return (answers.multipleAccountTypes?.length ?? 0) > 0
    case 'q3c':
      return !!answers.employerMatch
    case 'q4': {
      const balances = answers.accountBalances ?? []
      if (balances.length === 0) return false
      return balances.every((b) => b.balance.trim() !== '' && b.contribution.trim() !== '')
    }
    case 'q_debt_a':
      return !!answers.hasHighInterestDebt
    case 'q_debt_b': {
      const entries = answers.debtEntries ?? []
      if (entries.length === 0) return false
      return entries.every((e) => e.type.trim() !== '' && e.amount.trim() !== '')
    }
    case 'q6':
      return typeof answers.futureMonthlySavings === 'number' && answers.futureMonthlySavings >= 0
    case 'q7':
      return typeof answers.age === 'number' && answers.age >= 18 && answers.age <= 80
    case 'q8':
      return !!answers.retirementGoal
    case 'q9':
      if (!answers.biggestConcern) return false
      if (answers.biggestConcern === 'Other') return !!answers.biggestConcernCustom?.trim()
      return true
    case 'q10':
      return true // optional
    case 'review':
      return true // Q11Review handles its own submit
    default:
      return false
  }
}

// ─── State ────────────────────────────────────────────────────────────────────

interface QuizState {
  currentQuestion: QuestionKey
  answers: Partial<QuizAnswers>
  isSubmitting: boolean
  error: string | null
}

type QuizAction =
  | { type: 'SET_ANSWER'; patch: Partial<QuizAnswers> }
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ERROR'; value: string | null }
  | { type: 'RESET' }

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const newAnswers = { ...state.answers, ...action.patch }
      // When retirementJourney changes, clear all branch-dependent data.
      if ('retirementJourney' in action.patch) {
        delete newAnswers.singleAccountType
        delete newAnswers.singleAccountCustom
        delete newAnswers.multipleAccountTypes
        delete newAnswers.multipleAccountCustom
        delete newAnswers.accountBalances
        delete newAnswers.employerMatch
      }
      // When single account type changes away from 401k/Roth 401k, clear employer match
      // so a stale answer from a previous selection doesn't survive.
      if ('singleAccountType' in action.patch) {
        const t = action.patch.singleAccountType
        if (t !== '401k' && t !== 'Roth 401k') delete newAnswers.employerMatch
      }
      // Same for multi-select: if 401k and Roth 401k are both deselected, clear it.
      if ('multipleAccountTypes' in action.patch) {
        const types = action.patch.multipleAccountTypes ?? []
        if (!types.includes('401k') && !types.includes('Roth 401k')) {
          delete newAnswers.employerMatch
        }
      }
      // When emergency fund status changes away from "Yes", clear the amount.
      if ('emergencyFundStatus' in action.patch &&
          action.patch.emergencyFundStatus !== 'Yes, I have money set aside in a savings account for emergencies') {
        delete newAnswers.emergencyFundAmount
      }
      // Clear debt details only when the user picks the "no debt" option.
      if ('hasHighInterestDebt' in action.patch &&
          action.patch.hasHighInterestDebt === 'No, I have no high-interest debt') {
        delete newAnswers.debtEntries
      }
      return { ...state, answers: newAnswers, error: null }
    }

    case 'GO_NEXT': {
      const seq = getSequence(state.answers)
      const idx = seq.indexOf(state.currentQuestion)
      const nextKey = seq[idx + 1]
      if (!nextKey) return state

      let newAnswers = state.answers

      // When advancing into Q4, initialize accountBalances from the accounts selected
      // in Q3A or Q3B. Preserves previously entered balance data if going back/forward.
      if (nextKey === 'q4') {
        let rawTypes: string[]

        if (state.answers.retirementJourney === 3) {
          const t = state.answers.singleAccountType ?? ''
          rawTypes =
            t === 'Other'
              ? [state.answers.singleAccountCustom?.trim() || 'Other account']
              : t
              ? [t]
              : []
        } else {
          rawTypes = (state.answers.multipleAccountTypes ?? []).map((t) =>
            t === 'Other'
              ? state.answers.multipleAccountCustom?.trim() || 'Other account'
              : t
          )
        }

        const prevMap = new Map(
          (state.answers.accountBalances ?? []).map((b) => [b.accountType, b])
        )
        const accountBalances: AccountBalance[] = rawTypes.map(
          (type) => prevMap.get(type) ?? { accountType: type, balance: '', contribution: '' }
        )

        newAnswers = { ...state.answers, accountBalances }
      }

      return { ...state, answers: newAnswers, currentQuestion: nextKey }
    }

    case 'GO_BACK': {
      const seq = getSequence(state.answers)
      const idx = seq.indexOf(state.currentQuestion)
      const prevKey = seq[idx - 1]
      if (!prevKey) return state
      return { ...state, currentQuestion: prevKey, error: null }
    }

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value }

    case 'SET_ERROR':
      return { ...state, error: action.value }

    case 'RESET':
      return { currentQuestion: 'q1', answers: {}, isSubmitting: false, error: null }

    default:
      return state
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter()

  const [state, dispatch] = useReducer(reducer, {
    currentQuestion: 'q1',
    answers: {},
    isSubmitting: false,
    error: null,
  })

  const { currentQuestion, answers, isSubmitting, error } = state
  const sequence = getSequence(answers)
  const stepIndex = sequence.indexOf(currentQuestion)
  const totalSteps = sequence.length
  const valid = isQuestionValid(currentQuestion, answers)
  const isReview = currentQuestion === 'review'

  // ─── Enter key advances to next question ─────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if (e.target instanceof HTMLTextAreaElement) return
      if (isReview || !valid) return
      e.preventDefault() // stops button click from also firing when a button has focus
      dispatch({ type: 'GO_NEXT' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isReview, valid])

  function handleBack() {
    if (currentQuestion === 'q1') {
      router.push('/dashboard')
    } else {
      dispatch({ type: 'GO_BACK' })
    }
  }

  function handleNext() {
    if (!valid) return
    dispatch({ type: 'GO_NEXT' })
  }

  async function handleSubmit(confirmedSummary: string) {
    dispatch({ type: 'SET_SUBMITTING', value: true })
    dispatch({ type: 'SET_ERROR', value: null })

    // Client-side 25-second timeout — safety net if server doesn't respond.
    // The server has its own 15-second AI timeout and always returns a fallback.
    const controller = new AbortController()
    const clientTimeout = setTimeout(() => controller.abort(), 25_000)

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employmentStatus: answers.employmentStatus,
          annualIncome: answers.annualIncome ?? 0,
          monthlyExpenses: answers.monthlyExpenses ?? 0,
          retirementJourney: answers.retirementJourney,
          singleAccountType: answers.singleAccountType,
          singleAccountCustom: answers.singleAccountCustom,
          multipleAccountTypes: answers.multipleAccountTypes ?? [],
          multipleAccountCustom: answers.multipleAccountCustom,
          accountBalances: answers.accountBalances ?? [],
          futureMonthlySavings: answers.futureMonthlySavings ?? 0,
          age: answers.age,
          retirementGoal: answers.retirementGoal,
          biggestConcern: answers.biggestConcern,
          biggestConcernCustom: answers.biggestConcernCustom,
          employerMatch: answers.employerMatch ?? null,
          emergencyFundStatus: answers.emergencyFundStatus ?? null,
          emergencyFundAmount: answers.emergencyFundAmount ?? null,
          hasHighInterestDebt: answers.hasHighInterestDebt ?? null,
          debtEntries: answers.debtEntries ?? [],
          openEndedResponse: answers.openEndedResponse ?? '',
          confirmedSummary,
        }),
      })

      clearTimeout(clientTimeout)

      const data = await res.json()
      const milestone = data.milestone ?? 1
      router.push(`/quiz/results?m=${milestone}`)
    } catch {
      clearTimeout(clientTimeout)
      dispatch({ type: 'SET_SUBMITTING', value: false })
      dispatch({ type: 'SET_ERROR', value: 'Something went wrong. Please try again.' })
    }
  }

  // ─── Loading screen while RAI is analyzing ────────────────────────────────

  if (isSubmitting) {
    return (
      <QuizShell step={totalSteps} totalSteps={totalSteps} onBack={() => {}}>
        <div className="flex flex-col items-center justify-center text-center py-8 gap-6 animate-fade-up">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#FAFAF0] mb-2">
              RAI is analyzing your answers...
            </h2>
            <p className="text-[#FAFAF0]/50 text-sm">
              RAI is reviewing your situation and finding your milestone.
            </p>
            <p className="text-[#FAFAF0]/30 text-xs font-mono mt-2">
              Usually takes 5–15 seconds
            </p>
          </div>
        </div>
      </QuizShell>
    )
  }

  // ─── Quiz question screens ─────────────────────────────────────────────────

  return (
    <QuizShell step={stepIndex + 1} totalSteps={totalSteps} onBack={handleBack}>
      {/* key forces re-mount + fade-up animation on each step change */}
      <div key={currentQuestion} className="animate-fade-up">
        {currentQuestion === 'q1' && (
          <Q1EmploymentStatus
            value={answers.employmentStatus}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { employmentStatus: v } })}
          />
        )}

        {currentQuestion === 'q1b' && (
          <Q1BIncome
            value={answers.annualIncome}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { annualIncome: v } })}
          />
        )}

        {currentQuestion === 'q1c' && (
          <Q1CMonthlyExpenses
            value={answers.monthlyExpenses}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { monthlyExpenses: v } })}
          />
        )}

        {currentQuestion === 'q1d' && (
          <Q1DEmergencyFund
            value={answers.emergencyFundStatus}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { emergencyFundStatus: v } })}
          />
        )}

        {currentQuestion === 'q1e' && (
          <Q1EEmergencyFundAmount
            value={answers.emergencyFundAmount}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { emergencyFundAmount: v } })}
          />
        )}

        {currentQuestion === 'q2' && (
          <Q2RetirementJourney
            value={answers.retirementJourney}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { retirementJourney: v } })}
          />
        )}

        {currentQuestion === 'q3a' && (
          <Q3AAccountType
            value={answers.singleAccountType}
            customValue={answers.singleAccountCustom}
            onChange={(account, custom) =>
              dispatch({ type: 'SET_ANSWER', patch: { singleAccountType: account, singleAccountCustom: custom } })
            }
          />
        )}

        {currentQuestion === 'q3b' && (
          <Q3BAccountTypes
            value={answers.multipleAccountTypes ?? []}
            customValue={answers.multipleAccountCustom}
            onChange={(accounts, custom) =>
              dispatch({ type: 'SET_ANSWER', patch: { multipleAccountTypes: accounts, multipleAccountCustom: custom } })
            }
          />
        )}

        {currentQuestion === 'q3c' && (
          <Q3CEmployerMatch
            value={answers.employerMatch}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { employerMatch: v } })}
          />
        )}

        {currentQuestion === 'q4' && (
          <Q4AccountBalances
            accounts={answers.accountBalances ?? []}
            onChange={(balances) =>
              dispatch({ type: 'SET_ANSWER', patch: { accountBalances: balances } })
            }
          />
        )}

        {currentQuestion === 'q_debt_a' && (
          <QDebtA
            value={answers.hasHighInterestDebt}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { hasHighInterestDebt: v } })}
          />
        )}

        {currentQuestion === 'q_debt_b' && (
          <QDebtB
            value={answers.debtEntries ?? []}
            onChange={(entries) => dispatch({ type: 'SET_ANSWER', patch: { debtEntries: entries } })}
          />
        )}

        {currentQuestion === 'q6' && (
          <Q6FutureSavings
            retirementJourney={answers.retirementJourney}
            accountBalances={answers.accountBalances ?? []}
            value={answers.futureMonthlySavings}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { futureMonthlySavings: v } })}
          />
        )}

        {currentQuestion === 'q7' && (
          <Q7Age
            value={answers.age}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { age: v } })}
          />
        )}

        {currentQuestion === 'q8' && (
          <Q8RetirementGoal
            value={answers.retirementGoal}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { retirementGoal: v } })}
          />
        )}

        {currentQuestion === 'q9' && (
          <Q9BiggestConcern
            value={answers.biggestConcern}
            customValue={answers.biggestConcernCustom}
            onChange={(v, custom) =>
              dispatch({ type: 'SET_ANSWER', patch: { biggestConcern: v, biggestConcernCustom: custom } })
            }
          />
        )}

        {currentQuestion === 'q10' && (
          <Q10OpenEnded
            value={answers.openEndedResponse ?? ''}
            onChange={(v) => dispatch({ type: 'SET_ANSWER', patch: { openEndedResponse: v } })}
          />
        )}

        {/* The review screen renders its own confirm + reset buttons */}
        {currentQuestion === 'review' && (
          <Q11Review
            answers={answers}
            onConfirm={handleSubmit}
            onReset={() => dispatch({ type: 'RESET' })}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-coral-400 text-sm font-mono text-center">{error}</p>
      )}

      {/* Next button — hidden on the review screen (Q11Review has its own buttons) */}
      {!isReview && (
        <div className="mt-8">
          <button
            type="button"
            onClick={handleNext}
            disabled={!valid}
            className={cn(
              'w-full py-4 rounded-xl font-display font-bold text-base transition-all duration-150',
              valid
                ? 'bg-coral-400 text-[#0F0F0F] shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                : 'bg-[#2A2A2A] text-[#FAFAF0]/30 cursor-not-allowed'
            )}
          >
            Next →
          </button>
        </div>
      )}
    </QuizShell>
  )
}
