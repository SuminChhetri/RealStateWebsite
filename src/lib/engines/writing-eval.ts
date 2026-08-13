/**
 * Writing analyser — `local-linguistic-v1`.
 *
 * What this is: a transparent, rule-based analyser. It measures observable
 * properties of a response (coverage of the required content points, support
 * density, cohesion, lexical range, syntactic variety, usage errors) and maps
 * those measurements onto Meridian practice levels through published
 * thresholds. Every number it reports can be traced to a measurement, and
 * every measurement is shown to the learner as evidence.
 *
 * What this is not: a trained scoring model, and not an official CELPIP
 * assessment. It cannot judge whether an argument is persuasive, whether a
 * cultural reference lands, or whether an unusual stylistic choice works. Those
 * limitations are returned in `limitations` and rendered in the UI rather than
 * hidden.
 *
 * The seam for a future model provider is `EvaluationEngine` in
 * `lib/engines/provider.ts`: swapping in an LLM-backed analyser means adding a
 * provider, not rewriting the calling code.
 */
import {
  clamp,
  cohesionProfile,
  contentWords,
  lexicalProfile,
  overlapRatio,
  paragraphs,
  round,
  sentences,
  syntaxProfile,
  wordCount,
  words,
} from './text';
import { errorLoad, runUsageRules, type UsageFinding } from './usage-rules';

export const WRITING_ENGINE = 'local-linguistic';
export const WRITING_ENGINE_VERSION = '1.0.0';

export interface WritingTaskSpec {
  taskType: string;
  title: string;
  scenario: string;
  instructions: string;
  requirements: string[];
  choices?: string[] | null;
  minWords: number;
  maxWords: number;
  register: 'formal' | 'semi_formal' | 'informal';
  timeLimitSeconds: number;
}

export interface DimensionResult {
  microSkill: string;
  level: number;
  /** Observable facts behind the level — shown verbatim to the learner. */
  evidence: string[];
  /** One sentence of teaching, not praise. */
  note: string;
}

export interface CoachingPriority {
  title: string;
  microSkill: string;
  /** Why it costs the learner points. */
  why: string;
  /** A concrete instruction, not encouragement. */
  how: string;
  /** Illustration taken from the learner's own text where possible. */
  fromYourText?: string;
  drill?: { kind: string; ref: string; label: string };
}

export interface WritingEvaluation {
  engine: string;
  engineVersion: string;
  estimatedLevel: number;
  levelSe: number;
  dimensions: DimensionResult[];
  findings: UsageFinding[];
  requirementCoverage: { requirement: string; covered: boolean; evidence: string | null }[];
  metrics: Record<string, number | string>;
  coaching: {
    headline: string;
    strengths: string[];
    priorities: CoachingPriority[];
  };
  limitations: string[];
}

/** Map a measurement onto a level using ascending or descending thresholds. */
function bandLevel(value: number, stops: [number, number][]): number {
  // stops: [threshold, level] in the order the value passes them.
  let level = stops[0][1];
  for (const [threshold, lvl] of stops) {
    const ascending = stops[stops.length - 1][0] > stops[0][0];
    if (ascending ? value >= threshold : value <= threshold) level = lvl;
  }
  return level;
}

const PURPOSE_VERBS =
  /\b(request|ask|inform|confirm|complain|apply|propose|suggest|recommend|explain|report|arrange|enquire|inquire|follow up|clarify|notify|invite|apologi[sz]e|decline|accept|argue|believe|prefer|support|oppose)\b/i;

const SUPPORT_MARKERS =
  /\b(because|since|as a result|which means|which covered|for example|for instance|such as|in particular|this means|so that|in order to|therefore|consequently|otherwise|in practice|specifically|to illustrate|given that|meaning that|the reason|that way|if .{3,40} (then|i will|we will)|unless)\b/gi;

/**
 * Requirements are written as instructions ("Describe the current state…"), so
 * the instruction verb and its scaffolding contribute nothing to whether the
 * content point was actually addressed. Stripping them before matching is the
 * difference between a coverage check that works and one that reports false
 * misses on well-written responses.
 */
const INSTRUCTION_WORDS = new Set([
  'describe', 'explain', 'state', 'mention', 'refer', 'say', 'include', 'give', 'provide',
  'acknowledge', 'offer', 'address', 'discuss', 'outline', 'indicate', 'suggest', 'propose',
  'make', 'clear', 'ensure', 'write', 'ask', 'request', 'current', 'least', 'clearly',
  'exactly', 'specific', 'one', 'two', 'distinct', 'developed', 'support', 'supported',
]);

