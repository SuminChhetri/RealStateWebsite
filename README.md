# Meridian

A CELPIP preparation platform that diagnoses what is holding a learner back,
prescribes the highest-value practice, and measures whether it worked.

Most preparation reports a score. Meridian tracks performance across **52
micro-skills**, distinguishes a learner who misreads inference questions from
one who reads them correctly but too slowly, and prescribes different work for
each.

> Meridian is an independent product. It is not affiliated with, endorsed by, or
> connected to the organisations that produce or administer the CELPIP test.
> Levels it reports are **practice estimates from a learner's own history** — not
> CELPIP scores, and with no official standing.

---

## Running it

Requires Node 20.11 or newer and a PostgreSQL database. Supabase's free tier is
what this is built and documented against; any Postgres 14+ works.

**1. Create a Supabase project**, then open *Project settings → Database →
Connection string* and copy it.

**2. Paste it into `.env`. That is the whole configuration.**

```bash
cp .env.example .env
# DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

One string, one variable. The app runs on the transaction pooler because
multiplexing short-lived connections is what stops a serverless deployment
exhausting the project's connection limit; migrations need session state that
transaction pooling cannot carry, so they run on the same host and credentials
with the port swapped to session mode. That swap is derived from your string —
there is no second variable to set and nothing to keep in sync.

**3. Create the schema and load the content.**

```bash
npm install
npm run db:push    # applies the schema, then enables row-level security
npm run db:seed    # loads the content corpus
npm run dev        # http://localhost:3000
```

Then create an account, answer six onboarding questions, and take the
diagnostic. Everything after that is built from what it finds.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Engine, content and taxonomy tests (Node's test runner) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Apply the schema and re-assert row-level security |
| `npm run db:seed` | Load or refresh the content corpus |
| `npm run db:studio` | Browse the data with Drizzle Studio |
| `npm run db:reset` | Drop every table, then push and seed. Requires `MERIDIAN_CONFIRM_RESET=yes` |

---

## What it does

**Assess → Diagnose → Teach → Practise → Evaluate → Explain → Review → Adapt →
Retest.** The loop is the product; every surface is a view onto part of it.

- **Diagnostic** — 24 timed items across every task type at a spread of
  difficulties. Returns a profile with uncertainty bands, not a percentage.
- **Today** — one highest-value action, scored as expected level gain per
  minute, with the reasoning shown.
- **Practice** — sets built at the difficulty where the learner gets about
  two-thirds right, focused on whichever micro-skill is dragging hardest.
- **Feedback** — every wrong answer explains why the distractor attracted, why
  the key is right, and the transferable move.
- **Writing** — nine dimensions, each traced to something measurable, with
  findings marked in place in the learner's own text.
- **Speaking** — pause structure and time use measured from the audio; content
  measured from a transcript; pronunciation declared out of scope.
- **Mistakes** — a mistake stays open until proved fixed three times on later
  items.
- **Review** — spaced retrieval scheduled at the point predicted recall falls to
  90%, covering items, grammar patterns and the learner's own errors.
- **Progress** — movement smaller than the uncertainty band is reported as
  noise, not progress.
- **CLB path & study plan** — gap per skill, an honest hours projection, and an
  adaptive schedule that says so when the horizon cannot deliver the target.

---

## Architecture

```
src/
  app/                      Next.js App Router
    (auth)/                 sign-in, sign-up, session actions
    (app)/                  the application shell — home, practice, progress…
    session/                the test runner: no shell, its own visual language
    api/speaking/           audio upload and playback (the one non-action route)
    onboarding/, diagnostic/
  components/               design-system components and feature surfaces
  lib/
    db/                     Drizzle schema, Supabase client, migrate, seed, reset
    auth/                   password hashing, sessions, the authorization guard
    content/
      taxonomy.ts           52 micro-skills — the spine of the product
      clb.ts                level descriptors and progression model
      validate.ts           automated content review
      seed/                 the original corpus
    engines/
      text.ts               linguistic primitives
      usage-rules.ts        curated high-precision usage rules
      writing-eval.ts       the writing analyser
      speaking-eval.ts      the speaking analyser
      ability.ts            Rasch-style ability estimation
      srs.ts                spaced retrieval scheduler
      recommend.ts          next-best-action
      plan.ts               adaptive study plans
    practice/               item selection, delivery, submission
    learner/                the assembled learner profile
    providers/              evaluation, speech, storage, entitlement seams
