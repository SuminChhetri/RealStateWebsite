import type { SeedQuestion, SeedStimulus } from '../seed/types';
import { Rng } from './rng';

/**
 * Generated information-location material: timetables, fee schedules, service
 * listings, and the scanning questions that go with them.
 *
 * **Why this can be generated honestly.** An item is only trustworthy if its
 * key is defensible. Here the stimulus is a table of structured data, and every
 * question is a *query over that data* whose answer is computed, not written:
 * "which session costs least among those on Tuesday" is decided by comparing
 * numbers the generator itself produced. There is no judgement to fabricate and
 * no source to copy. The same is true of the distractors — each one is a row
 * that fails exactly one constraint, and the rationale names which, because the
 * generator knows which.
 *
 * That is the boundary of what is generated here. Passages requiring authorial
 * judgement — argument, tone, inference from prose — stay hand-written, because
 * a generator has nothing defensible to say about them. This module covers the
 * scanning and information-matching micro-skills, which is precisely where a
 * learner needs volume and where volume is cheap to make correct.
 */

interface Row {
  name: string;
  day: string;
  start: number; // minutes from midnight
  end: number;
  fee: number;
  location: string;
  note: string;
}

interface Domain {
  slug: string;
  orgs: string[];
  /** Column header for the first column, e.g. "Session". */
  unit: string;
  unitPlural: string;
  names: string[];
  locations: string[];
  notes: string[];
  intro: (org: string) => string;
  /** Fee bounds in whole dollars. */
  feeRange: [number, number];
  freeLabel: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DOMAINS: Domain[] = [
  {
    slug: 'community-programs',
    orgs: ['Riverbend Community Centre', 'Kilcona Recreation Centre', 'Portage Park Community Hub', 'Elm Ridge Leisure Centre'],
    unit: 'Program',
    unitPlural: 'programs',
    names: ['Lane Swim', 'Beginner Pottery', 'Chair Yoga', 'Badminton Drop-in', 'Conversation Circle', 'Woodworking Basics', 'Indoor Cycling', 'Family Skate', 'Watercolour Studio', 'Table Tennis Club'],
    locations: ['Studio A', 'Studio B', 'Main Gym', 'Pool Deck', 'Craft Room', 'Meeting Room 2'],
    notes: ['Registration required', 'Drop-in only', 'Ages 16+', 'Equipment provided', 'Bring your own mat', 'Members only'],
    intro: (org) => `The ${org} publishes its schedule each season. Fees are per session unless the listing says otherwise.`,
    feeRange: [0, 22],
    freeLabel: 'Free',
  },
  {
    slug: 'clinic-hours',
    orgs: ['Northfield Health Clinic', 'Cedar Street Medical Centre', 'Harbourview Family Practice'],
    unit: 'Service',
    unitPlural: 'services',
    names: ['Walk-in Assessment', 'Travel Vaccination', 'Blood Collection', 'Physiotherapy Intake', 'Diabetes Education', 'Foot Care', 'Prenatal Class', 'Mental Health Drop-in'],
    locations: ['Wing A', 'Wing B', 'Ground Floor', 'Second Floor', 'Annex'],
    notes: ['Referral required', 'No appointment needed', 'Health card required', 'Booked online only', 'Covered by provincial plan'],
    intro: (org) => `${org} posts its weekly service hours in the waiting room and online. Fees shown are the patient portion.`,
    feeRange: [0, 60],
    freeLabel: 'No charge',
  },
  {
    slug: 'workshop-series',
    orgs: ['Lakeshore Public Library', 'Meridian Skills Centre', 'Brookline Learning Annex'],
    unit: 'Workshop',
    unitPlural: 'workshops',
    names: ['Résumé Clinic', 'Digital Banking Basics', 'Interview Practice', 'Citizenship Test Prep', 'Small Business Taxes', 'Photo Editing', 'Bike Maintenance', 'Public Speaking Lab', 'Spreadsheets for Work'],
    locations: ['Room 101', 'Room 204', 'Computer Lab', 'Auditorium', 'Quiet Study Room'],
    notes: ['Laptop provided', 'Bring your own device', 'Limited to 12 seats', 'Newcomers priority', 'Free with library card'],
    intro: (org) => `${org} runs a rotating workshop series. Seats are released two weeks in advance.`,
    feeRange: [0, 45],
    freeLabel: 'Free',
  },
  {
    slug: 'transit-shuttle',
    orgs: ['Grandview Campus Shuttle', 'Riverside Employer Shuttle', 'Airport Connector Service'],
    unit: 'Route',
    unitPlural: 'routes',
    names: ['Route 1 — North Loop', 'Route 2 — Hospital Express', 'Route 3 — Industrial Park', 'Route 4 — Downtown Link', 'Route 5 — Station Shuttle', 'Route 6 — Evening Circuit'],
    locations: ['Bay 1', 'Bay 3', 'East Curb', 'West Curb', 'Terminal Entrance'],
    notes: ['Wheelchair accessible', 'Exact fare only', 'Pass accepted', 'Reservation required', 'Runs on statutory holidays'],
    intro: (org) => `The ${org} timetable below shows the first departure of each service. Fares are one way.`,
    feeRange: [0, 12],
    freeLabel: 'Free',
  },
];

function minutesToClock(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 < 12 ? 'a.m.' : 'p.m.';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function feeLabel(fee: number, domain: Domain): string {
  return fee === 0 ? domain.freeLabel : `$${fee}`;
}

/** A readable window like "6:30 p.m. – 8:00 p.m.". */
function window(row: Row): string {
  return `${minutesToClock(row.start)} – ${minutesToClock(row.end)}`;
}

function buildRows(domain: Domain, rng: Rng, count: number): Row[] {
  const names = rng.sample(domain.names, count);
  // At least two rows share a day, and at least one day is unused, so that
  // day-based questions have both a real comparison and a real absence.
  const dayPool = rng.sample(DAYS, Math.max(3, Math.min(DAYS.length - 1, count - 2)));

  return names.map((name, index) => {
    const day = index < dayPool.length ? dayPool[index] : rng.pick(dayPool);
    const start = rng.int(8, 19) * 60 + rng.pick([0, 15, 30, 45]);
    const durations = [45, 60, 75, 90, 120];
    const end = start + rng.pick(durations);
    const fee = rng.next() < 0.25 ? 0 : rng.int(domain.feeRange[0] + 1, domain.feeRange[1]);
    return {
      name,
      day,
      start,
      end,
      fee,
      location: rng.pick(domain.locations),
      note: rng.pick(domain.notes),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Question builders — each returns null when the data cannot support   */
/* a defensible item, which is the only correct response to that case. */
/* ------------------------------------------------------------------ */

type Builder = (rows: Row[], domain: Domain, rng: Rng, index: number) => SeedQuestion | null;

function option(key: string, text: string, rationale: string) {
  return { key, text, rationale };
}

/** Cheapest option on a given day: two constraints, so near-misses are real. */
const cheapestOnDay: Builder = (rows, domain, rng, index) => {
  const byDay = new Map<string, Row[]>();
  for (const row of rows) byDay.set(row.day, [...(byDay.get(row.day) ?? []), row]);
  const candidates = [...byDay.entries()].filter(([, list]) => list.length >= 2);
  if (!candidates.length) return null;

  const [day, list] = rng.pick(candidates);
  const sorted = [...list].sort((a, b) => a.fee - b.fee);
  const answer = sorted[0];
  if (sorted[1] && sorted[1].fee === answer.fee) return null; // no unique key

  const cheapestOverall = [...rows].sort((a, b) => a.fee - b.fee)[0];
  const distractors: { row: Row; why: string }[] = [];

  if (cheapestOverall.day !== day) {
    distractors.push({
      row: cheapestOverall,
      why: `Cheapest in the whole table at ${feeLabel(cheapestOverall.fee, domain)}, but it runs on ${cheapestOverall.day}, not ${day}.`,
    });
  }
  if (sorted[1]) {
    distractors.push({
      row: sorted[1],
      why: `Right day, but at ${feeLabel(sorted[1].fee, domain)} it costs more than ${answer.name} at ${feeLabel(answer.fee, domain)}.`,
    });
  }
  for (const row of rows) {
    if (distractors.length >= 3) break;
    if (row === answer || distractors.some((d) => d.row === row)) continue;
    distractors.push({
      row,
      why: row.day === day
        ? `On ${day}, but ${feeLabel(row.fee, domain)} is not the lowest.`
        : `Runs on ${row.day}, so the day constraint rules it out before cost matters.`,
    });
  }
  if (distractors.length < 3) return null;

  const options = [
    option('A', answer.name, `Correct. On ${day} the listed ${domain.unitPlural} are ${list.map((r) => `${r.name} (${feeLabel(r.fee, domain)})`).join(', ')}, and ${feeLabel(answer.fee, domain)} is the lowest.`),
    ...distractors.slice(0, 3).map((d, i) => option(['B', 'C', 'D'][i], d.row.name, d.why)),
  ];

  return {
    slug: `q${index}`,
    microSkill: 'reading.information_matching',
    prompt: `Which ${domain.unit.toLowerCase()} listed for ${day} costs the least?`,
    options,
    answerKey: 'A',
    explanation: `Two conditions have to hold at once: the ${domain.unit.toLowerCase()} must be on ${day}, and it must be the cheapest of those. Filter by day first — that removes most rows immediately — then compare only what is left. ${answer.name} at ${feeLabel(answer.fee, domain)} is the lowest of the ${list.length} on ${day}.`,
    takeaway: 'When a question stacks two conditions, apply the one that eliminates most rows first. Comparing every price in the table is wasted work.',
    level: 8,
    difficulty: 7.6,
    targetSeconds: 50,
  };
};

/** Availability inside a stated window: tests reading a range, not a point. */
const availableAfter: Builder = (rows, domain, rng, index) => {
  const withDay = rng.pick(rows);
  const day = withDay.day;
  const sameDay = rows.filter((r) => r.day === day);
  if (sameDay.length < 2) return null;

  const sorted = [...sameDay].sort((a, b) => a.start - b.start);
  const answer = sorted[sorted.length - 1];
  const earlier = sorted[0];
  if (answer.start === earlier.start) return null;

  // A cutoff strictly between the two, rounded to the half hour.
  const cutoff = Math.floor((earlier.start + (answer.start - earlier.start) / 2) / 30) * 30;
  if (cutoff <= earlier.start || cutoff >= answer.start) return null;
  const qualifying = sameDay.filter((r) => r.start >= cutoff);
  if (qualifying.length !== 1) return null;

  const others = rows.filter((r) => r !== answer);
  if (others.length < 3) return null;
  const picked = rng.sample(others, 3);

  const options = [
    option('A', answer.name, `Correct. It is on ${day} and starts at ${minutesToClock(answer.start)}, which is after ${minutesToClock(cutoff)}.`),
    ...picked.map((row, i) =>
      option(
        ['B', 'C', 'D'][i],
        row.name,
        row.day === day
          ? `On the right day, but it starts at ${minutesToClock(row.start)} — before ${minutesToClock(cutoff)}, so it is already under way.`
          : `Starts late enough in the day, but it runs on ${row.day}, not ${day}.`,
      ),
    ),
  ];

  return {
    slug: `q${index}`,
    microSkill: 'reading.scanning_speed',
    prompt: `Someone is free on ${day} only after ${minutesToClock(cutoff)}. Which ${domain.unit.toLowerCase()} could they attend?`,
    options,
    answerKey: 'A',
    explanation: `Only ${domain.unitPlural} on ${day} are candidates, and of those only one begins at or after ${minutesToClock(cutoff)}: ${answer.name} at ${minutesToClock(answer.start)}. The others on ${day} start earlier, so the person would arrive after they had begun.`,
    takeaway: '“After 5:30” refers to the start time, not the end time. A session that is still running is not one you can start.',
    level: 8,
    difficulty: 7.9,
    targetSeconds: 55,
  };
};

/** Arithmetic over two rows: the answer is computed, so it cannot be disputed. */
const totalCost: Builder = (rows, domain, rng, index) => {
  const paid = rows.filter((r) => r.fee > 0);
  if (paid.length < 3) return null;
  const [first, second] = rng.sample(paid, 2);
  if (!first || !second) return null;
  const total = first.fee + second.fee;

  const wrongs = [
    { value: Math.abs(first.fee - second.fee), why: 'This subtracts one fee from the other. The question asks for both together.' },
    { value: first.fee, why: `This is the fee for ${first.name} alone, without ${second.name}.` },
    { value: total + rng.pick([5, 10]), why: 'This adds a charge that is not in the table. Every figure in the answer must come from a listed fee.' },
  ].filter((w) => w.value !== total);
  if (wrongs.length < 3) return null;

  return {
    slug: `q${index}`,
    microSkill: 'reading.literal_detail',
    prompt: `How much would it cost to attend both ${first.name} and ${second.name} once each?`,
    options: [
      option('A', `$${total}`, `Correct. ${first.name} is $${first.fee} and ${second.name} is $${second.fee}, so together they come to $${total}.`),
      ...wrongs.slice(0, 3).map((w, i) => option(['B', 'C', 'D'][i], `$${w.value}`, w.why)),
    ],
    answerKey: 'A',
    explanation: `Read the fee column for each named ${domain.unit.toLowerCase()} and add: $${first.fee} + $${second.fee} = $${total}. The trap in questions like this is answering from one row because the second figure sits further down the table.`,
    takeaway: 'When a question names two things, confirm you have found both before you compute. Most errors here are missing rows, not bad arithmetic.',
    level: 7,
    difficulty: 6.8,
    targetSeconds: 45,
  };
};

/** Condition lookup: the note column carries the constraint. */
const conditionLookup: Builder = (rows, domain, rng, index) => {
  const counts = new Map<string, Row[]>();
  for (const row of rows) counts.set(row.note, [...(counts.get(row.note) ?? []), row]);
  const unique = [...counts.entries()].filter(([, list]) => list.length === 1);
  if (!unique.length) return null;

  const [note, [answer]] = rng.pick(unique);
  const others = rows.filter((r) => r !== answer);
  if (others.length < 3) return null;

  return {
    slug: `q${index}`,
    microSkill: 'reading.information_matching',
    prompt: `Which ${domain.unit.toLowerCase()} is listed as “${note}”?`,
    options: [
      option('A', answer.name, `Correct. Its entry in the conditions column reads “${note}”.`),
      ...rng.sample(others, 3).map((row, i) =>
        option(['B', 'C', 'D'][i], row.name, `Its condition is “${row.note}”, which is a different requirement.`),
      ),
    ],
    answerKey: 'A',
    explanation: `The conditions column is the only place this appears. Scanning one column top to bottom for an exact phrase is far faster than reading each row in full, and it is what this question is testing.`,
    takeaway: 'For a “which one is marked X” question, scan the single column that could contain X. Reading rows is the slow path.',
    level: 7,
    difficulty: 6.4,
    targetSeconds: 40,
  };
};

/** Negative question: what is *not* available, which learners systematically misread. */
const notAvailable: Builder = (rows, domain, rng, index) => {
  const used = new Set(rows.map((r) => r.day));
  const free = DAYS.filter((d) => !used.has(d));
  if (!free.length) return null;
  const answer = rng.pick(free);
  const present = rng.sample([...used], 3);
  if (present.length < 3) return null;

  return {
    slug: `q${index}`,
    microSkill: 'reading.scanning_speed',
    prompt: `On which day are no ${domain.unitPlural} offered at all?`,
    options: [
      option('A', answer, `Correct. ${answer} does not appear anywhere in the day column.`),
      ...present.map((day, i) => {
        const examples = rows.filter((r) => r.day === day);
        return option(
          ['B', 'C', 'D'][i],
          day,
          `${examples.length} ${examples.length === 1 ? 'listing runs' : 'listings run'} on ${day}, including ${examples[0].name}.`,
        );
      }),
    ],
    answerKey: 'A',
    explanation: `A negative question inverts the usual search: you are looking for the day with no entry rather than the day with one. The reliable method is to collect the set of days that do appear, then find the option missing from that set.`,
    takeaway: 'Underline the word “no” or “not” before you start scanning. Answering a negative question positively is one of the most common avoidable losses.',
    level: 8,
    difficulty: 7.2,
    targetSeconds: 45,
  };
};

const BUILDERS: Builder[] = [cheapestOnDay, availableAfter, totalCost, conditionLookup, notAvailable];

/**
 * Reorder options and reassign keys.
 *
 * The builders above are written with the key first because that is far easier
 * to read and check. Leaving it there would put every answer at A, so the order
 * is randomised once at the end. Delivery shuffles again per attempt; this pass
 * exists so the stored item is not itself skewed.
 */
function shuffleOptions(question: SeedQuestion, rng: Rng): SeedQuestion {
  const keyed = question.options.find((o) => o.key === question.answerKey)!;
  const reordered = rng.shuffle(question.options);
  const options = reordered.map((option, i) => ({ ...option, key: ['A', 'B', 'C', 'D'][i] }));
  return {
    ...question,
    options,
    answerKey: options[reordered.indexOf(keyed)].key,
  };
}

/**
 * Build one generated stimulus with `questionCount` items.
 *
 * Returns null when the sampled data cannot support enough defensible
 * questions. The caller retries with a different seed rather than lowering the
 * standard — an item with a disputable key is worse than no item.
 */
export function generateScheduleStimulus(seed: string, questionCount = 5): SeedStimulus | null {
  const rng = new Rng(seed);
  const domain = rng.pick(DOMAINS);
  const org = rng.pick(domain.orgs);
  const rows = buildRows(domain, rng, rng.int(6, 7));

  const questions: SeedQuestion[] = [];
  for (const builder of rng.shuffle(BUILDERS)) {
    if (questions.length >= questionCount) break;
    const question = builder(rows, domain, rng, questions.length + 1);
    if (question) questions.push(question);
  }
  if (questions.length < Math.min(3, questionCount)) return null;

  return {
    slug: `gen-${domain.slug}-${seed}`,
    skill: 'reading',
    partType: 'reading.information',
    title: `${org}: ${domain.unit} schedule`,
    body: domain.intro(org),
    figure: {
      kind: 'schedule',
      caption: `${org} — current ${domain.unitPlural}`,
      columns: [domain.unit, 'Day', 'Time', 'Fee', 'Location', 'Conditions'],
      rows: rows.map((r) => [r.name, r.day, window(r), feeLabel(r.fee, domain), r.location, r.note]),
      note: 'Times shown are start and end. Fees are per session.',
    },
    level: 8,
    topic: domain.slug,
    questions: questions.map((q, i) =>
      shuffleOptions({ ...q, slug: `gen-${domain.slug}-${seed}-q${i + 1}` }, rng),
    ),
  };
}
