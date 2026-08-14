import type { SeedQuestion, SeedStimulus } from '../seed/types';
import { Rng } from './rng';

/**
 * Generated listening material: service encounters, and the fact-holding
 * questions that go with them.
 *
 * **Why this can be generated honestly, and where the line is.**
 *
 * A listening item is trustworthy when the answer is *in the recording* and
 * only one option matches it. That is true of a whole class of real test items:
 * the reference number the speaker corrects mid-sentence, the fee, the size of
 * the window you have to act in, the document you are told to bring. Those
 * facts are generated here as structured data first and spoken second, so the
 * key is computed from the data rather than judged from the prose — exactly as
 * in the schedule generator.
 *
 * What is *not* generated: gist, speaker attitude, inference, relationship
 * between speakers. Those depend on how something is said, and a template has
 * no opinion about that. Items for those micro-skills stay hand-written, and
 * the authored listening corpus is where they live.
 *
 * The dialogue frames below are authored — the turns, the register, the way a
 * clerk interrupts to repeat a number back. The generator varies who is
 * speaking, about what, and with which values; it does not write English.
 *
 * A note on the audio. Speech is synthesised in the browser from these scripts,
 * so a generated encounter sounds exactly as good as an authored one — the
 * synthesiser does not know the difference. What differs is the writing, which
 * is why the scope above is drawn where it is.
 */

/* ------------------------------------------------------------------ */
/* The facts, generated before anything is said                        */
/* ------------------------------------------------------------------ */

interface Facts {
  /** Spoken as digits, with a self-correction from `wrongRef`. */
  ref: string;
  wrongRef: string;
  fee: number;
  windowDays: number;
  document: string;
  wrongDocument: string;
  counter: string;
  weekday: string;
  cause: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DOCUMENTS = [
  'the insurance slip',
  'the ownership document',
  'a utility bill from the last ninety days',
  'the original receipt',
  'a letter from your employer',
  'the confirmation email',
  'photo identification',
  'the tenancy agreement',
];

const COUNTERS = ['counter four', 'the second window', 'the desk by the entrance', 'the kiosk on level two', 'window nine'];

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Digits spoken one at a time, the way a number is read out on a phone. */
function speakDigits(value: string): string {
  const names: Record<string, string> = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
  };
  return value.split('').map((d) => names[d]).join('-');
}

/**
 * A near-miss reference: two adjacent digits transposed. That is the mistake
 * people actually make reading a number aloud, and it makes the corrected
 * version the only defensible key.
 */
function transpose(value: string, rng: Rng): string {
  const at = rng.int(0, value.length - 2);
  const chars = value.split('');
  [chars[at], chars[at + 1]] = [chars[at + 1], chars[at]];
  const swapped = chars.join('');
  return swapped === value ? transpose(value, rng) : swapped;
}

/**
 * A transposition that lands on neither number already in play. Transposing a
 * near-miss can transpose it straight back onto the key, which would put the
 * correct answer in two options at once.
 */
function distinctTranspose(value: string, forbidden: string[], rng: Rng): string {
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = transpose(value, rng);
    if (!forbidden.includes(candidate)) return candidate;
  }
  // Fall back to a value that cannot collide; the caller's duplicate check is
  // the backstop either way.
  return String(Number(value) + 11);
}

function buildFacts(rng: Rng, causes: string[]): Facts {
  const ref = String(rng.int(10234, 98765));
  const [document, wrongDocument] = rng.sample(DOCUMENTS, 2);
  return {
    ref,
    wrongRef: transpose(ref, rng),
    fee: rng.pick([0, 12, 18, 25, 35, 40, 60, 75]),
    windowDays: rng.pick([5, 10, 14, 15, 21, 30]),
    document,
    wrongDocument,
    counter: rng.pick(COUNTERS),
    weekday: rng.pick(WEEKDAYS),
    cause: rng.pick(causes),
  };
}