docs/RESEARCH.md            what was researched, found, decided — and diverged from
tests/                      engine, content and taxonomy tests
```

**Stack.** Next.js 15 (App Router, React 19, server components), TypeScript,
Drizzle ORM over PostgreSQL on Supabase, zod at every input boundary. No CSS
framework: the design system is ~600 lines of tokens and primitives in
`app/globals.css`.

**Connecting to Supabase.** The application talks to Postgres directly as a
database role over the transaction pooler. It does not use Supabase Auth or
PostgREST — sessions, hashing and authorization are the application's own, so
the only Supabase surface in play is the database.

That has one consequence worth stating plainly: a Supabase project also
publishes every table in `public` through PostgREST, authorised by an anon key
that is *designed* to be shipped to browsers. `npm run db:push` therefore ends
by enabling row-level security on every table and defining no policy, and by
revoking the `anon` and `authenticated` grants. The application connects as the
table owner, which bypasses RLS, so it is unaffected; a leaked anon key reaches
nothing.

RLS is enabled but deliberately **not** forced. `FORCE ROW LEVEL SECURITY`
subjects the owner too, and with no policies a non-superuser owner — which is
what a hosted app role is — gets locked out of its own tables, with reads
silently returning zero rows. That failure mode was reproduced against a
non-superuser owner before settling on `ENABLE`.

**Multi-tenancy.** Every tenant-scoped row carries `orgId`. Authorization runs
through one choke point (`lib/auth/guard.ts`); no caller accepts a tenant
identifier from the client. Organisations, memberships and roles exist from the
first migration, and the entitlement model is wired with no billing provider
connected and nothing gated.

**Security.** scrypt password hashing with per-user salts, opaque session tokens
stored only as SHA-256, rate limiting applied in a single atomic upsert so
concurrent requests cannot both pass a stale count, zod validation on every
action and route, size and MIME checks before a byte of audio is written,
storage keys derived server-side, row-level security denying every role but the
application's own, and an audit log on every state-changing action.

---

## Honesty as an engineering constraint

The analysers here are transparent rule-based systems. That is a real
constraint, and the product is built to state it rather than obscure it:

- Every evaluation returns its own `limitations`, and they are rendered on the
  page — including "it cannot judge whether an argument is persuasive".
- Where an analysis cannot be performed honestly, it is not performed. A
  recording with no transcript gets delivery feedback, the content dimensions
  marked unassessed, and a wider confidence band.
- Pronunciation is out of scope, and says so, because scoring it needs an
  acoustic model this product does not have.
- Every level is a practice estimate with a disclaimer beside it.
- Estimates carry uncertainty everywhere, and "ready" requires the *lower bound*
  of every skill to clear the target.

Each capability that would normally be bought sits behind an interface with one
working local implementation — `EvaluationProvider`, `StorageProvider`, the
speech plan, the plan/entitlement model. Adding a hosted provider later is an
addition, not a rewrite.

---

## Content

Everything in `lib/content/seed/` is original, written for this product:
20 stimuli with 139 items, 16 writing tasks, 32 speaking tasks (four per task
type), 16 lessons, 86 vocabulary entries and 12 grammar points. Nothing is
reproduced from a published question bank, course or other copyrighted source.

Content passes through a review pipeline before it reaches a learner —
authored → automated checks → expert review → approved → published — and the
automated stage is enforced in code (`content/validate.ts`). An item with an
error is inserted at `in_review` with its findings recorded and is never
delivered. The checks include: exactly one defensible key, a substantive
rationale on every distractor, an explanation that teaches rather than restates,
a key that is not conspicuously longer than its distractors, difficulty
consistent with the stated level, and micro-skill coverage across a set.

Option order is shuffled per attempt from a seed derived from the attempt id, so
position bias is removed while a reloaded attempt renders identically.

### Practice that does not run out

An authored corpus is finite, and a learner working seriously would exhaust it
in a fortnight and spend the rest of their preparation answering items they
remember. So `lib/content/generate/` builds more, for the micro-skills where
correctness is *decidable*:

| Generator | Source | Why the key is defensible |
| --- | --- | --- |
| Schedules and fee tables | Structured rows the generator itself produces | Each question is a query over that data — cheapest on a day, only session after a cutoff, the total of two fees. The answer is computed. |
| Vocabulary in context | The curated lexicon | The headword is blanked from the example sentence written for it; distractors are same-part-of-speech entries, and each rationale is that entry's own authored definition. |
| Usage | The grammar points' wrong/right/why triples | The key is decided by the rule; the feedback is the explanation already written for it. |

There is no language model in this path. Generated items are marked `generated`
in the database, marked in the interface, drawn on only after authored items,
and weighted at 0.65 when the ability estimate updates — their difficulty is
assigned from source data rather than measured against a population, and
`updateBelief` takes that weight explicitly rather than hiding it.

They pass the same validator as authored content and publish only if they pass.
A generator that cannot build a defensible item from its sample returns null
rather than lowering the standard. Standalone generated items are excluded from
diagnostic, section and mock modes, so a simulation still follows the published
blueprint exactly.

Listening has no generator. A script assembled from templates would sound like
one, and the honest answer there is "not yet".

---

## Testing

`npm test` covers the parts where a silent regression would be most expensive:
the writing and speaking analysers on strong and weak responses, usage rules
against both error cases and correct English, ability estimation and readiness,
the retrieval scheduler's interval behaviour, recommendation quality and
diversity, plan generation including its blunt verdict, and the integrity of the
whole content corpus.

The end-to-end flow — sign-up, onboarding, diagnostic, submission, feedback,
writing submission, mobile and dark rendering — was exercised in a real browser
during development.
