-- ─── SHARED TRIGGER FUNCTION ─────────────────────────────────────────────────
-- Auto-updates the updated_at column on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Links your Clerk login (clerk_user_id) to a row in our database
CREATE TABLE users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text        NOT NULL UNIQUE,
  email         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── QUIZ RESPONSES ──────────────────────────────────────────────────────────
-- Stores all quiz answers + RAI-determined milestone and personalized content.
-- If you had the old schema, run the migration SQL below instead of this CREATE.
CREATE TABLE quiz_responses (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Q1: Employment status (free text, e.g. "W2 Employee...")
  employment_status      text        NOT NULL,

  -- Q2: Retirement journey (1=no saving, 2=personal savings only, 3=one account, 4=multiple)
  retirement_journey     smallint    NOT NULL CHECK (retirement_journey BETWEEN 1 AND 4),

  -- Q3A/Q3B: All account types selected (array of strings, e.g. ["401k", "Roth IRA"])
  account_types          text[]      NOT NULL DEFAULT '{}',

  -- Q4: Balance + contribution per account (array of JSON objects)
  -- Each object: { accountType: string, balance: string, contribution: string }
  account_balances       jsonb       NOT NULL DEFAULT '[]',

  -- Q5/Q6: Monthly savings (integers)
  current_monthly_savings integer    NOT NULL DEFAULT 0,
  future_monthly_savings  integer    NOT NULL DEFAULT 0,

  -- Q7: Age
  age                    smallint    NOT NULL CHECK (age BETWEEN 18 AND 80),

  -- Q8: Retirement goal (e.g. "60-65")
  retirement_age_goal    text        NOT NULL,

  -- Q9: Biggest concern
  biggest_concern        text        NOT NULL,
  biggest_concern_custom text,

  -- Q1C: Total essential monthly expenses (used to calculate emergency fund targets)
  monthly_expenses       integer     NOT NULL DEFAULT 0,

  -- Q_DEBT_A/B: High-interest debt status and details
  -- Status is one of: 'No, I have no high-interest debt' | 'Yes, I have high-interest debt' | 'I have debt but I\'m not sure of the interest rates'
  -- When status is 'yes', high_interest_debt contains an array: [{ type, amount, rate }]
  high_interest_debt     jsonb,

  -- Q10: Open-ended description (optional)
  open_ended_response    text,

  -- Q11 Review: The natural-language summary the user confirmed
  confirmed_summary      text,

  -- RAI output
  recommended_milestone  smallint    NOT NULL CHECK (recommended_milestone BETWEEN 1 AND 6),
  ai_explanation         text,
  ai_action_step         text,

  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER quiz_responses_updated_at BEFORE UPDATE ON quiz_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- One response per user — retaking the quiz overwrites the old one
CREATE UNIQUE INDEX quiz_responses_user_id_unique ON quiz_responses (user_id);


-- ─── MIGRATION (run this if you already have an old quiz_responses table) ─────
--
-- If you ran the old setup.sql, use these ALTER statements instead of the CREATE above.
-- Comment out the CREATE TABLE block above and uncomment these:
--
-- Run these if you already have a quiz_responses table and need to add new columns:
-- ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS high_interest_debt jsonb;
-- ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS monthly_expenses integer NOT NULL DEFAULT 0;

-- ALTER TABLE quiz_responses
--   ADD COLUMN IF NOT EXISTS employment_status      text,
--   ADD COLUMN IF NOT EXISTS retirement_journey     smallint,
--   ADD COLUMN IF NOT EXISTS account_types          text[]  DEFAULT '{}',
--   ADD COLUMN IF NOT EXISTS account_balances       jsonb   DEFAULT '[]',
--   ADD COLUMN IF NOT EXISTS current_monthly_savings integer DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS future_monthly_savings  integer DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS confirmed_summary      text;
--
-- Then update any NOT NULL constraints and drop old columns you no longer need:
-- ALTER TABLE quiz_responses DROP COLUMN IF EXISTS retirement_status;
-- ALTER TABLE quiz_responses DROP COLUMN IF EXISTS income;
-- ALTER TABLE quiz_responses DROP COLUMN IF EXISTS current_savings;
-- ALTER TABLE quiz_responses DROP COLUMN IF EXISTS future_savings;
--
-- Finally set defaults on the new NOT NULL columns before enforcing them:
-- UPDATE quiz_responses SET employment_status = 'Unknown' WHERE employment_status IS NULL;
-- UPDATE quiz_responses SET retirement_journey = 1 WHERE retirement_journey IS NULL;
-- ALTER TABLE quiz_responses ALTER COLUMN employment_status SET NOT NULL;
-- ALTER TABLE quiz_responses ALTER COLUMN retirement_journey SET NOT NULL;


-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
-- Ready for Stripe in Phase 3 — nothing to fill in yet
CREATE TABLE subscriptions (
  id                      uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id  text      NOT NULL,
  status                  text      NOT NULL,
  plan                    text      NOT NULL,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Locks down direct browser access. The app uses a server-side service role key
-- that bypasses this automatically — so you don't need to add any policies.
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions  ENABLE ROW LEVEL SECURITY;
