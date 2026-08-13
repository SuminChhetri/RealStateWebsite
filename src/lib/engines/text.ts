/**
 * Deterministic linguistic primitives shared by the writing and speaking
 * analysers.
 *
 * Everything here is transparent, rule-based computation. No statistical model
 * is involved and none is implied: functions return measurements, and the
 * analysers turn measurements into coaching. Where a measurement is a proxy
 * for something it cannot observe directly, the proxy is named in the code and
 * surfaced to the learner as a limitation.
 */

/* ------------------------------------------------------------------ */
/* Segmentation                                                        */
/* ------------------------------------------------------------------ */

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc', 'e.g', 'i.e', 'approx', 'dept',
]);

/**
 * Abbreviations that frequently *end* a sentence ("…at 4 p.m. She left.").
 * These are not treated as blockers; the single-letter guard below is what
 * stops the split happening at the internal full stop.
 */

export function sentences(text: string): string[] {
  const out: string[] = [];
  let buffer = '';
  const chars = text.replace(/\s+/g, ' ').trim();
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    buffer += ch;
    if (ch === '.' || ch === '!' || ch === '?') {
      // Look back for an abbreviation, and forward for a capital letter.
      const tail = buffer.trimEnd().replace(/[.!?]+$/, '');
      const lastWord = tail.split(/[\s(]/).pop()?.toLowerCase() ?? '';
      // Look far enough ahead to clear an opening quote or bracket before the
      // capital: ` "N` is a sentence boundary, and a two-character window
      // would never reach the letter.
      const next = chars.slice(i + 1, i + 5);
      const looksLikeEnd = /^\s+["'“(]?[A-Z0-9]/.test(next) || i === chars.length - 1;
      // A single letter before the stop is an initial or part of an
      // abbreviation ("4 p.m.", "J. Okonkwo") — never a sentence boundary.
      if (!ABBREVIATIONS.has(lastWord) && lastWord.length !== 1 && looksLikeEnd) {
        out.push(buffer.trim());
        buffer = '';
      }
    }
  }
  if (buffer.trim()) out.push(buffer.trim());
  return out.filter((s) => /\w/.test(s));
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'’-]*/g) ?? []).map((w) =>
    w.replace(/['’]s$/, '').replace(/^[-']+|[-']+$/g, ''),
  );
}

export function wordCount(text: string): number {
  return words(text).length;
}

/* ------------------------------------------------------------------ */
/* Frequency bands                                                     */
/* ------------------------------------------------------------------ */

/**
 * Band 1: the ~300 highest-frequency English word families. Heavy reliance on
 * this band with nothing above it is the clearest signal of a restricted
 * productive lexicon.
 */
const BAND1 = new Set(
  `the be to of and a in that have i it for not on with he as you do at this but his by from they we
say her she or an will my one all would there their what so up out if about who get which go me when
make can like time no just him know take people into year your good some could them see other than
then now look only come its over think also back after use two how our work first well way even new
want because any these give day most us is are was were been being has had did does am not don t s
very much many more more little few thing man woman child life world school house room car money
water food friend family week month day night morning today tomorrow yesterday name number place
part group problem question answer point end start begin help need try ask tell feel find keep let
put mean become leave show hear play run move live believe hold bring happen write provide sit stand
lose pay meet include continue set learn change lead understand watch follow stop create speak read
allow add spend grow open walk win offer remember love consider appear buy wait serve die send build
stay fall cut reach kill remain suggest raise pass sell require report decide pull good new first
last long great little own old right big high different small large next early young important public
bad same able`
    .split(/\s+/)
    .filter(Boolean),
);

/**
 * Band 3: mid-frequency academic and professional vocabulary. Presence here,
 * used correctly, is what separates a CLB 9 response from a CLB 11 one.
 */
const BAND3 = new Set(
  `accommodate acknowledge adequate advocate allocate alternative ambiguous anticipate apparent
appreciable arbitrary assess assumption attribute clarify coherent collaborate commence compensate
compile comprehensive conceive conclude consequently considerable consistent constitute constrain
contradict contribute controversy convey coordinate corresponding credible crucial cumulative
demonstrate denote deviate differentiate diminish discrepancy displace distinguish diverse dominate
elaborate eliminate emerge emphasis empirical enable encounter enhance enormous entail equivalent
establish evaluate eventual evident exceed exclude exhibit expand explicit exploit extract facilitate
feasible fluctuate formulate fundamental generate hierarchy hypothesis identical illustrate implement
implication incentive incline incorporate indicate inevitable infer inherent inhibit initiate
innovative insight integral integrate intense interpret intervene intrinsic justify legislate
leverage liable manipulate marginal maximise mediate methodology minimise mitigate modify monitor
mutual negate negligible nevertheless notion nonetheless notwithstanding objective obtain obvious
occupy offset ongoing optimal outcome overlap oversee paradigm parameter partial perceive persist
perspective phenomenon plausible practitioner precede precise predominant preliminary presume prior
proceed prohibit prominent proportion pursue radical rational reciprocal refine reinforce reluctant
render reservation resolve restrain retain reveal revise rigid sanction scenario scope sector
sequential significant simulate simultaneous somewhat specify stability straightforward subordinate
subsequent substantial substitute sufficient supplement suppress sustain tangible tension terminate
theoretical thereby threshold transition transmit transparent trigger ultimate undergo underlying
undertake uniform unify utilise valid vary vehicle viable virtual visible voluntary widespread
willingness accountable acute adverse affirm aggregate align allege alleviate amend ample analogous
articulate ascertain aspire attain augment avert bolster candid circumvent coincide commend
compelling compile compromise conducive confer consensus consolidate contingent convene curtail
deem deliberate deploy deter deviate discern disclose discretion disparity dispel disregard
distinctive divert elicit embody encompass endorse endure enrich entrench envisage equitable
erode escalate exemplify exert expedite explicit extensive foster gauge grapple hinder impede
impose incremental indispensable induce inequity instil interim intricate invoke lucrative
manifest mandate merit mitigate nuance offset outweigh overhaul paramount penalise perpetuate
pertinent pivotal precedent preclude predisposition prerequisite prevalent prioritise proactive
proficient profound proliferate prompt prone provisional prudent quantify reconcile rectify
redress refute reiterate relinquish remedy replicate reputable resilient resonate scrutinise
seamless solicit sparse stagnate stipulate streamline subtle succinct supersede surpass tailor
tentative transcend unprecedented underscore uphold vigilant warrant`
    .split(/\s+/)
    .filter(Boolean),
);

export type FrequencyBand = 1 | 2 | 3;

export function frequencyBand(word: string): FrequencyBand {
  const w = word.toLowerCase();
  if (BAND1.has(w)) return 1;
  if (BAND3.has(w) || BAND3.has(w.replace(/(ed|ing|s|ly|ion|ions|ment|ments|ance|ence)$/, ''))) {
    return 3;
  }
  return 2;
}

export interface LexicalProfile {
  tokens: number;
  types: number;
  /** Moving-average type–token ratio (window 40) — length-robust diversity. */
  mattr: number;
  band1Share: number;
  band3Share: number;
  /**
   * Share of tokens outside the top-300 band that are six letters or longer.
   * A broader signal than band-3 hits alone: a response can show real range
   * through mid-frequency professional vocabulary without using any word from
   * a curated academic list.
   */
  midFrequencyShare: number;
  /** Distinct band-3 words actually used. */
  sophisticatedWords: string[];
  /** Distinct mid-frequency words, used as evidence when band 3 is empty. */
  midFrequencyWords: string[];
  /** Content words used four or more times — the repetition the reader notices. */
  overusedWords: { word: string; count: number }[];
  averageWordLength: number;
}

const FUNCTION_WORDS = new Set(
  `the a an and or but so if then than that this these those there here of in on at to for with from
by as is are was were be been being am do does did have has had will would can could shall should may
might must not no nor it its i you he she we they me him her us them my your his our their which who
whom whose what when where why how all any both each few more most other some such only own same too
very just about into over under again further once`.split(/\s+/),
);

export function lexicalProfile(text: string): LexicalProfile {
  const toks = words(text);
  const counts = new Map<string, number>();
  for (const t of toks) counts.set(t, (counts.get(t) ?? 0) + 1);

  const window = 40;
  let mattr = 0;
  if (toks.length <= window) {
    mattr = toks.length ? new Set(toks).size / toks.length : 0;
  } else {
    let sum = 0;
    for (let i = 0; i + window <= toks.length; i++) {
      sum += new Set(toks.slice(i, i + window)).size / window;
    }
    mattr = sum / (toks.length - window + 1);
  }

  let band1 = 0;
  let midFrequency = 0;
  const band3 = new Set<string>();
  const mid = new Set<string>();
  for (const t of toks) {
    const band = frequencyBand(t);
    if (band === 1) band1++;
    if (band === 3) band3.add(t);
    if (band !== 1 && t.length >= 6 && !FUNCTION_WORDS.has(t)) {
      midFrequency++;
      mid.add(t);
    }
  }

  const overused = [...counts.entries()]
    .filter(([w, c]) => c >= 4 && !FUNCTION_WORDS.has(w) && w.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));

  return {
    tokens: toks.length,
    types: counts.size,
    mattr: round(mattr, 3),
    band1Share: toks.length ? round(band1 / toks.length, 3) : 0,
    band3Share: toks.length ? round([...band3].length / Math.max(1, counts.size), 3) : 0,
    midFrequencyShare: toks.length ? round(midFrequency / toks.length, 3) : 0,
    sophisticatedWords: [...band3].sort(),
    midFrequencyWords: [...mid].sort(),
    overusedWords: overused,
    averageWordLength: toks.length
      ? round(toks.reduce((a, w) => a + w.length, 0) / toks.length, 2)
      : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Syntax proxies                                                      */
/* ------------------------------------------------------------------ */

const SUBORDINATORS = [
  'although', 'though', 'even though', 'whereas', 'while', 'because', 'since', 'as long as',
  'unless', 'until', 'whenever', 'wherever', 'if', 'provided that', 'so that', 'in order that',
  'once', 'after', 'before', 'given that', 'assuming that', 'despite the fact that',
];

const RELATIVIZERS = ['which', 'who', 'whom', 'whose', 'that'];

export interface SyntaxProfile {
  sentenceCount: number;
  meanSentenceLength: number;
  /** Standard deviation of sentence length — the measure of variety. */
  sentenceLengthSd: number;
  shortSentences: number;
  longSentences: number;
  subordinationRatio: number;
  relativeClauseCount: number;
  /** Sentences beginning with an adverbial or participial phrase. */
  frontedCount: number;
  passiveApprox: number;
  /** Sentences that open with the same first word as the previous sentence. */
  repeatedOpeners: number;
}

export function syntaxProfile(text: string): SyntaxProfile {
  const sents = sentences(text);
  const lens = sents.map((s) => words(s).length);
  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const variance = lens.length
    ? lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length
    : 0;

  const lower = text.toLowerCase();
  const subordinators = SUBORDINATORS.reduce(
    (acc, s) => acc + countOccurrences(lower, ` ${s} `) + countOccurrences(lower, `${s} `, true),
    0,
  );
  const relatives = RELATIVIZERS.reduce((acc, r) => acc + countOccurrences(lower, ` ${r} `), 0);
  const passive = (lower.match(/\b(is|are|was|were|been|being|be)\s+\w+(ed|en)\b/g) ?? []).length;

  let fronted = 0;
  let repeatedOpeners = 0;
  let prevOpener = '';
  for (const s of sents) {
    const firstComma = s.indexOf(',');
    if (firstComma > 0 && firstComma < 40 && !/^\s*["'“]/.test(s)) fronted++;
    const opener = words(s)[0] ?? '';
    if (opener && opener === prevOpener) repeatedOpeners++;
    prevOpener = opener;
  }

  return {
    sentenceCount: sents.length,
    meanSentenceLength: round(mean, 1),
    sentenceLengthSd: round(Math.sqrt(variance), 1),
    shortSentences: lens.filter((l) => l < 8).length,
    longSentences: lens.filter((l) => l > 32).length,
    subordinationRatio: sents.length ? round(subordinators / sents.length, 2) : 0,
    relativeClauseCount: relatives,
    frontedCount: fronted,
    passiveApprox: passive,
    repeatedOpeners,
  };
}

function countOccurrences(haystack: string, needle: string, startOnly = false): number {
  if (startOnly) return haystack.startsWith(needle) ? 1 : 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

/* ------------------------------------------------------------------ */
/* Cohesion                                                            */
/* ------------------------------------------------------------------ */

export const CONNECTIVES: Record<string, string[]> = {
  addition: ['also', 'in addition', 'furthermore', 'moreover', 'besides', 'what is more'],
  contrast: ['however', 'on the other hand', 'nevertheless', 'nonetheless', 'that said', 'yet', 'whereas', 'although', 'even so'],
  cause: ['because', 'since', 'as a result', 'consequently', 'therefore', 'thus', 'hence', 'for this reason'],
  example: ['for example', 'for instance', 'to illustrate', 'such as', 'in particular', 'specifically'],
  concession: ['admittedly', 'granted', 'of course', 'it is true that', 'while it is true'],
  sequence: ['first', 'firstly', 'second', 'secondly', 'finally', 'next', 'then', 'lastly'],
  summary: ['in short', 'overall', 'in conclusion', 'to sum up', 'on balance', 'ultimately'],
};

export interface CohesionProfile {
  /** Mean content-word overlap between consecutive sentences (0–1). */
  adjacentOverlap: number;
  /**
   * Sentences opening with a reference to the previous one ("That payment…",
   * "This means…"). Lexical overlap misses these entirely, yet reference is the
   * cohesion device strong writers actually use — counting only repeated words
   * would penalise exactly the writing the product is trying to teach.
   */
  referenceLinks: number;
  /** Share of sentence transitions carried by overlap or reference. */
  linkedShare: number;
  connectiveCount: number;
  connectiveTypes: string[];
  /** Same connective used three or more times. */
  overusedConnectives: string[];
  /** Pronouns with no candidate antecedent in the previous sentence. */
  danglingReferences: number;
}

export function cohesionProfile(text: string): CohesionProfile {
  const sents = sentences(text);
  const contentSets = sents.map(
    (s) => new Set(words(s).filter((w) => !FUNCTION_WORDS.has(w) && w.length > 3)),
  );

  const REFERENCE_OPENER =
    /^\s*(that|this|these|those|such|it|they|he|she|his|her|their|its|the same|which)\b/i;

  let overlapSum = 0;
  let pairs = 0;
  let referenceLinks = 0;
  let linked = 0;
  for (let i = 1; i < contentSets.length; i++) {
    const prev = contentSets[i - 1];
    const cur = contentSets[i];
    const isReference = REFERENCE_OPENER.test(sents[i]);
    if (isReference) referenceLinks++;
    if (!prev.size || !cur.size) continue;
    let shared = 0;
    for (const w of cur) if (prev.has(w) || [...prev].some((p) => stemEq(p, w))) shared++;
    const overlap = shared / cur.size;
    overlapSum += overlap;
    if (overlap > 0.05 || isReference) linked++;
    pairs++;
  }

  const lower = ` ${text.toLowerCase()} `;
  const found: string[] = [];
  const counts = new Map<string, number>();
  for (const [type, list] of Object.entries(CONNECTIVES)) {
    for (const c of list) {
      const n = countOccurrences(lower, ` ${c} `) + countOccurrences(lower, ` ${c},`);
      if (n > 0) {
        found.push(type);
        counts.set(c, (counts.get(c) ?? 0) + n);
      }
    }
  }

  let dangling = 0;
  for (let i = 0; i < sents.length; i++) {
    if (/^\s*(it|they|this|these|those|he|she)\b/i.test(sents[i]) && i === 0) dangling++;
  }

  return {
    adjacentOverlap: pairs ? round(overlapSum / pairs, 3) : 0,
    referenceLinks,
    linkedShare: pairs ? round(linked / pairs, 3) : 0,
    connectiveCount: [...counts.values()].reduce((a, b) => a + b, 0),
    connectiveTypes: [...new Set(found)],
    overusedConnectives: [...counts.entries()].filter(([, n]) => n >= 3).map(([c]) => c),
    danglingReferences: dangling,
  };
}

function stemEq(a: string, b: string): boolean {
  const stem = (w: string) => w.replace(/(ing|ed|es|s|ly|ion|ions|ment|al)$/, '');
  return a.length > 4 && b.length > 4 && stem(a) === stem(b);
}

/* ------------------------------------------------------------------ */
/* Readability                                                         */
/* ------------------------------------------------------------------ */

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch–Kincaid grade level. Used to calibrate stimulus difficulty at seed time. */
export function fleschKincaid(text: string): number {
  const sents = sentences(text);
  const toks = words(text);
  if (!sents.length || !toks.length) return 0;
  const syl = toks.reduce((a, w) => a + syllables(w), 0);
  return round(0.39 * (toks.length / sents.length) + 11.8 * (syl / toks.length) - 15.59, 1);
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

export function round(n: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Content-word overlap used for requirement coverage and prompt echo checks. */
export function contentWords(text: string): Set<string> {
  return new Set(words(text).filter((w) => !FUNCTION_WORDS.has(w) && w.length > 2));
}

export function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (!a.size) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w) || [...b].some((x) => stemEq(x, w))) shared++;
  return shared / a.size;
}

/** Locate a phrase in the original text, returning a character span for highlighting. */
export function findSpan(text: string, phrase: string, from = 0): [number, number] | null {
  const idx = text.toLowerCase().indexOf(phrase.toLowerCase(), from);
  return idx === -1 ? null : [idx, idx + phrase.length];
}
