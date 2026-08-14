import type { SeedWritingTask } from '../seed/types';
import { Rng } from './rng';

/**
 * Generated writing prompts.
 *
 * **Why this is a different problem from generating a reading item, and an
 * easier one.** A reading item has a key, and a generator that produces a bad
 * key puts wrong feedback in front of someone who trusts it. A writing prompt
 * has no key. Nothing about it can be *incorrect* — it can only be dull, or too
 * thin to write two hundred words from. Those are quality risks, not accuracy
 * risks, and they are managed by construction rather than by refusal.
 *
 * The other half of the argument is that the marking does not depend on the
 * prompt. `engines/writing-eval` scores coverage of the stated requirements,
 * support density, cohesion, lexical range, register and usage — all of it from
 * the learner's text against a structured requirement list. Give it a generated
 * prompt with well-formed requirements and it produces exactly the same
 * analysis it produces for an authored one. The feedback quality does not
 * degrade, which is the thing that would actually matter.
 *
 * What is authored here: the situation frames, the complications, the way a
 * requirement is phrased, and the coaching. What the generator does is choose a
 * combination and fill in specifics — amounts, dates, durations — then derive
 * the requirements from the slots it filled, so the prompt cannot be answered
 * from a memorised template. That last part is the whole point: a requirement
 * that names a figure the writer has to use is a requirement a template cannot
 * satisfy.
 *
 * The honest limitation, stated on the page as well as here: these are
 * combinatorial. Work through thirty and you will notice the family
 * resemblance, which you would not with thirty authored ones. They are for
 * volume — the twentieth timed rehearsal, when the authored set has run out —
 * not for variety of voice.
 */

/* ------------------------------------------------------------------ */
/* Email tasks                                                         */
/* ------------------------------------------------------------------ */

interface EmailFrame {
  slug: string;
  topic: string;
  recipient: string;
  /** The situation, with {n}, {days}, {amount}, {date} slots. */
  situation: string;
  /** What makes it non-trivial — the reason a template will not do. */
  complications: string[];
  /** What the writer wants, phrased as an instruction. */
  instruction: string;
  /** Requirements referring to the generated specifics. */
  requirements: string[];
  /** The move that separates a strong response, for the coaching note. */
  moves: string[];
}

