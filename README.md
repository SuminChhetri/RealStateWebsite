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
- **Lessons** — checkpoints are retrieval, not decoration: the result is
  recorded, a missed checkpoint becomes a review card, the lesson reports what
  did and did not land, and the planner stops recommending a lesson once it has
  been worked through. A checkpoint deliberately does *not* move the ability
  estimate — it sits under the paragraph that answers it, so getting it right is
  evidence you read the page, not evidence you can do this under exam
  conditions.
- **Review** — spaced retrieval scheduled at the point predicted recall falls to
  90%, covering items, grammar patterns, missed lesson checkpoints and the
  learner's own errors.
- **Progress** — movement smaller than the uncertainty band is reported as
  noise, not progress.
- **CLB path & study plan** — gap per skill, an honest hours projection, and an
  adaptive schedule that says so when the horizon cannot deliver the target.
- **Profile** — what you have actually done, counted from your own rows: items
  answered and overall accuracy, sets completed, time on task measured per item
  rather than per page open, responses produced, lessons finished, cards
  scheduled. No badges for signing up; a number that can be earned without
  doing the work stops meaning anything.
- **Themes** — six, and the choice is a reading-comfort setting rather than a
  decoration, because people read here for fifty minutes at a stretch: System,
  Paper, Ink, Sepia (low-contrast warm paper), Nocturne (near-black and low in
  blue, for an unlit room) and High contrast (21:1 body text, opaque rules,
  thicker focus rings). Applied before first paint so there is no flash, and
  stored on the profile so it follows the account to another device — someone
  who needs high contrast needs it everywhere.
- **Account deletion** — real and irreversible, and built to be hard to do by
  accident: collapsed by default, confirmed by typing your own email address,
  rate limited, and executed in one transaction so nothing is left orphaned.

### What the paid tiers add

Everything above is free and stays free — the whole loop, without limits. What
is charged for is not the method but the artefacts and the people:

- **Readiness report** — a printable document, built as semantic HTML rather
  than an image so it survives a screen reader, 200% zoom and a greyscale laser
  printer. It refuses to render a verdict at all until there is enough evidence
  to support one (20 observations, three skills placed), and "ready" requires
  the *lower* bound of every skill to clear the target.
- **Sitting report** — a forensic reading of one sitting: where the marks went
  by micro-skill, pace against the intended pace, accuracy across the first,
  middle and last third, performance above and below the learner's own level,
  and what happened to changed answers. Its findings describe measurement, never
  a state of mind — "accuracy fell in the last third", not "you lost
  concentration" — and when nothing in the data stands out it says so instead of
  inventing a finding.
- **Sitting comparison** — whether a change between two sittings is real. A
  difference counts as movement only when it exceeds the combined standard error
  of the two estimates; anything smaller is reported as noise, including when
  the number went up.
- **Cohort view** — for a teacher running a group.
- **Human review (the coached path)** — where a workspace has other people in
  it. A learner asks a teacher to look at a piece of writing or a recording,
  with a specific question; the teacher claims it off an oldest-first queue,
  reads or listens to it, and returns written feedback with an optional band. A
  teacher's band is shown **beside** the analyser's estimate and is never merged
  into it: a human judgement and a rule-based estimate are different kinds of
  claim, and averaging them would hide both.

### The self-serve default

The product is self-serve, so the ordinary workspace has one person in it, and
that person is the learner. "Ask a teacher to read this" would be a button
leading nowhere — the request filed against a queue nobody opens, the learner
waiting on an answer that is not coming, and not doing the thing that would
actually help.

So the page asks first whether anyone else is there (excluding the learner
themselves — a solo learner holds the `owner` role, which *can* review, and
counting them would offer everybody the chance to wait for themselves). Where
nobody is, the section becomes a **structured self-review** instead: a set of
passes built from the analyser's own findings and the task's stated
requirements, in the order a trained marker reads — the requirements it could
not find evidence of, the dimension that scored lowest, the priority it already
named, a read-aloud pass, and the task's notes as the standard. Each pass ends
in a question answerable only by pointing at the learner's own text, and the
protocol closes by sending them back to rewrite the task.

It says at the top what it is not: not a person's judgement, and not a model
reading the work. There is no model in this path and no score comes out of it.
Self-explanation against a stated standard is well evidenced; what makes it fail
in practice is vagueness, which is why every question names something specific.
It is free on every plan, because it is part of the learning loop and the loop
is not for sale — and paying does not conjure a teacher, so an upgrade changes
nothing here until a real person joins the workspace.