/**
 * A small, curated map of the vocabulary that recurs across task requirements.
 * Coverage is checked concept by concept rather than word by word, because a
 * learner who writes "by that date" has addressed a requirement that says
 * "deadline". Without this, the check reports false misses on exactly the
 * responses that avoid echoing the prompt — the ones it should reward.
 */
const CONCEPT_SYNONYMS: Record<string, string[]> = {
  deadline: ['date', 'day', 'time', 'latest', 'before'],
  date: ['deadline', 'day', 'time'],
  action: ['arrange', 'seek', 'take', 'steps', 'measures', 'proceed', 'do'],
  take: ['arrange', 'seek', 'steps', 'measures', 'proceed'],
  met: ['meet', 'missed', 'complete', 'completed', 'finished', 'finish'],
  deposit: ['payment', 'paid', 'money', 'fee', 'amount', 'instalment'],
  paid: ['deposit', 'payment', 'money', 'fee'],
  work: ['job', 'flooring', 'project', 'repair', 'installation', 'renovation'],
  stalled: ['stopped', 'paused', 'halted', 'delayed', 'attended', 'progress'],
  reasons: ['because', 'since', 'reason', 'why'],
  reason: ['because', 'since', 'why'],
  example: ['instance', 'for example', 'such as', 'experience'],
  examples: ['instance', 'example', 'such as'],
  benefit: ['advantage', 'gain', 'upside', 'strength'],
  drawback: ['disadvantage', 'cost', 'downside', 'trade'],
  objection: ['argument', 'concern', 'criticism', 'counter'],
  choice: ['option', 'choose', 'chose', 'prefer', 'select', 'selected'],
  option: ['choice', 'choose', 'chose', 'prefer', 'alternative'],
  colleague: ['coworker', 'workmate', 'teammate', 'someone'],
  notice: ['warning', 'weeks', 'advance', 'short'],
  policy: ['rule', 'requirement', 'procedure'],
  inconvenience: ['disruption', 'trouble', 'impact', 'burden'],
  situation: ['circumstance', 'position', 'case', 'problem', 'issue'],
  credit: ['voucher', 'refund', 'compensation'],
  refund: ['money back', 'reimbursement', 'compensation', 'credit'],
  outcome: ['result', 'resolution', 'remedy', 'solution'],
  problem: ['issue', 'difficulty', 'trouble', 'concern'],
  support: ['programming', 'favour', 'behind', 'agree'],
  change: ['adjust', 'alter', 'modify', 'move', 'switch'],
};

/**
 * Split a requirement into the concepts it actually tests. Each concept is a
 * group of interchangeable surface forms; the concept counts as addressed if
 * any member appears.
 */
function requirementConcepts(requirement: string): string[][] {
  const keywords = [...contentWords(requirement)].filter((w) => !INSTRUCTION_WORDS.has(w));
  const source = keywords.length ? keywords : [...contentWords(requirement)];
  return source.map((word) => [word, ...(CONCEPT_SYNONYMS[word] ?? [])]);
}

function conceptsPresent(concepts: string[][], haystack: Set<string>, raw: string): number {
  const lower = raw.toLowerCase();
  let present = 0;
  for (const group of concepts) {
    const found = group.some((form) => {
      if (form.includes(' ')) return lower.includes(form);
      if (haystack.has(form)) return true;
      // Accept shared stems so "complete" matches "completed".
      const stem = form.length > 5 ? form.slice(0, form.length - 2) : form;
      return [...haystack].some((w) => w.startsWith(stem) && Math.abs(w.length - form.length) <= 3);
    });
    if (found) present++;
  }
  return present;
}

const SPECIFICITY =
  /\b(\d+(\.\d+)?%?|\$\d+|[A-Z][a-z]+day|January|February|March|April|May|June|July|August|September|October|November|December|per cent|percent|hours?|minutes?|weeks?|months?|years?|kilometres?|blocks?|dollars?)\b/g;

