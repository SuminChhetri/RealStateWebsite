# Research log

This document records what was investigated, what was found, how it was
interpreted, and what was actually built as a result. The three are kept
separate deliberately: a finding is not an interpretation, and an
interpretation is not a product decision. Several findings below led to
decisions that go against them, and those cases are marked.

---

## 1. Test structure

**Sources consulted.** The test publisher's own public description of the test
format, plus a range of independent preparation sites cross-checked against
each other for the parts that the publisher states openly (section order, task
counts, timings, response formats).

**Findings.**

- The test has four components delivered in one computer-based sitting, in the
  order Listening, Reading, Writing, Speaking, running about three hours in
  total.
- Listening runs roughly 47–55 minutes across six scored parts; Reading roughly
  55–60 minutes across four parts; each has in the region of 38 items.
- Reading parts are, in order: correspondence, a diagram to apply, information
  across several short texts, and viewpoints.
- Listening parts run from concrete problem-solving and everyday conversation
  through denser informational and news content to multi-speaker discussion and
  extended viewpoints — an increase in abstraction and speaker count rather than
  simply in speed.
- Writing has two tasks: a message with required content points, and a choice
  between two options that must be argued. Roughly 26–27 minutes each.
- Speaking has eight tasks with fixed preparation and response windows. The
  common shape is 30s preparation with 60s response, with 90s response on tasks
  1 and 7 and 60s preparation on tasks 5 and 6.
- Scores map onto the Canadian Language Benchmarks on a 1:1 basis.

**Interpretation.** The published structure is stable enough to model directly,
and the *shape* of each task — the communicative job it asks for — is the part
that transfers to preparation. The exact item counts matter less than the
timings, because the timings are the constraint learners actually fail against.

**Product decisions.**

- `lib/content/taxonomy.ts` encodes the parts and their timings as
  `SECTION_BLUEPRINT`, and every practice set inherits pacing from it.
- Speaking timings are enforced in the recorder and validated in
  `content/validate.ts`, which fails any authored task whose timings deviate
  from the published shape.
- Meridian reports on the CLB scale rather than inventing its own, because the
  learner's actual goal is expressed in CLB terms.

**Deliberate divergence.** Meridian does *not* attempt to replicate item counts
exactly in every practice set. Sets are sized for the learner's available time,
because a 38-item set that is abandoned at item 12 produces worse evidence than
a completed set of 8.

---

## 2. Retrieval, spacing and interleaving

**Findings.**

- Retrieval practice (being tested on material) produces more durable retention
  than restudying it, and the effect is larger at longer delays.
- Spacing retrieval across sessions outperforms massing it, and the advantage
  grows with the retention interval.
- Interleaving problem types within a session depresses performance *during*
  practice and improves later discrimination between those types.
- Modern spaced-repetition schedulers model memory as difficulty, stability and
  retrievability, and schedule a review when predicted recall falls to a target
  (commonly 0.9). This reduces review volume substantially against fixed-interval
  schemes at equal retention.

**Interpretation.** Three of these are directly actionable in a preparation
product. The interleaving result is the awkward one: it makes practice feel
worse while making it work better, which is a real adherence risk for a learner
who is anxious about a test.

**Product decisions.**

- `lib/engines/srs.ts` implements a difficulty–stability–retrievability
  scheduler with published default parameters, targeting 0.9 recall. Parameters
  are not fitted — no data exists yet — and the schema records every review so
  they can be fitted per learner later.
- Everything a learner gets wrong, and everything they get right unusually
  slowly, enters the queue. The learner's own recorded mistakes go through the
  same scheduler, which is what turns the mistake bank into a mechanism rather
  than a list.
- `interleave()` prevents consecutive items from the same skill, and
  `generatePlan()` schedules two skills per study day rather than one.
- Explanations are shown after submission, not after each item, so the retrieval
  attempt is complete before the feedback arrives.

**Deliberate divergence.** Item selection targets ~65% success rather than the
~50% that maximises statistical information. The lost information is real; the
adherence gained is judged worth more for a product a learner uses alone.

---

## 3. Feedback

**Findings.**

- Feedback that describes the gap between current and desired performance, and
  what to do about it, outperforms feedback that reports a score.
- Feedback directed at the *self* rather than the task tends to be ineffective
  or harmful.
- Delayed feedback can outperform immediate feedback for retention on
  higher-order tasks, while immediate feedback helps for simple factual recall.

**Interpretation.** The single most valuable thing a preparation product can do
with a wrong answer is explain why the distractor attracted, not that it was
wrong.

**Product decisions.**

- Every distractor in the corpus carries a `rationale` describing the reasoning
  error that selects it. This is enforced by the content validator.
- Result pages lead with the micro-skill pattern, not the percentage.
- Coaching output is a ranked list of three changes with a reason and a
  concrete instruction each — never praise, never "great job".
- The mock-test page recommends reviewing a simulation the *next* day rather
  than immediately, on the delayed-feedback finding.

---

## 4. Automated writing evaluation

**Findings.**

- Rule-based and feature-based writing evaluation is well established for
  measurable properties: length, lexical diversity, syntactic complexity,
  cohesion features, error patterns.
- Such systems are weak on argument quality, originality and rhetorical
  effectiveness, and can be gamed by learners who optimise the features.