/* ------------------------------------------------------------------ */
/* Encounter frames                                                    */
/* ------------------------------------------------------------------ */

interface Frame {
  slug: string;
  partType: string;
  orgs: string[];
  roleA: string;
  roleB: string;
  title: (org: string) => string;
  topic: string;
  /** What the caller is there about, in one clause. */
  complaint: string;
  /** Plausible root causes; one is chosen and referred to consistently. */
  causes: string[];
  /** What the caller has to do, named in the last third of the call. */
  action: string;
  feeLabel: string;
}

const FRAMES: Frame[] = [
  {
    slug: 'permit-renewal',
    partType: 'listening.problem_solving',
    orgs: ['the city permit office', 'the municipal service desk', 'the parking authority', 'the licensing counter', 'the residents’ services line'],
    roleA: 'Resident',
    roleB: 'Clerk',
    title: (org) => `A renewal that did not take effect (${org})`,
    topic: 'municipal services',
    complaint: 'renewed a residential permit online and was fined anyway',
    causes: [
      'the renewal was recorded against the previous vehicle',
      'the payment cleared after the cut-off on the renewal date',
      'the address on the account was never updated after the move',
    ],
    action: 'file a dispute and update the record on the same visit',
    feeLabel: 'administration fee',
  },
  {
    slug: 'parcel-redirect',
    partType: 'listening.information',
    orgs: ['the depot', 'the parcel office', 'the regional sorting centre', 'the courier’s customer line', 'the collection point'],
    roleA: 'Customer',
    roleB: 'Agent',
    title: (org) => `A parcel held at the wrong depot (${org})`,
    topic: 'deliveries',
    complaint: 'was told a parcel was delivered when it was not',
    causes: [
      'the driver marked it delivered at the depot rather than at the door',
      'the address matched two streets with the same name in different districts',
      'the buzzer code on the order was one digit short',
    ],
    action: 'collect it in person or pay to have it redirected',
    feeLabel: 'redirection fee',
  },
  {
    slug: 'appointment-rebook',
    partType: 'listening.problem_solving',
    orgs: ['the clinic', 'the assessment centre', 'the specialist office', 'the health centre', 'the outpatient desk'],
    roleA: 'Patient',
    roleB: 'Receptionist',
    title: (org) => `Rebooking after a missed appointment (${org})`,
    topic: 'health services',
    complaint: 'missed an appointment and was charged for it',
    causes: [
      'the reminder went to an old phone number on the file',
      'the appointment was moved by the clinic and the letter arrived late',
      'two appointments were booked and only one was cancelled',
    ],
    action: 'rebook in person and ask for the charge to be reviewed',
    feeLabel: 'missed-appointment charge',
  },
  {
    slug: 'utility-billing',
    partType: 'listening.information',
    orgs: ['the utility office', 'the billing department', 'the energy provider', 'the water authority', 'the accounts line'],
    roleA: 'Customer',
    roleB: 'Advisor',
    title: (org) => `A bill that does not match the meter (${org})`,
    topic: 'household bills',
    complaint: 'received a bill several times higher than usual',
    causes: [
      'the reading was estimated rather than taken',
      'the account was billed for the neighbouring unit for two quarters',
      'the tariff changed at renewal without the discount being reapplied',
    ],
    action: 'submit a current reading and request a recalculation',
    feeLabel: 'reconnection fee',
  },
  {
    slug: 'course-transfer',
    partType: 'listening.information',
    orgs: ['the registrar', 'the admissions office', 'the training centre', 'the student services desk', 'the programme office'],
    roleA: 'Student',
    roleB: 'Adviser',
    title: (org) => `Transferring between course sections (${org})`,
    topic: 'education',
    complaint: 'wants to move to a different section of the same course',
    causes: [
      'the section they want reached its cap the day before',
      'the two sections are assessed on different dates',
      'the transfer was approved but never processed by the system',
    ],
    action: 'submit the transfer form and confirm the assessment date',
    feeLabel: 'transfer fee',
  },
  {
    slug: 'workplace-scheduling',
    partType: 'listening.problem_solving',
    orgs: ['the scheduling office', 'the staffing desk', 'the operations team', 'the payroll line', 'the depot supervisor'],
    roleA: 'Employee',
    roleB: 'Coordinator',
    title: (org) => `A shift recorded incorrectly (${org})`,
    topic: 'workplace',
    complaint: 'worked a shift that does not appear on the timesheet',
    causes: [
      'the shift was entered under the cover worker rather than the person who took it',
      'the badge did not register at the start of the shift',
      'the change was agreed verbally and never entered',
    ],
    action: 'submit the correction before the payroll cut-off',
    feeLabel: 'late-submission penalty',
  },
];

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