export function evaluateWriting(input: {
  task: WritingTaskSpec;
  text: string;
  elapsedSeconds: number;
  timed: boolean;
}): WritingEvaluation {
  const { task, text } = input;
  const formal = task.register === 'formal' || task.register === 'semi_formal';

  const wc = wordCount(text);
  const sents = sentences(text);
  const paras = paragraphs(text);
  const lex = lexicalProfile(text);
  const syn = syntaxProfile(text);
  const coh = cohesionProfile(text);
  const findings = runUsageRules(text, { formal, transcript: false });

  const textWords = contentWords(text);
  const promptWords = contentWords(`${task.scenario} ${task.instructions}`);

  /* ---------------- Task fulfilment ---------------- */
  // Coverage is judged on two signals: how much of the requirement's substance
  // appears anywhere in the response, and whether any single sentence carries
  // most of it. The second matters because a point addressed in one clear
  // sentence is addressed, even if the response never repeats its vocabulary.
  const coverage = task.requirements.map((req) => {
    const concepts = requirementConcepts(req);
    const wholeText = concepts.length ? conceptsPresent(concepts, textWords, text) / concepts.length : 1;

    let best = 0;
    let bestSentence: string | null = null;
    for (const sentence of sents) {
      const ratio = concepts.length
        ? conceptsPresent(concepts, contentWords(sentence), sentence) / concepts.length
        : 1;
      if (ratio > best) {
        best = ratio;
        bestSentence = sentence;
      }
    }

    const covered = wholeText >= 0.7 || best >= 0.55;
    return { requirement: req, covered, evidence: covered ? bestSentence : null };
  });
  const coveredCount = coverage.filter((c) => c.covered).length;
  const coverageRatio = task.requirements.length ? coveredCount / task.requirements.length : 1;

  const opening = sents.slice(0, 2).join(' ');
  const hasPurposeStatement = PURPOSE_VERBS.test(opening);
  const lengthOk = wc >= task.minWords * 0.9 && wc <= task.maxWords * 1.25;
  const tooShort = wc < task.minWords * 0.9;

  const choiceStated =
    !task.choices?.length ||
    task.choices.some((choice) => overlapRatio(contentWords(choice), contentWords(opening)) >= 0.4);

  let fulfilmentLevel = bandLevel(coverageRatio, [
    [0, 5],
    [0.5, 6],
    [0.7, 7],
    [0.85, 9],
    [1, 10],
  ]);
  if (hasPurposeStatement && coverageRatio === 1) fulfilmentLevel += 1;
  if (!choiceStated) fulfilmentLevel -= 2;
  if (tooShort) fulfilmentLevel -= wc < task.minWords * 0.7 ? 3 : 1;
  if (wc > task.maxWords * 1.3) fulfilmentLevel -= 1;
  fulfilmentLevel = clamp(fulfilmentLevel, 4, 12);

  /* ---------------- Development ---------------- */
  const supportCount = (text.match(SUPPORT_MARKERS) ?? []).length;
  const specifics = (text.match(SPECIFICITY) ?? []).length;
  const supportPerRequirement = task.requirements.length
    ? supportCount / task.requirements.length
    : supportCount;

  // A salutation and a sign-off are conventions, not paragraphs. Counting them
  // would inflate the organisation score and deflate sentences-per-paragraph on
  // every email — the two dimensions the letter format most affects.
  const bodyParas = paras.filter(
    (p) =>
      !/^(dear|hello|hi|good (morning|afternoon))\b/i.test(p.trim()) &&
      !/^(sincerely|regards|best wishes|yours (truly|faithfully|sincerely)|kind regards|thank you,)/i.test(
        p.trim(),
      ) &&
      wordCount(p) > 6,
  );
  const meanSentencesPerPara = bodyParas.length ? sents.length / bodyParas.length : sents.length;

  let developmentLevel = bandLevel(supportPerRequirement, [
    [0, 5],
    [0.5, 6],
    [1, 8],
    [1.6, 9],
    [2.2, 10],
    [3, 11],
  ]);
  if (specifics >= 3) developmentLevel += 1;
  if (specifics === 0) developmentLevel -= 1;
  if (meanSentencesPerPara < 2 && bodyParas.length > 2) developmentLevel -= 1;
  // Length carries real information about development: a response that reaches
  // the target band has room for support that a short one does not.
  if (wc >= task.minWords && supportCount >= 2) developmentLevel += 0.5;
  developmentLevel = clamp(developmentLevel, 4, 12);

  /* ---------------- Organisation ---------------- */
  const isEmail = task.taskType === 'writing.email';
  const hasSalutation = /^(dear|hello|hi|good (morning|afternoon))\b/i.test(text.trim());
  const hasSignOff =
    /\b(sincerely|regards|best wishes|yours truly|yours faithfully|thank you|kind regards)\b/i.test(
      text.slice(-220),
    );
  const closingMove = /\b(in conclusion|overall|on balance|for these reasons|ultimately|to sum up|I would therefore|that is why)\b/i.test(
    text.slice(-320),
  );

  let organisationLevel = bandLevel(bodyParas.length, [
    [1, 5],
    [2, 7],
    [3, 9],
    [4, 10],
  ]);
  if (bodyParas.length >= 6 && wc < 260) organisationLevel -= 1; // fragmented, not structured
  if (isEmail) {
    if (hasSalutation) organisationLevel += 0.5;
    if (hasSignOff) organisationLevel += 0.5;
    if (!hasSalutation || !hasSignOff) organisationLevel -= 1;
  } else if (closingMove) {
    organisationLevel += 1;
  } else {
    organisationLevel -= 0.5;
  }
  organisationLevel = clamp(organisationLevel, 4, 12);

  /* ---------------- Coherence ---------------- */
  let coherenceLevel = bandLevel(coh.connectiveTypes.length, [
    [0, 5],
    [1, 6],
    [2, 8],
    [3, 9],
    [4, 10],
    [5, 11],
  ]);
  // Cohesion is measured as the share of sentence transitions carried by
  // either lexical overlap or reference, which is what a reader actually
  // follows. Repeating vocabulary is one way to do it, not the only way.
  if (coh.linkedShare >= 0.55) coherenceLevel += 1;
  if (coh.linkedShare < 0.3 && sents.length > 5) coherenceLevel -= 1;
  if (coh.adjacentOverlap > 0.6) coherenceLevel -= 1; // circling the same words
  if (coh.overusedConnectives.length) coherenceLevel -= 1;
  coherenceLevel = clamp(coherenceLevel, 4, 12);

  /* ---------------- Register ---------------- */
  const registerFindings = findings.filter(
    (f) => f.errorCode.startsWith('register.') || f.errorCode === 'lexis.informal',
  );
  const registerPer100 = wc ? (registerFindings.length * 100) / wc : 0;
  let registerLevel = bandLevel(registerPer100, [
    [3, 5],
    [2, 6],
    [1, 8],
    [0.5, 10],
    [0, 11],
  ]);
  if (isEmail && hasSalutation && hasSignOff && registerFindings.length === 0) registerLevel += 1;
  registerLevel = clamp(registerLevel, 4, 12);

  /* ---------------- Lexical range ---------------- */
  const sophisticatedCount = lex.sophisticatedWords.length;
  const sophisticatedPer100 = wc ? (sophisticatedCount * 100) / wc : 0;
  // Range is scored primarily on how much of the response sits outside the
  // highest-frequency band, with academic vocabulary as a bonus rather than the
  // whole measure — precise professional English can score well without
  // reaching for a single word from an academic list.
  let lexicalLevel = bandLevel(lex.midFrequencyShare, [
    [0, 4],
    [0.08, 6],
    [0.13, 8],
    [0.18, 9],
    [0.24, 10],
    [0.3, 11],
  ]);
  if (sophisticatedPer100 >= 2) lexicalLevel += 0.5;
  if (sophisticatedPer100 >= 4) lexicalLevel += 0.5;
  if (lex.mattr >= 0.72) lexicalLevel += 1;
  if (lex.mattr < 0.6 && wc > 120) lexicalLevel -= 1;
  if (lex.overusedWords.length >= 3) lexicalLevel -= 1;
  if (lex.band1Share > 0.68) lexicalLevel -= 1;
  lexicalLevel = clamp(lexicalLevel, 4, 12);

  /* ---------------- Grammatical accuracy ---------------- */
  const grammarFindings = findings.filter(
    (f) => f.errorCode.startsWith('grammar.') || f.errorCode.startsWith('lexis.confusable'),
  );
  const load = errorLoad(grammarFindings);
  const loadPer100 = wc ? (load * 100) / wc : 0;
  let grammarLevel = bandLevel(loadPer100, [
    [4, 4],
    [3, 5],
    [2, 6],
    [1.2, 8],
    [0.6, 9],
    [0.25, 10],
    [0, 11],
  ]);
  // Accuracy inside complex sentences is what separates the top bands.
  if (loadPer100 < 0.6 && syn.subordinationRatio >= 0.6) grammarLevel += 1;
  grammarLevel = clamp(grammarLevel, 4, 12);

  /* ---------------- Sentence variety ---------------- */
  let varietyLevel = bandLevel(syn.sentenceLengthSd, [
    [0, 5],
    [3, 6],
    [5, 8],
    [7, 9],
    [9, 10],
  ]);
  if (syn.subordinationRatio >= 0.7) varietyLevel += 1;
  if (syn.subordinationRatio < 0.25) varietyLevel -= 1;
  if (syn.frontedCount >= 2) varietyLevel += 0.5;
  if (syn.repeatedOpeners >= 2) varietyLevel -= 1;
  if (syn.longSentences >= 3) varietyLevel -= 0.5;
  varietyLevel = clamp(varietyLevel, 4, 12);

  /* ---------------- Concision ---------------- */
  const paddingFindings = findings.filter((f) => f.errorCode.startsWith('style.'));
  const promptEcho = overlapRatio(promptWords, textWords);
  let concisionLevel = bandLevel(paddingFindings.length, [
    [4, 5],
    [3, 6],
    [2, 8],
    [1, 9],
    [0, 11],
  ]);
  if (promptEcho > 0.55) concisionLevel -= 1;
  if (wc > task.maxWords * 1.25) concisionLevel -= 1;
  concisionLevel = clamp(concisionLevel, 4, 12);

  /* ---------------- Pacing ---------------- */
  const dimensions: DimensionResult[] = [
    {
      microSkill: 'writing.task_fulfilment',
      level: fulfilmentLevel,
      evidence: [
        `${coveredCount} of ${task.requirements.length} required content points addressed`,
        `${wc} words (target ${task.minWords}–${task.maxWords})`,
        hasPurposeStatement
          ? 'Purpose is stated in the opening'
          : 'No clear purpose statement in the first two sentences',
      ],
      note: coverageRatio === 1
        ? 'Every required element appears. At the top bands the remaining question is depth, not coverage.'
        : `Uncovered points cost more than any other single error: ${coverage
            .filter((c) => !c.covered)
            .map((c) => `“${truncate(c.requirement, 60)}”`)
            .join('; ')}.`,
    },
    {
      microSkill: 'writing.development',
      level: developmentLevel,
      evidence: [
        `${supportCount} support markers (because / for example / which means…)`,
        `${specifics} concrete details (numbers, dates, named things)`,
        `${round(meanSentencesPerPara, 1)} sentences per paragraph`,
      ],
      note:
        developmentLevel >= 10
          ? 'Points are supported rather than asserted, which is what separates 9 from 11.'
          : 'Each point needs a reason and a consequence — an assertion alone reads as a list.',
    },
    {
      microSkill: 'writing.organisation',
      level: organisationLevel,
      evidence: [
        `${bodyParas.length} body paragraph${bodyParas.length === 1 ? '' : 's'}`,
        isEmail
          ? `${hasSalutation ? 'Salutation present' : 'No salutation'}; ${hasSignOff ? 'sign-off present' : 'no sign-off'}`
          : closingMove
            ? 'Closing move present'
            : 'No closing move',
      ],
      note:
        organisationLevel >= 9
          ? 'A reader can predict what each paragraph will do before reading it.'
          : 'Give each paragraph one job, and make the first sentence announce it.',
    },
    {
      microSkill: 'writing.coherence',
      level: coherenceLevel,
      evidence: [
        `${Math.round(coh.linkedShare * 100)}% of sentence transitions are linked, by repeated content (${coh.adjacentOverlap}) or by reference (${coh.referenceLinks})`,
        `${coh.connectiveTypes.length} connective types used: ${coh.connectiveTypes.join(', ') || 'none'}`,
        ...(coh.overusedConnectives.length
          ? [`Repeated connective${coh.overusedConnectives.length > 1 ? 's' : ''}: ${coh.overusedConnectives.join(', ')}`]
          : []),
      ],
      note:
        coh.adjacentOverlap > 0.6
          ? 'Sentences repeat each other’s vocabulary; move the argument forward instead of restating it.'
          : 'Cohesion at the top bands comes from information order, not from adding connectors.',
    },
    {
      microSkill: 'writing.register',
      level: registerLevel,
      evidence: [
        `Target register: ${task.register.replace('_', '-')}`,
        registerFindings.length
          ? `${registerFindings.length} register slip${registerFindings.length === 1 ? '' : 's'}: ${registerFindings
              .slice(0, 3)
              .map((f) => `“${f.excerpt}”`)
              .join(', ')}`
          : 'No register slips detected',
      ],
      note:
        registerFindings.length === 0
          ? 'Register is held consistently from opening to closing.'
          : 'Decide who the reader is before writing, then hold one level of formality throughout.',
    },
    {
      microSkill: 'writing.lexical_range',
      level: lexicalLevel,
      evidence: [
        `${Math.round(lex.midFrequencyShare * 100)}% of your words sit outside the highest-frequency band: ${lex.midFrequencyWords.slice(0, 8).join(', ') || '—'}`,
        sophisticatedCount
          ? `${sophisticatedCount} academic or professional words: ${lex.sophisticatedWords.slice(0, 6).join(', ')}`
          : 'No words from the academic band',
        `Lexical diversity (MATTR) ${lex.mattr}`,
        lex.overusedWords.length
          ? `Repeated: ${lex.overusedWords.map((w) => `${w.word} ×${w.count}`).join(', ')}`
          : 'No noticeable repetition',
      ],
      note:
        lexicalLevel >= 10
          ? 'Word choice is precise; keep collocations natural rather than reaching for rare words.'
          : 'Precision beats rarity. Replace general verbs with the exact one the situation needs.',
    },
    {
      microSkill: 'writing.grammar_accuracy',
      level: grammarLevel,
      evidence: [
        `${grammarFindings.length} usage issue${grammarFindings.length === 1 ? '' : 's'} flagged (${round(loadPer100, 2)} weighted per 100 words)`,
        ...grammarFindings.slice(0, 3).map((f) => `“${f.excerpt}” — ${f.message}`),
      ],
      note:
        grammarFindings.length === 0
          ? 'No patterns from the rule set fired. Accuracy is not the constraint on your level.'
          : 'Fix the repeated pattern first; isolated slips cost far less than a habit.',
    },
    {
      microSkill: 'writing.sentence_variety',
      level: varietyLevel,
      evidence: [
        `Mean sentence ${syn.meanSentenceLength} words, spread ±${syn.sentenceLengthSd}`,
        `${round(syn.subordinationRatio, 2)} subordinate clauses per sentence`,
        syn.repeatedOpeners
          ? `${syn.repeatedOpeners} consecutive sentences begin with the same word`
          : 'Sentence openings vary',
      ],
      note:
        varietyLevel >= 10
          ? 'Structure varies deliberately, which controls emphasis as well as rhythm.'
          : 'Combine two short sentences with a subordinator, and front one adverbial phrase.',
    },
    {
      microSkill: 'writing.concision',
      level: concisionLevel,
      evidence: [
        paddingFindings.length
          ? `${paddingFindings.length} padding phrase${paddingFindings.length === 1 ? '' : 's'}: ${paddingFindings.slice(0, 3).map((f) => `“${f.excerpt}”`).join(', ')}`
          : 'No padding phrases detected',
        `Prompt echo ${round(promptEcho, 2)} (above 0.55 means the prompt is being restated)`,
      ],
      note:
        concisionLevel >= 10
          ? 'The response earns its length.'
          : 'Cut the opening filler and the restated prompt; spend those words on support instead.',
    },
  ];

  // Pacing is only reported when there is a timing to report. A response
  // pasted in, or one where the clock never ran, would otherwise be credited
  // with perfect time management it never demonstrated.
  if (input.timed && task.timeLimitSeconds > 0 && input.elapsedSeconds >= 60) {
    const usedRatio = input.elapsedSeconds / task.timeLimitSeconds;
    const wpm = input.elapsedSeconds > 0 ? (wc * 60) / input.elapsedSeconds : 0;
    let pacingLevel = 9;
    if (usedRatio > 0.98 && tooShort) pacingLevel = 5;
    else if (tooShort) pacingLevel = 6;
    else if (usedRatio > 0.97) pacingLevel = 8;
    else if (usedRatio <= 0.9) pacingLevel = 10;
    if (usedRatio <= 0.8 && lengthOk) pacingLevel = 11;
    dimensions.push({
      microSkill: 'writing.exam_pacing',
      level: clamp(pacingLevel, 4, 12),
      evidence: [
        `${formatDuration(input.elapsedSeconds)} of ${formatDuration(task.timeLimitSeconds)} used`,
        `${Math.round(wpm)} words per minute`,
        lengthOk ? 'Finished inside the target length' : 'Did not reach the target length',
      ],
      note:
        usedRatio > 0.97
          ? 'You used every second, which leaves nothing for proofreading. Plan less, draft sooner.'
          : 'Reserve the final two minutes to check verb forms and the closing sentence.',
    });
  }

  /* ---------------- Aggregate ---------------- */
  const weights: Record<string, number> = {
    'writing.task_fulfilment': 2.0,
    'writing.development': 1.8,
    'writing.organisation': 1.2,
    'writing.coherence': 1.3,
    'writing.register': 1.0,
    'writing.lexical_range': 1.4,
    'writing.grammar_accuracy': 1.5,
    'writing.sentence_variety': 1.0,
    'writing.concision': 0.7,
    'writing.exam_pacing': 0.5,
  };
  let weighted = 0;
  let weightSum = 0;
  for (const d of dimensions) {
    const w = weights[d.microSkill] ?? 1;
    weighted += d.level * w;
    weightSum += w;
  }
  let estimated = weighted / weightSum;

  // A rubric behaviour, not a smoothing hack: a response that omits required
  // content cannot sit in the top bands however well it is written.
  if (coverageRatio < 1) estimated = Math.min(estimated, 9.4);
  if (coverageRatio < 0.75) estimated = Math.min(estimated, 7.5);
  if (tooShort) estimated = Math.min(estimated, 8);

  const se = confidenceInterval(wc, dimensions);

  /* ---------------- Coaching ---------------- */
  const sorted = [...dimensions].sort((a, b) => a.level - b.level);
  const strengths = [...dimensions]
    .sort((a, b) => b.level - a.level)
    .slice(0, 2)
    .map((d) => `${labelFor(d.microSkill)} is your strongest dimension here (${fmtLevel(d.level)}). ${d.note}`);

  const priorities: CoachingPriority[] = sorted.slice(0, 3).map((d) => {
    const example = exampleFor(d.microSkill, { findings, text, coverage, lex, syn, coh });
    return {
      title: `${labelFor(d.microSkill)} — ${fmtLevel(d.level)}`,
      microSkill: d.microSkill,
      why: whyItCosts(d.microSkill),
      how: howToFix(d.microSkill),
      fromYourText: example,
      drill: drillFor(d.microSkill),
    };
  });

  const headline = buildHeadline(estimated, sorted[0], coverageRatio, task);

  const limitations = [
    'This analysis is rule-based. It measures structure, coverage, range and known error patterns — it does not judge how persuasive or original your argument is.',
    'Usage checking is a curated rule set, so it catches frequent errors reliably but will miss unusual ones. A clean report is not proof of a flawless response.',
    'The level shown is a Meridian practice estimate from this single response. It is not a CELPIP score.',
  ];

  return {
    engine: WRITING_ENGINE,
    engineVersion: WRITING_ENGINE_VERSION,
    estimatedLevel: round(clamp(estimated, 4, 12), 1),
    levelSe: se,
    dimensions: dimensions.map((d) => ({ ...d, level: round(d.level, 1) })),
    findings,
    requirementCoverage: coverage,
    metrics: {
      wordCount: wc,
      sentences: sents.length,
      paragraphs: bodyParas.length,
      meanSentenceLength: syn.meanSentenceLength,
      sentenceLengthSd: syn.sentenceLengthSd,
      lexicalDiversity: lex.mattr,
      sophisticatedWords: lex.sophisticatedWords.length,
      supportMarkers: supportCount,
      concreteDetails: specifics,
      adjacentOverlap: coh.adjacentOverlap,
      linkedTransitions: coh.linkedShare,
      usageIssues: findings.length,
      elapsedSeconds: input.elapsedSeconds,
    },
    coaching: { headline, strengths, priorities },
    limitations,
  };
}

