import { MilestoneContent } from './types'

export const MILESTONES: Record<number, MilestoneContent> = {
  1: {
    number: 1,
    title: 'Capture Free Money',
    tagline: 'Never leave your employer match on the table.',
    primaryAction: 'Increase your 401(k) contribution to at least your employer\'s match percentage.',
    bullets: [
      'An employer match is an immediate 50–100% return on your money — nothing beats it.',
      'Log into your HR portal or payroll system and look for "401(k) contribution" settings.',
      'Even bumping from 0% to 3% of your paycheck can mean tens of thousands extra at retirement.',
    ],
    color: 'coral',
  },
  2: {
    number: 2,
    title: 'Build Your Safety Net',
    tagline: 'Put 3–6 months of expenses in a high-yield savings account.',
    primaryAction: 'Open a high-yield savings account and automate a fixed monthly transfer into it.',
    bullets: [
      'Without an emergency fund, one car repair derails your entire retirement plan.',
      'Aim for 3 months of expenses first — then stretch to 6 months over time.',
      'High-yield savings accounts (HYSAs) earn 4–5% APY, far better than a standard checking account.',
    ],
    color: 'teal',
  },
  3: {
    number: 3,
    title: 'Eliminate High-Interest Debt',
    tagline: 'Clear any debt with an interest rate above 6%.',
    primaryAction: 'List every debt, find anything above 6% interest, and attack the highest rate first.',
    bullets: [
      'Paying off 20% APR credit card debt is the same as a guaranteed 20% investment return.',
      'Use the avalanche method: minimum payments on everything, maximum extra on the highest rate.',
      'Once high-interest debt is gone, redirect those payments straight into savings.',
    ],
    color: 'yellow',
  },
  4: {
    number: 4,
    title: 'Open Tax-Advantaged Accounts',
    tagline: 'Open a Roth IRA and/or HSA to grow money tax-free.',
    primaryAction: 'Open a Roth IRA at Fidelity, Vanguard, or Schwab and set up automatic monthly contributions.',
    bullets: [
      'A Roth IRA lets your money grow completely tax-free — you pay tax now, never on the gains.',
      'If you have a high-deductible health plan, an HSA offers triple tax advantages for medical costs.',
      'The 2025 Roth IRA limit is $7,000 ($8,000 if you\'re 50+). Even $100/month gets you started.',
    ],
    color: 'coral',
  },
  5: {
    number: 5,
    title: 'Max Out Contributions',
    tagline: 'Hit the annual contribution limits on your retirement accounts.',
    primaryAction: 'Increase contributions until you\'re hitting the IRS annual limit on your 401(k) and IRA.',
    bullets: [
      'The 2025 401(k) limit is $23,500. The Roth IRA limit is $7,000. Together: $30,500/year.',
      'If you can\'t max both at once, prioritize the account with the better tax treatment for your income.',
      'Every dollar you add now has decades to compound — the math gets dramatically better the earlier you max.',
    ],
    color: 'teal',
  },
  6: {
    number: 6,
    title: 'Build Long-Term Wealth',
    tagline: 'Grow beyond retirement accounts into broader wealth-building.',
    primaryAction: 'Open a taxable brokerage account and invest in low-cost index funds.',
    bullets: [
      'Once you\'re maxing retirement accounts, a brokerage account gives you flexible long-term growth.',
      'Real estate, index funds, and dividend stocks are all valid next-level wealth-building vehicles.',
      'At this stage, asset allocation and tax-loss harvesting become your primary optimization levers.',
    ],
    color: 'yellow',
  },
}
