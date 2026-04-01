'use client'

import { useState } from 'react'
import { QuizAnswers } from '@/lib/quiz/types'
import { cn } from '@/lib/utils'

// ─── Summary generation ────────────────────────────────────────────────────────

function buildSummary(answers: Partial<QuizAnswers>): string {
  const parts: string[] = []

  // Employment status
  const empMap: Record<string, string> = {
    'W2 Employee (traditional paycheck from employer)': 'a W2 employee',
    'Self-Employed / Sole Proprietor': 'self-employed',
    'Business Owner with employees': 'a business owner with employees',
    'Independent Contractor / 1099': 'an independent contractor',
    'Part-time / Seasonal worker': 'a part-time or seasonal worker',
    'Student': 'a student',
    'Unemployed / Between jobs': 'currently between jobs',
  }
  const empPhrase = empMap[answers.employmentStatus ?? ''] ?? (answers.employmentStatus ?? 'employed')
  const income = answers.annualIncome ?? 0

  // Retirement journey
  const journeyMap: Record<number, string> = {
    1: "don't currently save toward retirement",
    2: "save to a personal savings account but don't invest in a retirement account",
    3: 'save to one retirement account',
    4: 'save to multiple retirement accounts and other investments',
  }
  const journeyPhrase = journeyMap[answers.retirementJourney ?? 1] ?? 'are at an unknown savings stage'
  const expenses = answers.monthlyExpenses ?? 0
  parts.push(`You are ${empPhrase} earning $${income.toLocaleString()}/year with $${expenses.toLocaleString()}/month in essential expenses, and you ${journeyPhrase}.`)

  // Account details
  if (answers.accountBalances && answers.accountBalances.length > 0) {
    const lines = answers.accountBalances.map((a) => {
      const bal = parseInt(a.balance) || 0
      const contrib = parseInt(a.contribution) || 0
      return `${a.accountType} (balance: $${bal.toLocaleString()}, contributing $${contrib.toLocaleString()}/month)`
    })
    const acctList =
      lines.length === 1
        ? lines[0]
        : lines.slice(0, -1).join(', ') + ', and ' + lines[lines.length - 1]
    parts.push(
      `Your current account${answers.accountBalances.length > 1 ? 's include' : ' is'} ${acctList}.`
    )
  }

  // High-interest debt
  if (answers.hasHighInterestDebt === 'Yes, I have high-interest debt' && answers.debtEntries && answers.debtEntries.length > 0) {
    const debtList = answers.debtEntries
      .map((d) => `${d.type} ($${parseInt(d.amount).toLocaleString() || '?'}${d.rate ? ` at ${d.rate}%` : ''})`)
      .join(', ')
    parts.push(`You have high-interest debt: ${debtList}.`)
  } else if (answers.hasHighInterestDebt === "I have debt but I'm not sure of the interest rates") {
    parts.push("You have debt but are unsure of the interest rates.")
  } else if (answers.hasHighInterestDebt === 'No, I have no high-interest debt') {
    parts.push("You have no high-interest debt.")
  }

  // Future savings intent
  const future = answers.futureMonthlySavings ?? 0
  parts.push(`Going forward, you are willing to put $${future.toLocaleString()}/month toward retirement.`)

  // Age + retirement goal
  const age = answers.age ?? 0
  const goalMap: Record<string, string> = {
    'Before 50': 'before age 50',
    '50-60': 'between 50 and 60',
    '60-65': 'between 60 and 65',
    '65-70': 'between 65 and 70',
    "I haven't thought about it yet": 'whenever the time feels right',
  }
  const goalPhrase = goalMap[answers.retirementGoal ?? ''] ?? (answers.retirementGoal ?? 'at an unspecified age')
  parts.push(`You are ${age} years old and hope to retire ${goalPhrase}.`)

  // Biggest concern
  const concernMap: Record<string, string> = {
    "I don't know where to start": 'not knowing where to start',
    "I don't make enough to save": 'not making enough to save',
    "I don't understand the account types": 'not fully understanding the different account types',
    'I feel too far behind': 'feeling too far behind',
    'I just keep putting it off': 'putting it off',
  }
  const concernPhrase =
    answers.biggestConcern === 'Other'
      ? answers.biggestConcernCustom || 'a personal concern'
      : concernMap[answers.biggestConcern ?? ''] ?? (answers.biggestConcern ?? 'an unspecified concern')
  parts.push(`Your biggest concern about retirement is ${concernPhrase}.`)

  return parts.join(' ')
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  answers: Partial<QuizAnswers>
  onConfirm: (summary: string) => void
  onReset: () => void
  isSubmitting: boolean
}

export default function Q11Review({ answers, onConfirm, onReset, isSubmitting }: Props) {
  const [showModal, setShowModal] = useState(false)
  const summary = buildSummary(answers)

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[#FAFAF0] mb-2">
        Review your answers before RAI analyzes them
      </h2>
      <p className="text-[#FAFAF0]/40 text-sm font-mono mb-6">
        Make sure everything looks right — you can go back to change anything.
      </p>

      {/* Natural language summary */}
      <div className="bg-[#0F0F0F] border border-teal-500/30 rounded-xl p-5 mb-6">
        <p className="font-mono text-xs text-teal-400 uppercase tracking-widest mb-3">
          ✦ Your situation
        </p>
        <p className="text-[#FAFAF0]/80 text-sm leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Confirm button */}
      <button
        type="button"
        onClick={() => onConfirm(summary)}
        disabled={isSubmitting}
        className={cn(
          'w-full py-4 rounded-xl font-display font-bold text-base transition-all duration-150 mb-3',
          isSubmitting
            ? 'bg-coral-400/50 text-[#0F0F0F]/50 cursor-not-allowed'
            : 'bg-coral-400 text-[#0F0F0F] shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
        )}
      >
        Looks good — analyze my answers with RAI →
      </button>

      {/* Start over button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl font-mono text-sm text-[#FAFAF0]/40 hover:text-[#FAFAF0]/70 transition-colors duration-150"
      >
        No, let me start over
      </button>

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F0F]/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 animate-fade-up">
            <h3 className="font-display text-lg font-bold text-[#FAFAF0] mb-2">
              Heads up
            </h3>
            <p className="text-[#FAFAF0]/60 text-sm leading-relaxed mb-6">
              Starting over will clear all your current answers and you'll need to re-answer all
              questions from the beginning. Are you sure?
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  onReset()
                }}
                className="w-full py-3 rounded-xl bg-coral-400 text-[#0F0F0F] font-display font-bold text-sm transition-all duration-150 shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Yes, start over
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl border border-[#2A2A2A] text-[#FAFAF0]/60 font-mono text-sm hover:border-[#3A3A3A] hover:text-[#FAFAF0]/80 transition-all duration-150"
              >
                Actually, looks good
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