const EMAIL_FRAMES: EmailFrame[] = [
  {
    slug: 'service-unfinished',
    topic: 'housing',
    recipient: 'the company that did the work',
    situation:
      'You paid {amount} up front for work on your home. It was due to be finished {days} days ago and is roughly {n} per cent complete. Nobody has been on site since the {date}, and the last two messages you sent have not been answered. The materials are still stacked in the hallway.',
    complications: [
      'You need it finished before a family member arrives to stay.',
      'You have used this company before and were satisfied then.',
      'One of your own decisions caused part of the delay, and you know it.',
      'The person you dealt with has left the company.',
    ],
    instruction:
      'Write to the company. Explain the situation, state what you need, and say what you will do if it does not happen.',
    requirements: [
      'State how far the work has got and how long it has been stalled',
      'Refer to the {amount} you have already paid',
      'Give a date by which the work must be complete, and say why that date matters',
      'Say what you will do if the deadline passes',
    ],
    moves: [
      'facts before feeling — the dates and the amount carry the complaint, adjectives do not',
      'a consequence that is specific and proportionate, named once rather than threatened repeatedly',
      'the deadline in the first paragraph, not the last',
    ],
  },
  {
    slug: 'billing-dispute',
    topic: 'consumer',
    recipient: 'the billing department',
    situation:
      'You have been billed {amount} for something you did not receive in full. The charge appeared on the {date}, and you have contacted them {n} times about it without a written answer. Payment is due in {days} days.',
    complications: [
      'You have paid every previous bill on time and want that noted.',
      'Part of the charge is legitimate and you are willing to pay that part.',
      'A member of staff told you verbally that it would be cancelled.',
      'Cancelling the direct debit would affect an unrelated service.',
    ],
    instruction:
      'Write to the billing department. Set out the problem precisely and say what you believe you owe.',
    requirements: [
      'Separate what you received from what you were charged for',
      'Refer to the {amount} and the date the charge appeared',
      'Say exactly what you are prepared to pay and why',
      'Ask for a corrected invoice before the {days}-day deadline',
    ],
    moves: [
      'precision about which charge is which — a reader who cannot follow it will not act',
      'stating what you will pay, which turns a complaint into a proposal',
      'no sarcasm, however deserved: it costs you the reader in a billing dispute',
    ],
  },
  {
    slug: 'workplace-request',
    topic: 'workplace',
    recipient: 'your manager',
    situation:
      'You need to change your working arrangement from the {date}. The written policy asks for {n} weeks of notice and you are giving {days} days. One colleague has said informally that the change might suit them, though nothing has been agreed. Your team is already covering one vacancy.',
    complications: [
      'The change is for a course you have already paid for.',
      'You made a similar request six months ago and it was granted.',
      'The busiest period of the year falls inside the change.',
      'Your manager has just taken over the team.',
    ],
    instruction: 'Write to your manager. Make the request easy to approve.',
    requirements: [
      'State exactly what you need to change and from what date',
      'Acknowledge that you are giving {days} days rather than the {n} weeks required',
      'Mention the colleague, without overstating what they said',
      'Offer something specific that reduces the effect on the team',
    ],
    moves: [
      "doing the reader's work for them: the obstacle named, with a candidate solution attached",
      'acknowledging the short notice once, directly, without over-apologising',
      'describing the colleague accurately — informal interest is not a commitment',
    ],
  },
  {
    slug: 'institution-request',
    topic: 'education',
    recipient: 'the institution',
    situation:
      'You need something from an institution that its policy does not normally allow: an absence of {n} days from the {date}, when the published limit is {days} days. Something that matters — an assessment or a deadline — falls inside that period.',
    complications: [
      'The reason is a family obligation overseas.',
      'You have already used one exception this year.',
      'The person who decides has never met you.',
      'A refusal would cost you a year rather than a term.',
    ],
    instruction:
      'Write to the institution. Explain the situation and set out how the missed work will be handled.',
    requirements: [
      'Give the exact dates and a reason at the level of detail they need',
      'Acknowledge the {days}-day policy rather than ignoring it',
      'Address what falls inside the period',
      'Propose a specific plan for keeping up',
    ],
    moves: [
      'one clear sentence on the reason — over-explaining private circumstances weakens it',
      'raising the thing they care about before they do',
      'a concrete plan rather than a promise to "make sure the work is completed"',
    ],
  },
  {
    slug: 'neighbour-issue',
    topic: 'community',
    recipient: 'the person responsible',
    situation:
      'Something a neighbour or a building manager is responsible for has affected you {n} times over the last {days} days. You pay {amount} a month toward it. You have raised it informally once, on the {date}, and had no reply.',
    complications: [
      'You will need this person’s cooperation on something else soon.',
      'You are not certain who is responsible.',
      'Two other residents have the same problem and have said nothing.',
      'Raising it formally would make the relationship awkward for years.',
    ],
    instruction: 'Write to them. Set out what has happened and what you want done.',
    requirements: [
      'Give the number of occurrences and the period involved',
      'Say what you have already tried',
      'Mention the {amount} you pay',
      'Ask for a specific remedy and a date for a reply',
    ],
    moves: [
      'evidence and sequence — dates and counts, then one clear ask',
      'letting annoyance drive the sentences turns a request into a complaint, which is weaker',
      'naming the remedy, because "please do something" leaves room to do nothing',
    ],
  },
  {
    slug: 'reference-or-favour',
    topic: 'workplace',
    recipient: 'someone you have lost touch with',
    situation:
      'You need a favour from someone you have not contacted in {n} months — a reference, an introduction, or a piece of information only they have. The deadline is in {days} days. The way your last dealings ended was slightly awkward.',
    complications: [
      'You left the shared situation at short notice.',
      'You never thanked them properly for something they did.',
      'They may have heard a version of events from someone else.',
      'You would like the relationship back, not just the favour.',
    ],
    instruction: 'Write to them. Ask for what you need, and make it easy to say yes.',
    requirements: [
      'Re-establish who you are and when you were in contact',
      'Acknowledge the {n}-month gap and how things ended',
      'State the {days}-day deadline and exactly what is involved',
      'Give them a straightforward way to decline',
    ],
    moves: [
      'one sentence on the awkwardness — more reads as an apology and makes the reader uncomfortable',
      'reducing the cost of yes: the deadline, the form, the length, an offer to supply the details',
      'an easy no, which signals the relationship matters more than the favour',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Survey tasks                                                        */
/* ------------------------------------------------------------------ */

interface SurveyFrame {
  slug: string;
  topic: string;
  /** The decision, with {who}, {scale} and {when} slots. */
  body: string;
  optionA: string;
  optionB: string;
  /** Constituencies affected, one of which is named in the brief. */
  stakeholders: string[];
  /** The distinction that separates a strong response from a preference. */
  discriminator: string;
}

const SURVEY_FRAMES: SurveyFrame[] = [
  {
    slug: 'opening-hours',
    topic: 'community',
    body: 'A public service used by about {scale} people a week can keep the same total opening hours but must decide how to distribute them. A consultation closes {when}. The service reports that demand has shifted since the hours were last set, and that it cannot extend both ends of the week.',
    optionA: 'Open late on two weekdays, closing earlier at weekends',
    optionB: 'Open both weekend days in full, closing earlier on weekdays',
    stakeholders: ['people working shifts', 'students without quiet space at home', 'parents with young children', 'people looking for work'],
    discriminator:
      'reason from who uses the service and when rather than from your own convenience — naming one or two groups grounds the argument in something checkable',
  },
  {
    slug: 'spending-choice',
    topic: 'community',
    body: 'Your municipality has a one-off grant and two proposals for it. Roughly {scale} residents would be affected either way, and the decision is taken {when}. Officials have said the money cannot be split between the two.',
    optionA: 'Remove charges for a service entirely for two years',
    optionB: 'Keep charges and improve the service where demand is highest',
    stakeholders: ['people for whom the charge is the reason they do not use it', 'daily users who would gain from better service', 'people who use it rarely', 'staff who would run the expanded service'],
    discriminator:
      'separate the short term from the long term — one option ends and reverts, the other changes behaviour durably, and only one reaches people for whom cost is the binding constraint',
  },
  {
    slug: 'workplace-policy',
    topic: 'workplace',
    body: 'Your employer is choosing between two ways of handling a common situation affecting around {scale} staff. A decision is expected {when}, and the team has been asked to comment first. Both models are in use elsewhere in the sector.',
    optionA: 'A generous entitlement with a verification requirement',
    optionB: 'A smaller fixed entitlement with no verification at all',
    stakeholders: ['people who would find verification difficult to obtain', 'colleagues who absorb the work when someone is away', 'managers who would enforce it informally', 'staff who rarely need it'],
    discriminator:
      'name the hidden cost on each side — what verification does to the person it is meant to protect, and what an unverified allowance shifts onto colleagues',
  },
  {
    slug: 'training-model',
    topic: 'workplace',
    body: 'An organisation taking on about {scale} new people is redesigning how they are brought up to speed. The change takes effect {when}. The total number of training hours is the same under both proposals; only their distribution differs.',
    optionA: 'An intensive block before the role begins',
    optionB: 'A short introduction followed by regular sessions while doing the job',
    stakeholders: ['new starters with no background in the work', 'experienced hires who need only the local detail', 'the colleagues who would supervise them', 'people who cannot take unpaid time before starting'],
    discriminator:
      'argue from a mechanism — front-loaded training arrives before the questions do; distributed training risks never being protected from the pressure of the job',
  },
  {
    slug: 'facility-use',
    topic: 'community',
    body: 'A shared space serving roughly {scale} people is being reallocated, and residents have been asked which use they prefer before a decision {when}. The space cannot be divided, and whichever use is chosen will hold for at least three years.',
    optionA: 'A use that serves a small number of people intensively',
    optionB: 'A use that serves a large number of people occasionally',
    stakeholders: ['the small group who would use it constantly', 'the wider neighbourhood who would use it occasionally', 'people who currently travel elsewhere for it', 'nearby residents affected by the traffic either way'],
    discriminator:
      'confront the depth-versus-breadth trade-off directly rather than asserting that the option you prefer somehow does both',
  },
  {
    slug: 'transport-choice',
    topic: 'community',
    body: 'A transport decision affecting about {scale} journeys a day is being taken {when}. The route cannot accommodate both proposals, and the authority has published the case for each without recommending one.',
    optionA: 'Prioritise speed for the majority making longer journeys',
    optionB: 'Prioritise access for the minority making short local ones',
    stakeholders: ['commuters travelling the full length of the route', 'residents making short trips within it', 'people who cannot walk to a distant stop', 'businesses along the route'],
    discriminator:
      'engage with the strongest version of the other case rather than its weakest, and say what evidence would change your mind',
  },
  {
    slug: 'communication-policy',
    topic: 'workplace',
    body: 'An organisation of about {scale} people is deciding how decisions get recorded and shared. The change takes effect {when}. Both options have been trialled in one department and neither was clearly better on the measures they used.',
    optionA: 'Everything written down and published internally by default',
    optionB: 'Decisions taken in meetings, with only outcomes recorded',
    stakeholders: ['people who joined recently and lack context', 'people working across time zones', 'those who would have to do the writing', 'teams whose work changes daily'],
    discriminator:
      'distinguish the cost of producing the record from the cost of not having it, and say who bears each',
  },
  {
    slug: 'assessment-policy',
    topic: 'education',
    body: 'An institution teaching around {scale} students is changing how a course is assessed, with the change applying {when}. The total assessed workload is unchanged; only its shape differs.',
    optionA: 'One substantial assessment at the end of the course',
    optionB: 'Several smaller assessments spread throughout it',
    stakeholders: ['students working alongside their studies', 'students who need time to build up to a topic', 'staff marking the work', 'students who would struggle with a single high-stakes day'],
    discriminator:
      'argue from what each shape actually measures rather than from which sounds fairer — one tests retention across a whole course, the other tests keeping up',
  },
];

/* ------------------------------------------------------------------ */

const AMOUNTS = ['$180', '$240', '$350', '$420', '$600', '$1,100', '$1,850'];
const SCALES = ['400', '900', '1,500', '3,000', '6,000', '12,000'];
const WHENS = ['at the end of this month', 'in three weeks', 'before the next quarter', 'after the consultation closes on the 30th', 'at the meeting on the 12th'];
const DATES = [
  'the 3rd of last month', 'the 14th', 'the 21st of last month',
  'the first week of the term', 'the Monday after the holiday', 'the 8th',
];

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

/**
 * Build one generated writing task.
 *
 * Unlike the item generators there is no null return for "cannot make a
 * defensible key", because there is no key. The refusal here would be a prompt
 * too thin to write from, and the validator's own scenario-length check is what
 * catches that — the same check that governs authored prompts.
 */
export function generateWritingTask(seed: string): SeedWritingTask {
  const rng = new Rng(seed);

  if (rng.next() < 0.5) {
    const frame = rng.pick(EMAIL_FRAMES);
    const values = {
      n: String(rng.int(2, 9)),
      days: String(rng.pick([5, 8, 10, 12, 14, 18, 21])),
      amount: rng.pick(AMOUNTS),
      date: rng.pick(DATES),
    };
    const complication = rng.pick(frame.complications);

    return {
      slug: `gen-write-${frame.slug}-${seed}`,
      taskType: 'writing.email',
      title: `Generated task: ${frame.recipient}`,
      scenario: `${fill(frame.situation, values)} ${complication}`,
      instructions: frame.instruction,
      // Requirements name the generated specifics, so a memorised template
      // cannot satisfy them — which is the property that makes the prompt worth
      // practising against at all.
      requirements: frame.requirements.map((r) => fill(r, values)),
      minWords: 150,
      maxWords: 200,
      timeLimitSeconds: 1620,
      register: 'formal',
      level: 9,
      topic: frame.topic,
      modelNotes: [
        `What separates a strong response on a prompt of this shape: ${frame.moves.join('; ')}.`,
        `The complication in this version — ${complication.toLowerCase().replace(/\.$/, '')} — is the part a prepared answer will miss, and addressing it directly is what a marker notices.`,
        'Cover every required point explicitly. The analyser checks coverage against the list above, and a point covered "in spirit" scores as a point missed — which is also how a human reader treats it.',
      ].join(' '),
    };
  }

  const frame = rng.pick(SURVEY_FRAMES);
  const scale = rng.pick(SCALES);
  const when = rng.pick(WHENS);
  // One constituency is named in the brief, which stops the response from being
  // a general preference and forces it to engage with someone specific.
  const [named, alsoNamed] = rng.sample(frame.stakeholders, 2);

  return {
    slug: `gen-write-${frame.slug}-${seed}`,
    taskType: 'writing.survey',
    title: `Generated task: ${frame.slug.replace(/-/g, ' ')}`,
    scenario: `${fill(frame.body, { scale, when })} Responses are being read, and the consultation has drawn particular attention from ${named} and from ${alsoNamed}. Both options are workable and both have real costs.`,
    instructions: 'Write to the decision-makers explaining which option you support and why.',
    requirements: [
      'State your choice explicitly in the first paragraph',
      `Address what your choice would mean for ${named}`,
      'Acknowledge the strongest point on the other side',
      'Say what would change your mind',
    ],
    choices: [`Option A: ${frame.optionA}`, `Option B: ${frame.optionB}`],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'formal',
    level: 10,
    topic: frame.topic,
    modelNotes: [
      `The move that lifts this shape of prompt: ${frame.discriminator}.`,
      `This version names ${named} specifically, and a response that argues only in general terms has left the strongest available evidence unused.`,
      'Committing in the first paragraph is not a stylistic preference — a response that spends three sentences reaching a position has spent a quarter of its length on nothing a reader can use.',
      'Saying what would change your mind is the highest-value sentence available here and almost no response at CLB 8 includes one. It demonstrates that the position is held for reasons rather than by default.',
    ].join(' '),
  };
}