- Cohesion measured only as lexical overlap penalises writers who use reference
  and information structure instead of repetition.

**Interpretation.** A rule-based analyser is genuinely useful and genuinely
limited, and the limitation is not a reason to avoid building it — it is a
reason to say what it is.

**Product decisions.**

- `lib/engines/writing-eval.ts` measures nine dimensions from observable
  properties and shows the measurement next to every level it reports.
- Cohesion counts *both* lexical overlap and reference links, because counting
  only overlap would penalise exactly the writing the product teaches.
- Lexical range is scored on the share of vocabulary outside the highest
  frequency band, with academic vocabulary as a bonus rather than the whole
  measure — precise professional English should not score zero.
- Limitations are returned by the engine itself and rendered on every feedback
  page, including "it cannot judge whether an argument is persuasive".
- No model is claimed. The engine identifies itself by name and version.

---

## 5. Automated speech assessment

**Findings.**

- Temporal fluency measures — speech rate, articulation rate, pause frequency,
  pause duration and location — correlate meaningfully with human fluency
  ratings and can be extracted from an audio signal without a language model.
- Pronunciation scoring requires an acoustic model with forced alignment;
  approximations from transcripts alone are unreliable.
- Browser speech recognition varies substantially in accuracy and adds no
  punctuation.

**Interpretation.** The temporal measures are the honest part of speech
assessment available without a hosted model, and they happen to be the part
learners can act on most directly.

**Product decisions.**

- The recorder samples a loudness envelope in the browser and `segmentEnvelope`
  derives real speech/silence structure from it, using an adaptive threshold so
  it works across microphones.
- Pronunciation is declared out of scope in the returned `limitations`, on every
  speaking feedback page. No proxy is invented for it.
- Where no transcript exists, the analyser returns delivery dimensions only,
  marks the content dimensions as unassessed and widens the confidence band —
  rather than scoring content it never saw.
- Where a transcript came from browser recognition, grammar findings are marked
  as indicative and the confidence band is widened further.

---

## 6. Ability estimation

**Findings.**

- Item response theory models estimate ability and item difficulty on a common
  scale. One-parameter (Rasch) models are stable at low data volumes;
  two- and three-parameter models need far more responses per item to fit.
- Adaptive item selection at maximum information converges fastest but produces
  ~50% success rates, which learners experience as punishing.

**Interpretation.** A single learner produces tens to hundreds of responses, not
thousands. A Rasch-style model with an explicit uncertainty estimate is both
more stable and more explainable here than anything heavier.

**Product decisions.**

- `lib/engines/ability.ts` maintains a normal belief per micro-skill, updated
  with a Kalman-style Rasch update. Uncertainty is first-class and is shown.
- Skill-level estimates are inverse-variance weighted and multiplied by each
  micro-skill's diagnostic weight; micro-skills with no evidence contribute
  nothing rather than dragging the estimate to the prior.
- Readiness requires the *lower bound* of every skill estimate to clear the
  target, not the point estimate.
- Estimates decay in confidence — not in value — when they go unrefreshed.

---

## 7. What learners complain about

**Findings.** Public reviews and discussion of existing preparation products
surface a consistent set of complaints: feedback that reports a score without
explaining it; practice that does not resemble the test's timing; unclear or
disputed answer keys; products that promise official-equivalent scoring; and
question banks large in volume and thin in quality.

**Interpretation.** Most of these are not technology problems. They are
decisions about what to promise.

**Product decisions.**

- Every level is labelled a practice estimate with a disclaimer next to it, and
  the phrase "CELPIP score" is never used for Meridian's own output.
- Every item carries an explanation that teaches a transferable move, and every
  distractor carries its reasoning. Items that fail these checks are held at
  `in_review` and never delivered.
- Timed and untimed practice are tracked separately, and the gap between them is
  reported as a finding — because "I can do it but not in the time" is one of
  the most common real problems and most products cannot see it.
- The corpus is deliberately small and heavily worked rather than large and
  generated.

---

## 8. Cost and access constraints

**Finding.** Every capability this product would normally buy — hosted language
models, commercial text-to-speech, speech recognition, object storage — has a
free, local, or browser-native substitute with different characteristics.

**Product decisions.**

- Listening audio is synthesised in the browser from stored scripts, with
  per-role rate and pitch profiles. It costs nothing and works offline.
- Speech recognition uses the browser's own engine where present, with a typed
  fallback that is labelled as such.
- Storage is local disk behind a `StorageProvider` interface.
- Evaluation is the local rule-based engine behind an `EvaluationProvider`
  interface that declares its own capabilities and limitations.
- Billing is modelled as plans and entitlements with no provider connected and
  nothing gated.

Each of these is an interface with one implementation, so adding a hosted
provider later is an addition rather than a rewrite.

---

## Open questions

Recorded because they are the next things worth knowing, not because they are
answered:

1. How closely do this analyser's writing dimensions track expert human ratings?
   Answering it needs a rated corpus, which the product does not have.
2. Is the ~65% success target right, or does it trade more information than it
   buys in adherence? Answerable from usage data once there is any.
3. Do the scheduler's default parameters suit language items specifically, as
   opposed to the vocabulary cards they were derived from?
4. Does the concept-based requirement matcher hold up across a wider range of
   prompt phrasings, or does it need per-task keyword sets?