/* ------------------------------------------------------------------ */

function confidenceInterval(wc: number, dims: DimensionResult[]): number {
  // Short responses and widely disagreeing dimensions both widen the band.
  const spread = Math.sqrt(
    dims.reduce((acc, d) => {
      const mean = dims.reduce((a, x) => a + x.level, 0) / dims.length;
      return acc + (d.level - mean) ** 2;
    }, 0) / dims.length,
  );
  const lengthPenalty = wc < 120 ? 0.7 : wc < 180 ? 0.4 : 0.25;
  return round(clamp(lengthPenalty + spread * 0.25, 0.3, 1.6), 2);
}

function labelFor(microSkill: string): string {
  const map: Record<string, string> = {
    'writing.task_fulfilment': 'Task fulfilment',
    'writing.development': 'Development of ideas',
    'writing.organisation': 'Organisation',
    'writing.coherence': 'Coherence',
    'writing.register': 'Register',
    'writing.lexical_range': 'Vocabulary range',
    'writing.grammar_accuracy': 'Grammatical accuracy',
    'writing.sentence_variety': 'Sentence variety',
    'writing.concision': 'Concision',
    'writing.exam_pacing': 'Pacing',
  };
  return map[microSkill] ?? microSkill;
}

function fmtLevel(level: number): string {
  return `CLB ${Math.round(level)}`;
}