type Turn = NonNullable<SeedStimulus['script']>[number];

function buildScript(frame: Frame, facts: Facts, org: string, rng: Rng): Turn[] {
  const a = (text: string): Turn => ({ speaker: frame.roleA, voice: 'speaker_a', text });
  const b = (text: string): Turn => ({ speaker: frame.roleB, voice: 'speaker_b', text });
  void rng;
  const feeText = facts.fee === 0 ? 'there is no charge' : `there is a $${facts.fee} ${frame.feeLabel}`;

  return [
    {
      speaker: 'Narrator',
      voice: 'narrator',
      text: `You will hear a conversation between a ${frame.roleA.toLowerCase()} and ${
        frame.roleB === 'Agent' ? 'an' : 'a'
      } ${frame.roleB.toLowerCase()} at ${org}. You will hear it once.`,
    },
    a(`Hi — I ${frame.complaint}, and I am trying to work out what happened.`),
    b('I can look into that. Do you have a reference number on the confirmation?'),
    // The self-correction. Everything before "sorry" is void, which is the
    // single most reliable listening trap in service encounters.
    a(
      `Yes, it is ${speakDigits(facts.wrongRef)} — sorry, that is wrong. ${speakDigits(
        facts.ref,
      )}. I read the line above.`,
    ),
    b(`${capitalise(speakDigits(facts.ref))}. Right, I have it here on the screen.`),
    a('So can you see what went wrong?'),
    b(`I can. What has happened is that ${facts.cause}. That is why it looks correct at your end and not at ours.`),
    a('Nobody told me that was possible.'),
    b(
      rng.pick([
        'You are the third person this month. It has been raised internally more than once.',
        'It is not obvious, and the confirmation you got does not mention it at all.',
        'I would not expect you to know that. It is a known gap and it is not on you.',
      ]),
    ),
    a('All right. What do I need to do?'),
    b(`The route is to ${frame.action}. To do that you have ${facts.windowDays} days, and ${feeText}.`),
    a(`${facts.windowDays} days from today?`),
    // A second trap: the window runs from a printed date, not from the call.
    b(
      `From the date printed on the notice, not from today and not from the day you opened it. People lose a week that way.`,
    ),
    a('And can I do it here, or does it have to be online?'),
    b(
      `Either, but if you come in, bring ${facts.document}. Not ${facts.wrongDocument} — I know it seems like it should count, but it does not prove what we need it to.`,
    ),
    a('I have that at home. Where would I take it?'),
    b(`Bring it to ${facts.counter}. And come before Thursday if you can — ${facts.weekday} is the slowest day, and after that the queue builds.`),
    a('One more thing. Will this happen again next time?'),
    b(
      `Not if the record is corrected while you are here. That is the part people skip, because the dispute feels like the urgent bit — but the dispute fixes this one and the correction fixes the next one.`,
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Questions, keyed off the facts                                      */
/* ------------------------------------------------------------------ */

function option(key: string, text: string, rationale: string) {
  return { key, text, rationale };
}

function shuffleOptions(question: SeedQuestion, rng: Rng): SeedQuestion {
  const keyed = question.options.find((o) => o.key === question.answerKey)!;
  const reordered = rng.shuffle(question.options);
  const options = reordered.map((o, i) => ({ ...o, key: ['A', 'B', 'C', 'D'][i] }));
  return { ...question, options, answerKey: options[reordered.indexOf(keyed)].key };
}

function buildQuestions(frame: Frame, facts: Facts, rng: Rng, slug: string): SeedQuestion[] {
  const other = (exclude: number[], make: () => number) => {
    let value = make();
    let guard = 0;
    while (exclude.includes(value) && guard++ < 40) value = make();
    return value;
  };

  const questions: SeedQuestion[] = [
    {
      slug: `${slug}-q1`,
      microSkill: 'listening.distractor_resistance',
      prompt: 'What is the reference number?',
      options: [
        option('A', facts.ref, 'Correct: this is the corrected number, and the second speaker repeats it back to confirm.'),
        option('B', facts.wrongRef, 'This is the first version, which the speaker immediately withdraws with “sorry, that is wrong”.'),
        option('C', distinctTranspose(facts.wrongRef, [facts.ref, facts.wrongRef], rng), 'Neither version said in the conversation — the digits are rearranged again.'),
        option('D', String(Number(facts.ref) + 1), 'Close to the right number but not the one given.'),
      ],
      answerKey: 'A',
      explanation:
        'A self-correction replaces what came before it: once a speaker says “sorry” or “actually”, the earlier version is void, not something to average against the new one. The confirmation is the second speaker repeating the number back — in a real service call that read-back is nearly always the reliable version.',
      takeaway: 'Listen for “sorry”, “actually”, “make that”. Overwrite what you had; do not try to reconcile it.',
      level: 8,
      difficulty: 7.5,
      targetSeconds: 30,
    },
    {
      slug: `${slug}-q3`,
      microSkill: 'listening.detail_recall',
      prompt: 'How long does the caller have to act?',
      options: [
        option('A', `${facts.windowDays} days`, 'Correct: this is the window stated when the next step is explained.'),
        option('B', `${other([facts.windowDays], () => [5, 10, 14, 15, 21, 30][rng.int(0, 5)])} days`, 'A plausible window, but not the one given in this conversation.'),
        option('C', `${facts.windowDays} days from the call`, 'The number is right and the starting point is wrong — it runs from the date printed on the notice.'),
        option('D', 'There is no deadline', 'A deadline is stated explicitly and emphasised.'),
      ],
      answerKey: 'A',
      explanation:
        'Two things are said about the deadline and they are easy to merge: how long it is, and when it starts. The length is the answer to this question; the start date is the trap, and it is why option C exists. When a speaker corrects a listener’s assumption — “not from today” — that correction is almost always tested.',
      takeaway: 'A deadline has a length and a starting point. Note both; questions separate them.',
      level: 9,
      difficulty: 8.4,
      targetSeconds: 30,
    },
    {
      slug: `${slug}-q4`,
      microSkill: 'listening.note_taking',
      prompt: 'What must the caller bring?',
      options: [
        option('A', facts.document, 'Correct: this is what is asked for when the in-person route is explained.'),
        option('B', facts.wrongDocument, 'Named in the same sentence — as the thing that does not count.'),
        option('C', 'Both of the documents mentioned', 'Only one is accepted; the other is explicitly ruled out.'),
        option('D', 'Nothing, if the visit is in person', 'The document requirement applies precisely to the in-person route.'),
      ],
      answerKey: 'A',
      explanation:
        'When two items appear in one sentence, one is usually being excluded. “Bring X. Not Y” is a very common shape in service instructions, and a listener who catches both nouns but not the negation ends up choosing the wrong one — or, worse, both.',
      takeaway: 'Note the negation, not just the nouns. “Not Y” is as much information as “bring X”.',
      level: 9,
      difficulty: 8.6,
      targetSeconds: 30,
    },
    {
      slug: `${slug}-q5`,
      microSkill: 'listening.detail_recall',
      prompt: 'Where is the caller told to go?',
      options: [
        option('A', facts.counter, 'Correct: this is the location named for handing the document in.'),
        option('B', COUNTERS.filter((c) => c !== facts.counter)[rng.int(0, COUNTERS.length - 2)], 'A location of the same kind, but not the one named.'),
        option('C', 'Back to where the original notice was issued', 'Never suggested anywhere in the conversation.'),
        option('D', 'Any counter, since the record is now corrected', 'The record is corrected during the visit, not before it.'),
      ],
      answerKey: 'A',
      explanation:
        'Place details arrive late in a call, after the listener has usually stopped taking notes because the problem feels solved. That is exactly why they are tested — the last third of a service conversation carries the instructions, not the diagnosis.',
      takeaway: 'Keep writing after the problem is explained. Instructions come after the diagnosis, not with it.',
      level: 8,
      difficulty: 7.8,
      targetSeconds: 30,
    },
  ];

  // The fee question only exists when the number is unambiguous. If the fee is
  // zero the honest item is about whether there is a charge at all.
  questions.splice(1, 0, {
    slug: `${slug}-q2`,
    microSkill: 'listening.detail_recall',
    prompt: facts.fee === 0 ? 'What is said about the cost?' : `What is the ${frame.feeLabel}?`,
    options:
      facts.fee === 0
        ? [
            option('A', 'There is no charge', 'Correct: the cost is stated as nothing when the next step is explained.'),
            option('B', 'It depends on how quickly the caller acts', 'Timing affects the deadline, not the cost.'),
            option('C', 'It is refunded once the record is corrected', 'No refund is mentioned; there is nothing to refund.'),
            option('D', 'It has not been decided yet', 'The answer is given directly and without hedging.'),
          ]
        : [
            option('A', `$${facts.fee}`, 'Correct: this is the figure given with the deadline.'),
            option('B', `$${facts.fee + rng.pick([5, 10, 15])}`, 'A plausible amount, but higher than the figure stated.'),
            option('C', 'There is no charge', 'A charge is stated explicitly.'),
            option('D', `$${Math.max(1, facts.fee - rng.pick([5, 8]))}`, 'Close to the figure given, and below it.'),
          ],
    answerKey: 'A',
    explanation:
      'The cost and the deadline are delivered in the same breath, which is what makes both easy to lose. A number heard once, inside a sentence carrying a second number, is the standard shape of a detail-recall item — and the standard reason for missing one.',
    takeaway: 'When a sentence carries two figures, write both down before the speaker finishes it.',
    level: 8,
    difficulty: 7.4,
    targetSeconds: 30,
  });

  return questions.map((q) => shuffleOptions(q, rng));
}

/* ------------------------------------------------------------------ */

/**
 * Build one generated listening encounter.
 *
 * Returns null only if the sampled facts collide in a way that would leave an
 * item without a unique key — the same refusal the other generators make.
 */
export function generateDialogueStimulus(seed: string): SeedStimulus | null {
  const rng = new Rng(seed);
  const frame = rng.pick(FRAMES);
  const org = rng.pick(frame.orgs);
  const facts = buildFacts(rng, frame.causes);

  if (facts.ref === facts.wrongRef) return null;
  if (facts.document === facts.wrongDocument) return null;

  const script = buildScript(frame, facts, org, rng);
  const questions = buildQuestions(frame, facts, rng, `gen-dlg-${frame.slug}-${seed}`);

  // Every option must be distinct, or the item has no defensible key.
  for (const question of questions) {
    const texts = question.options.map((o) => o.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) return null;
  }

  return {
    slug: `gen-dlg-${frame.slug}-${seed}`,
    skill: 'listening',
    partType: frame.partType,
    title: frame.title(org),
    script,
    level: 9,
    topic: frame.topic,
    questions,
  };
}
