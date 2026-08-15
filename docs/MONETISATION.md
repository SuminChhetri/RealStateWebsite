# Paid value: strategy, ten-role review, and what was built

This document is the reasoning, not a summary of it. It states a strategy,
subjects it to ten professional readings that each try to break it, and records
what changed as a result. What survived is implemented; what did not is listed
with the reason, so a future decision to revisit it starts from the argument
rather than from scratch.

---

## 1. The constraint that shapes everything

Meridian's differentiator is not its question bank. It is that the product tells
the truth about what it knows: uncertainty bands instead of a single number,
declared limitations on every analyser, a refusal to call a heuristic a model,
and a plan that says when the horizon cannot deliver the target.

That is a fragile asset. A monetisation model that charges a learner to be told
the truth about their own performance destroys the only thing that makes this
product worth using, and it does so invisibly — the product still works, it just
stops being trustworthy. Every decision below is downstream of that.

**Four rules, in priority order.**

1. **Never charge for the truth.** Limitations, uncertainty, honest verdicts and
   the reasoning behind a recommendation are free forever, including the ones a
   learner would rather not read.
2. **Never break the loop.** Diagnose → practise → feedback → review → retest
   must work completely without paying. A free tier that cannot improve someone
   is a demo with a conversion funnel attached.
3. **Charge for depth, evidence, and other people.** Longitudinal analysis a
   casual learner does not need; artefacts they can hand to a tutor, an employer
   or a consultant; and seats for teachers who are managing a cohort.
4. **Portability is a right, not a feature.** Full data export is free. Holding
   someone's own history hostage is a dark pattern whatever the tier.

Two things are ruled out at the outset and are not revisited later in this
document: countdown timers and manufactured scarcity, and any gating of a
learner's own historical data.

---

## 2. The strategy

### Free — "Learner"

The entire learning loop, permanently:

- the diagnostic and every re-diagnostic;
- unlimited adaptive practice, authored and generated;
- every explanation, distractor rationale and transferable takeaway;
- the mistake bank and its proof-of-fix requirement;
- spaced review across items, grammar, vocabulary and lesson checkpoints;
- all lessons;
- writing and speaking analysis in full, with all nine dimensions;
- progress with uncertainty bands, and the study plan;
- full data export.

### Paid — "Learner Pro"

Depth and evidence. Four things, each of which a serious candidate in the month
before a test would actually use:

1. **The readiness report.** A printable evidence pack: trajectory per skill
   with bands, what is holding each skill down, whether the target is reachable
   in the time left, and an explicit *not ready / borderline / ready* verdict
   with its reasoning. Designed to be handed to a tutor or kept as a record.
2. **Sitting reports.** Per mock section: where the time went, where the points
   went, and the transferable move for each loss — the forensic view, as opposed
   to the per-item feedback that is free.
3. **Sitting comparison.** Two sittings side by side, with movement classified
   as signal or noise against the uncertainty band. This is the question every
   repeat candidate asks and almost no product answers honestly.
4. **Plan on your calendar.** The study plan exported as `.ics`, so it competes
   with the rest of a working adult's week rather than living on a page they
   have to remember to open.

### Paid — "Institute"

Other people. Cohort view, teacher review queue, seat management, exportable
cohort reports. This is the higher-revenue tier and the schema has carried
organisations, memberships and roles since the first migration.

---

## 3. Ten readings

Each role was asked the same two questions: what is wrong with this, and what
would you cut or add? The verdicts are recorded even where they conflict — three
of them do, and the conflicts are resolved in §4.

### 1. Head of Product

**Verdict: sound, but the free tier is close to too good.**

The loop being free is correct and on-brand, but "unlimited practice free" means
the paid tier has to carry its entire weight on artefacts. That works only if
the artefacts are excellent; a mediocre PDF export converts nobody. The risk is
building four half-features instead of one that people talk about.

*Change made:* the readiness report is treated as the flagship and built to a
higher standard than the other three, which are supporting.

### 2. Pricing and monetisation lead

**Verdict: the willingness-to-pay is misjudged, and the trigger is wrong.**

The people who will pay are not browsing casually — they are four to six weeks
out with a booked test and a score requirement attached to an immigration
application. That is a very high-intent, short-window, low-price-sensitivity
moment. Selling "depth" to a learner in week one is selling to the wrong person.