function whyItCosts(microSkill: string): string {
  const map: Record<string, string> = {
    'writing.task_fulfilment':
      'A missing content point caps the whole response regardless of how well the rest is written.',
    'writing.development':
      'Undeveloped points read as a list of opinions, which holds a response around CLB 7–8 even with clean grammar.',
    'writing.organisation':
      'When a reader has to work out the structure, everything else in the response feels harder to follow.',
    'writing.coherence':
      'Ideas that do not connect force the reader to reconstruct your logic, and reconstruction reads as a lower level.',
    'writing.register':
      'A register slip in a formal message is noticed immediately and is one of the fastest things to fix.',
    'writing.lexical_range':
      'General vocabulary makes precise ideas sound approximate, which is the usual ceiling between CLB 9 and 11.',
    'writing.grammar_accuracy':
      'Repeated errors distract from your argument; a single recurring pattern costs more than several one-off slips.',
    'writing.sentence_variety':
      'Uniform sentences flatten emphasis, so the reader cannot tell which point matters most.',
    'writing.concision':
      'Padding spends words you need for support, and it is visible in the first sentence.',
    'writing.exam_pacing':
      'Running out of time truncates the closing move, which is where a response proves it is complete.',
  };
  return map[microSkill] ?? '';
}

function howToFix(microSkill: string): string {
  const map: Record<string, string> = {
    'writing.task_fulfilment':
      'Before writing, list the required points as a checklist and tick each one off in your draft.',
    'writing.development':
      'For every point, write three sentences: the claim, why it is true, and what follows from it.',
    'writing.organisation':
      'Write a one-line plan naming each paragraph’s job, then make the first sentence of each paragraph deliver it.',
    'writing.coherence':
      'Begin each sentence with information the reader already has, and end it with the new idea.',
    'writing.register':
      'Name your reader and their role, then remove contractions and casual vocabulary in a single pass.',
    'writing.lexical_range':
      'Pick three general verbs in your draft and replace each with the exact verb for that situation.',
    'writing.grammar_accuracy':
      'Take the pattern flagged most often and drill it until you can produce it correctly without thinking.',
    'writing.sentence_variety':
      'Combine two adjacent short sentences with a subordinator, and start one sentence with an adverbial phrase.',
    'writing.concision':
      'Delete your first sentence if it only restates the prompt, and cut every intensifier before a general adjective.',
    'writing.exam_pacing':
      'Cap planning at three minutes, write to the end, and keep two minutes for a verb-form and ending check.',
  };
  return map[microSkill] ?? '';
}

