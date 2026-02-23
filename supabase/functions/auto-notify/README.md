# auto-notify — Supabase Edge Function

Proactive notification emitter for NEXFIT. Runs daily at 08:00 UTC via pg_cron.

## What it detects

| Trigger | Type | Severity |
|---|---|---|
| Athlete inactive > 7 days (planned sessions not completed) | `missed_session` | ⚠️ warning |
| Membership expiring in ≤ 7 days | `membership_expiry` | ⚠️ warning |
| Athlete with streak ≥ 7 consecutive sessions | `streak_achieved` | ✅ success |

All notifications are **deduplicated** — one alert per `(user_id, type, date)` per day.

## Deploy

```bash
# Link CLI to your project first
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy function
npx supabase functions deploy auto-notify

# Test invoke (production)
npx supabase functions invoke auto-notify

# Expected response:
# { "ok": true, "date": "2026-02-23", "inserted": { "missed_session": 2, "membership_expiry": 1, "streak_achieved": 0 } }
```

## Schedule (pg_cron)

Run `cron_schedule.sql` in the Supabase SQL Editor after enabling the `pg_cron` and `pg_net` extensions.

## Required Environment Variables (auto-set by Supabase)

- `SUPABASE_URL` — auto-injected
- `SUPABASE_SERVICE_ROLE_KEY` — auto-injected