*Change made:* the upgrade surface is contextual rather than persistent. It
appears where the value is legible — on the readiness report, and when a test
date is within the window — and nowhere else. No permanent nag in the sidebar.

### 3. Psychometrician

**Verdict: one item is dangerous and must be constrained.**

A "ready / not ready" verdict sold as a paid artefact is an implied prediction
of an official outcome, and this product has no concurrent-validity evidence to
support that. Sold, printed, and handed to a third party, it will be read as a
score prediction whatever the caption says.

Sitting comparison is the opposite: it is the most defensible thing on the list,
because classifying movement against the standard error is exactly what the
uncertainty machinery already does correctly.

*Change made:* the verdict is expressed strictly in terms of *this product's own
practice estimates*, never as a predicted CELPIP result; the report carries the
non-affiliation and no-official-standing statement on every page including in
print; and the verdict language is bounded to what the evidence supports —
including saying "not enough evidence" when observations are thin, rather than
producing a verdict to justify the purchase.

### 4. CELPIP teacher / tutor

**Verdict: the artefacts are aimed at the wrong reader.**

A tutor with six students does not want a beautiful learner-facing PDF. They
want, in thirty seconds: what is this person's weakest micro-skill, what have
they already been taught, and what should today's hour cover. The learner-facing
report is the wrong shape for the person who is most likely to recommend the
product.

*Change made:* the readiness report has a section written for the tutor rather
than the learner — what has been taught, what is unresolved, and what the next
hour should cover — and prints on its own page so it can be handed over alone.

### 5. The learner (newcomer, cost-sensitive)

**Verdict: suspicious of the whole thing, and specifically of two words.**

"Unlimited" and "free forever" are what every test-prep site says before the
paywall appears at the point of value. The response is not more reassurance; it
is a page that states plainly what is free, what is not, and what happens if
they never pay — including that their data stays exportable and their history
stays intact.

*Change made:* the plans page leads with what is free rather than what is paid,
names the things that will never be gated, and says explicitly that a free
account is a complete product rather than a trial.

### 6. Growth marketer

**Verdict: no distribution loop, and the strongest asset is being wasted.**

The readiness report is the only artefact here that leaves the product and gets
seen by someone else — a tutor, a spouse, a consultant. That makes it the
distribution mechanism, and it should carry a modest, non-intrusive attribution
so the next person knows where it came from.

*Objection registered and partially declined:* the suggestion to gate the export
behind an email-a-friend step was rejected outright. Making a paying customer
market the product to retrieve their own artefact is exactly the pattern rule 4
forbids.

### 7. Trust, safety and compliance

**Verdict: three specific exposures.**

First, any printed artefact that reaches a third party must be unambiguous about
non-affiliation, or it functions as an implied credential. Second, a "readiness"
claim attached to an immigration-linked test invites reliance the product cannot
carry. Third, the delete-account path must remove paid artefacts as well, or
deletion is incomplete.

*Change made:* non-affiliation and no-official-standing print on every page of
every artefact, not merely on screen; the verdict is bounded as in §3.3; and
artefacts are generated on demand from live rows rather than stored, so account
deletion removes them by construction.

### 8. Accessibility specialist

**Verdict: print is where accessibility work is usually abandoned.**

A report that depends on colour to distinguish skills fails for a large minority
in colour and for everyone in greyscale printing. Uncertainty bands drawn only
as tinted rectangles carry no information at all when printed on a mono laser.

*Change made:* every band in the report is labelled numerically as well as
drawn, print styles use pattern and weight rather than hue, and the report is a
semantic document — headings, tables, real text — rather than a rendered image,
so it works with a screen reader and reflows at 200% zoom.

### 9. Staff engineer

**Verdict: the gating design is the real risk, not the features.**

Feature flags scattered through pages is how products end up with a paywall that
leaks on one route and blocks a free user on another. There must be exactly one
place that answers "may this account use this", and it must be server-side —
hiding a link in the interface is not access control.

*Change made:* a single `requireFeature` choke point in the entitlement module,
enforced on the server for every gated route, with the plan read from the
organisation rather than hardcoded. The interface hides what is unavailable, but
the hiding is presentation; the check is the gate.

### 10. Customer support lead

**Verdict: the most common ticket is already predictable.**