function drillFor(microSkill: string): CoachingPriority['drill'] {
  const map: Record<string, CoachingPriority['drill']> = {
    'writing.development': { kind: 'lesson', ref: 'develop-a-point', label: 'Drill: turning a claim into support' },
    'writing.coherence': { kind: 'lesson', ref: 'information-flow', label: 'Lesson: given-before-new' },
    'writing.register': { kind: 'lesson', ref: 'register-control', label: 'Lesson: holding one register' },
    'writing.lexical_range': { kind: 'practice', ref: 'vocabulary', label: 'Practice: precision word choice' },
    'writing.grammar_accuracy': { kind: 'practice', ref: 'grammar', label: 'Practice: your flagged patterns' },
    'writing.sentence_variety': { kind: 'lesson', ref: 'sentence-combining', label: 'Drill: sentence combining' },
    'writing.task_fulfilment': { kind: 'lesson', ref: 'reading-the-prompt', label: 'Lesson: reading the prompt' },
    'writing.concision': { kind: 'lesson', ref: 'cutting-padding', label: 'Drill: cutting ten per cent' },
    'writing.organisation': { kind: 'lesson', ref: 'paragraph-jobs', label: 'Lesson: one job per paragraph' },
  };
  return map[microSkill];
}

function exampleFor(
  microSkill: string,
  ctx: {
    findings: UsageFinding[];
    text: string;
    coverage: { requirement: string; covered: boolean }[];
    lex: ReturnType<typeof lexicalProfile>;
    syn: ReturnType<typeof syntaxProfile>;
    coh: ReturnType<typeof cohesionProfile>;
  },
): string | undefined {
  switch (microSkill) {
    case 'writing.task_fulfilment': {
      const missing = ctx.coverage.find((c) => !c.covered);
      return missing ? `Not addressed: “${truncate(missing.requirement, 90)}”` : undefined;
    }
    case 'writing.grammar_accuracy': {
      const f = ctx.findings.find((x) => x.severity === 'high') ?? ctx.findings[0];
      return f ? `“${f.excerpt}” — ${f.suggestion}` : undefined;
    }
    case 'writing.lexical_range': {
      const o = ctx.lex.overusedWords[0];
      return o ? `You used “${o.word}” ${o.count} times.` : undefined;
    }
    case 'writing.coherence': {
      return ctx.coh.overusedConnectives.length
        ? `“${ctx.coh.overusedConnectives[0]}” appears three or more times.`
        : undefined;
    }
    case 'writing.sentence_variety': {
      const sents = sentences(ctx.text);
      const longest = sents.reduce((a, b) => (words(b).length > words(a).length ? b : a), sents[0] ?? '');
      return longest && words(longest).length > 30 ? `Longest sentence: “${truncate(longest, 110)}”` : undefined;
    }
    case 'writing.concision': {
      const f = ctx.findings.find((x) => x.errorCode.startsWith('style.'));
      return f ? `“${f.excerpt}”` : undefined;
    }
    default:
      return undefined;
  }
}

function buildHeadline(
  level: number,
  weakest: DimensionResult,
  coverageRatio: number,
  task: WritingTaskSpec,
): string {
  if (coverageRatio < 1) {
    return `This response is written at roughly ${fmtLevel(level)}, but it leaves a required content point unaddressed — that ceiling matters more than anything else on the page.`;
  }
  if (level >= 10.5) {
    return `A strong ${task.taskType === 'writing.email' ? 'message' : 'argument'} at around ${fmtLevel(level)}. The remaining distance to 12 runs through ${labelFor(weakest.microSkill).toLowerCase()}.`;
  }
  return `Around ${fmtLevel(level)}. The single biggest constraint here is ${labelFor(weakest.microSkill).toLowerCase()}.`;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