The coached path has two rules in the code rather than in a policy document.
Feedback shorter than twenty characters is rejected, because "Good job" is what
an unenforced field fills with and a learner who paid for a person's attention
and got four words has been sold nothing. And a reviewer can hear a recording
only while they hold the review of it — claiming is what grants access, not
holding a teacher role — because reviewing speech from a transcript alone would
be a pretence of review, and blanket access would not be a review queue but a
surveillance surface.

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
      sitting-report.ts     forensic analysis of one sitting, and sitting comparison
      readiness-report.ts   the printable verdict, with its refusal-to-answer path
    practice/               item selection, delivery, submission
      self-review.ts        the protocol shown where there is no teacher
      review-rules.ts       what counts as a valid review request and return
      review-access.ts      who may read work that is not their own
      review-actions.ts     the coached path: ask, claim, release, return
    billing/plans.ts        tiers and features; no provider connected
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
first migration.

**Entitlements.** Plans are declared in `lib/billing/plans.ts` and resolved from
the organisation, not the session, so a plan change takes effect on the next
request rather than the next sign-in. Every gate goes through
`checkFeature(session, feature)`, and a test asserts that the entire learning
loop stays outside the paywall — if any of it ever needs a plan, the free tier
has stopped being a product and become a trial.

**No billing provider is connected** (`BILLING_PROVIDER_CONNECTED = false`), and
nothing in this repository can take a payment. The tiers are an entitlement
model with a working local implementation; wiring a provider later is an
addition, not a rewrite. To exercise a paid surface in development, set the
organisation's `plan_key` directly:

```sql
update organizations set plan_key = 'institute' where id = '<org id>';
```

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
| Service encounters (listening) | Facts generated before anything is spoken | The reference number a speaker corrects mid-sentence, the fee, the size of the window, the document to bring. The script is built around the facts, so the key comes from the data. |
| Vocabulary in context | The curated lexicon | The headword is blanked from the example sentence written for it; distractors are same-part-of-speech entries, and each rationale is that entry's own authored definition. |
| Usage | The grammar points' wrong/right/why triples | The key is decided by the rule; the feedback is the explanation already written for it. |
| Writing prompts | Authored situation frames, complications and requirement templates | A prompt has no key — nothing about it can be *incorrect*. And the marking does not depend on it: the analyser scores the learner's text against the stated requirements, so a generated prompt yields the same analysis as an authored one. Requirements name the generated specifics, so a memorised template cannot satisfy them. |
| Speaking prompts | Authored frames per task type; scenes assembled from settings, figures, conditions and time markers | Same argument. Moves are detected in the transcript against `successCriteria`, and pause structure is measured from the audio without reference to the prompt at all. |

**Where the line is.** Generated items cover the micro-skills where the answer
is a *fact* — locating it, holding it across turns, not being pulled off it by a
self-correction. They stop before gist, tone, inference, and speaker attitude,
which need a judgement about how something was said. Every item testing those is
hand-written, and a test asserts that the listening generator never claims one of
them.

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

Prompts carry a limitation the items do not, and it is stated on the page as
well as here: they are combinatorial, so across thirty of them a family
resemblance appears that thirty authored prompts would not have. They exist for
the fortieth timed rehearsal, when the authored set has run out — not as a
substitute for it, which is why authored prompts are always offered first.

Generators are tested in bulk — up to 400 seeds per generator — because they fail
rarely and expensively. A duplicate-option defect in the schedule generator
survived a 60-seed run at a rate of about 1 in 70, which would have reached a
learner inside a fortnight.

---

## Testing

`npm test` covers the parts where a silent regression would be most expensive:
the writing and speaking analysers on strong and weak responses, usage rules
against both error cases and correct English, ability estimation and readiness,
the retrieval scheduler's interval behaviour, recommendation quality and
diversity, plan generation including its blunt verdict, the tier boundaries, the
review lifecycle's rules, and the integrity of the whole content corpus.

The end-to-end flow was exercised in a real browser during development: sign-up,
onboarding, diagnostic, submission, feedback, writing submission, themes, mobile
and dark rendering — and the coached path in full, across three browser
contexts, checking that a learner's request reaches a teacher in the same
organisation and nobody else, that a teacher cannot hear a recording until they
claim the review of it, and that the teacher's band arrives on the learner's page
beside the analyser's estimate rather than folded into it.

Two defects worth recording, because both were invisible to type-checking and to
the interface. Writing and speaking submissions were being dropped silently: the
insert inside the transaction was not awaited, and a Drizzle query builder is
lazy, so the statement was constructed and never executed while the page
happily rendered a feedback report. And the schedule generator produced
duplicate options at a rate of about 1 in 70 — invisible in a 60-seed sweep,
certain to reach a learner within a fortnight, which is why the generator sweeps
now run to 400 seeds.