"I paid and I still cannot see X." Every gate needs to explain itself at the
point of refusal — which plan is required, what the account currently has, and
what to do — rather than showing a generic upsell. Second most common: "what
exactly am I paying for", which is a symptom of a plans page written in feature
names rather than outcomes.

*Change made:* the locked state names the current plan and the required one and
links to the comparison; the plans page is written in outcomes.

---

## 4. Resolving the conflicts

**Product wants fewer, better features; the pricing lead wants a contextual
trigger; growth wants distribution.** All three point at the same conclusion:
concentrate on the readiness report. It is the flagship, the trigger, and the
distribution mechanism at once. Built.

**The psychometrician and the pricing lead disagree about the verdict.** Pricing
wants a confident ready/not-ready call because confidence sells; the
psychometrician says the evidence does not support one. The psychometrician
wins, without qualification. A confident verdict this product cannot support is
precisely the thing rule 1 forbids, and it is worth less than an honest one to
the tutor in role 4, who can tell the difference.

**The teacher and the learner want different documents.** Both are right, and
the resolution is one artefact with two audiences, sectioned and paginated so
either half can be handed over alone.

---

## 5. What was not built, and why

- **Retention gating** (free keeps 90 days of history, paid keeps all). Rejected
  under rule 4. Someone's own record is theirs.
- **Limiting free mock sittings.** Rejected: it breaks rule 2, and the product
  has been telling learners that practice is unlimited. Withdrawing that to
  create a paywall would be a straightforward lie.
- **Gating the export behind a referral step.** Rejected, see §3.6.
- **AI tutor chat.** No language model is available under this project's
  constraints, and a scripted one presented as a tutor would violate the
  no-fake-AI rule. The correct abstraction already exists in
  `lib/providers` should that change.
- ~~**Institute cohort dashboard.**~~ Built. See §7.

---

## 7. What shipped after the first round

The first implementation shipped only the flagship, which left the paid tier
thin enough to be fairly described as nothing to sell. The rest of §2 is now
built, plus the Institute tier that had been deferred.

**Sitting reports** (`/sittings/[id]`). The free per-item feedback answers "why
was this one wrong". A sitting report answers a different question that per-item
feedback structurally cannot: *how did this sitting go as a performance*. Pace
against the intended time, accuracy across the first, middle and last thirds —
thirds rather than halves, because fatigue in a fifty-minute section hides in an
average — losses concentrated by micro-skill, accuracy split by difficulty
relative to the learner's own level, and whether changing an answer helped.

Two constraints held while building it. Findings are only emitted where the data
supports one, and when nothing stands out the report says so rather than
inventing an observation to look thorough. And every finding describes the
measurement rather than the learner's state of mind: "accuracy fell in the last
third", never "you lost concentration". The first is measured; the second is a
story about it. A test asserts no finding ever uses that second register.

**Sitting comparison** (`/compare`). Two sittings side by side, with the
difference classified as real movement or as noise against the combined standard
error of the two estimates. This is the question every repeat candidate asks and
almost nothing answers honestly, because answering honestly means telling
someone a jump they were pleased with is measurement error. Raw score and
accuracy are shown but explicitly *not* classified, because only the estimate
carries a standard error.

**Cohort view** (`/cohort`, Institute). A teacher with twenty learners has ten
minutes before class and three questions: who stopped working, who is furthest
from target, and what does this group have in common. The third is the one worth
paying for — a per-learner list is something any product can build, but finding
the micro-skill that eleven of twenty share, and which is therefore worth an
hour of class time rather than twenty conversations, is what the micro-skill
taxonomy makes possible.

Gated on the plan *and* the role: the plan says the organisation may, the role
says whether this person may. Individual answers, submissions and recordings are
deliberately not surfaced — a teacher can see where a learner stands and what to
teach, and reading someone's written work is a separate permission this view
does not grant.

---

## 6. Billing

**No payment provider is connected, and none will be.** This project is built
under a constraint that nothing may cost money, so the upgrade path explains
that billing is not wired rather than presenting a checkout that cannot
complete. `lib/billing/plans.ts` is the single seam: connecting a provider means
setting `planKey` on the organisation from a webhook, and changing nothing else.

A fake checkout would be both a broken promise and a lie about what the software
does, which is the same mistake as a fake score.
