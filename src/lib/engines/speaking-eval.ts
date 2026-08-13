/**
 * Speaking analyser — `local-speech-v1`.
 *
 * Inputs it can honestly use:
 *  - a transcript, produced either by the browser's own speech recognition
 *    (Web Speech API, on-device or vendor-provided, free to the learner) or
 *    typed by the learner;
 *  - a loudness envelope sampled in the browser from the recording, which
 *    yields real speech/silence segmentation and therefore real pause and
 *    articulation-rate measurements;
 *  - the response duration.
 *
 * Inputs it does not have, and does not pretend to have:
 *  - phoneme-level pronunciation accuracy. No acoustic model runs here, so the
 *    analyser reports delivery evidence it *can* observe (pause structure,
 *    pacing, rhythm regularity) and declares pronunciation out of scope rather
 *    than inventing a score.
 *
 * When no transcript is available the analyser degrades explicitly: it returns
 * delivery dimensions only, marks content dimensions as unassessed, and widens
 * the confidence band. It never fabricates content analysis from silence.
 */
import { clamp, cohesionProfile, contentWords, lexicalProfile, overlapRatio, round, sentences, syntaxProfile, words } from './text';
import { errorLoad, runUsageRules, type UsageFinding } from './usage-rules';
import type { CoachingPriority, DimensionResult } from './writing-eval';

export const SPEAKING_ENGINE = 'local-speech';
export const SPEAKING_ENGINE_VERSION = '1.0.0';

export interface SpeakingTaskSpec {
  taskType: string;
  taskNumber: number;
  title: string;
  prompt: string;
  successCriteria: string[];
  prepSeconds: number;
  speakSeconds: number;
}

/** One sample of short-term loudness, produced by the browser recorder. */
export interface EnvelopeSample {
  tMs: number;
  rms: number;
}

export interface SpeechSegments {
  speechMs: number;
  silenceMs: number;
  pauses: { startMs: number; durationMs: number }[];
  longestPauseMs: number;
  /** Regularity of speech-run lengths; erratic runs indicate reformulation. */
  runLengthSd: number;
}

export interface SpeakingEvaluation {
  engine: string;
  engineVersion: string;
  estimatedLevel: number;
  levelSe: number;
  dimensions: DimensionResult[];
  findings: UsageFinding[];
  criteriaCoverage: { criterion: string; covered: boolean }[];
  metrics: Record<string, number | string>;
  coaching: { headline: string; strengths: string[]; priorities: CoachingPriority[] };
  limitations: string[];
  transcriptQuality: 'none' | 'asr' | 'manual';
}

const FILLERS = [
  'um', 'uh', 'er', 'erm', 'ah', 'hmm', 'like', 'you know', 'i mean', 'kind of', 'sort of',
  'basically', 'actually', 'literally', 'well i think', 'so yeah',
];

const OPENING_MOVES =
  /\b(i would (say|advise|recommend|suggest)|my (advice|view|opinion|choice) (is|would be)|if i were|i think the best|the first thing|i'?d go with|personally,? i)\b/i;

const CLOSING_MOVES =
  /\b(so overall|so in the end|that'?s why|for those reasons|all things considered|so my advice|to sum up|which is why i)\b/i;

const EXAMPLE_MOVES = /\b(for example|for instance|such as|last (year|month|week)|when i|in my (own )?experience|i remember)\b/i;

const REASON_MOVES = /\b(because|since|the reason|that way|which means|so that|otherwise|as a result)\b/i;

const CONCESSION_MOVES =
  /\b(the (drawback|downside|risk|cost|disadvantage)|admittedly|granted|of course|it is true|the only (problem|issue)|on the other hand|that said|although|even though|the trade-?off)\b/i;

const NEXT_STEP_MOVES =
  /\b(my advice would be|i would (start|begin|check|suggest|recommend)|the first (step|thing)|before (you|she|he|they)|what i would do (next|first)|so (you|she|he|they) should)\b/i;

const ORDER_MOVES =
  /\b(in the (foreground|background|middle)|on the (left|right)|behind|in front of|next to|beside|at the top|at the bottom|to one side|further back|closer to)\b/i;

const HEDGE_MOVES = /\b(presumably|it looks like|i assume|probably|i would guess|seems to be|appears to be|possibly|perhaps|may well|might be)\b/i;

const FUTURE_FORMS = /\b(will|going to|likely to|about to|may|might|would expect|is set to)\b/gi;

const NEGATIVE_PREDICTION = /\b(will not|won't|is unlikely to|will probably not|nothing will)\b/i;

const AUDIENCE_MOVES =
  /\b(i would (say|tell|explain|approach|speak)|i would rather|if i were (you|her|him|them)|to be fair to|without (blaming|accusing)|i would put it)\b/i;

const SPECIFIC_DETAIL =
  /\b(\d+|last (year|month|week|summer|winter)|my (brother|sister|neighbour|colleague|friend|manager)|when i)\b/i;

/**
 * Match a success criterion to a detector.
 *
 * Criteria are authored as instructions ("Commits to one recommendation in the
 * first two sentences"), so comparing their words against a transcript would
 * find nothing — a learner never says "commits" or "recommendation". Instead
 * the criterion's own verb selects a detector that looks for the linguistic
 * signature of the move itself. Where no detector fits, the check falls back
 * to content overlap and is correspondingly weaker.
 */
function detectMove(criterion: string, transcript: string): boolean {
  const c = criterion.toLowerCase();
  const t = transcript;
  const sentencesOf = sentences(t);
  const opening = sentencesOf.slice(0, 2).join(' ');
  const closing = sentencesOf.slice(-2).join(' ');

  if (/\b(commit|choose|chooses|state[s]? (a|your|the) (position|choice|clear)|clear recommendation|takes a position|holds it)\b/.test(c)) {
    return OPENING_MOVES.test(opening) || /\b(i would|i'd|my (advice|choice|view)|i think the best|personally)\b/i.test(opening);
  }
  if (/\breason/.test(c)) {
    const count = (t.match(new RegExp(REASON_MOVES.source, 'gi')) ?? []).length;
    return /\btwo\b|\bat least two\b/.test(c) ? count >= 2 : count >= 1;
  }
  if (/\b(example|instance|concrete|specific detail|telling detail)\b/.test(c)) {
    return EXAMPLE_MOVES.test(t) || SPECIFIC_DETAIL.test(t);
  }
  if (/\b(risk|drawback|downside|cost|objection|concede|acknowledg|other side|trade-?off|what .* would give up)\b/.test(c)) {
    return CONCESSION_MOVES.test(t);
  }
  if (/\b(next step|ends? with|closing|close|restatement|asks? for agreement|proposal that)\b/.test(c)) {
    return CLOSING_MOVES.test(closing) || NEXT_STEP_MOVES.test(closing) || NEXT_STEP_MOVES.test(t);
  }
  if (/\b(order|systematic|spatial|sequence|logical order|groups related)\b/.test(c)) {
    return ORDER_MOVES.test(t);
  }
  if (/\b(speculat|marking it as|unclear|cannot determine|unidentifiable)\b/.test(c)) {
    return HEDGE_MOVES.test(t);
  }
  if (/\b(will not happen|not happen)\b/.test(c)) {
    return NEGATIVE_PREDICTION.test(t);
  }
  if (/\b(varies|varied|range of (future|forms)|future forms|distinguishes between what is likely)\b/.test(c)) {
    const forms = new Set((t.match(FUTURE_FORMS) ?? []).map((f) => f.toLowerCase()));
    return forms.size >= 2;
  }
  if (/\b(predict|prediction)\b/.test(c)) {
    const forms = (t.match(FUTURE_FORMS) ?? []).length;
    return /\bseveral|more than one|distinct|more than one person\b/.test(c) ? forms >= 3 : forms >= 1;
  }
  if (/\b(register|audience|relationship|without accusation|preserves|politeness|suited to)\b/.test(c)) {
    return AUDIENCE_MOVES.test(t) || CONCESSION_MOVES.test(t);
  }
  if (/\b(setting|situation in one sentence|establishes|frame|overall impression|first impression)\b/.test(c)) {
    return sentencesOf.length > 1 && words(opening).length <= 60;
  }
  if (/\b(sequence of events|narrat|time sequence|what was done|what changed)\b/.test(c)) {
    return /\b(then|after that|so i|eventually|in the end|afterwards|the next (day|week|morning))\b/i.test(t);
  }
  if (/\b(compar|size and shape|familiar objects)\b/.test(c)) {
    return /\b(about the size of|roughly the (size|height|width)|like a|similar to|as (big|tall|wide) as)\b/i.test(t);
  }

  // No detector matched the criterion's phrasing: fall back to content overlap.
  return overlapRatio(contentWords(criterion), contentWords(t)) >= 0.35;
}

/**
 * Segment a loudness envelope into speech and silence.
 * Threshold is adaptive: a fraction of the response's own speech-level median,
 * which makes it robust to different microphones and room levels.
 */
export function segmentEnvelope(envelope: EnvelopeSample[], durationMs: number): SpeechSegments {
  if (envelope.length < 4) {
    return { speechMs: durationMs, silenceMs: 0, pauses: [], longestPauseMs: 0, runLengthSd: 0 };
  }
  const sorted = [...envelope].map((e) => e.rms).sort((a, b) => a - b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0.01;
  const floor = sorted[Math.floor(sorted.length * 0.1)] || 0;
  const threshold = Math.max(floor * 1.6, p90 * 0.18, 0.008);

  const step = durationMs / envelope.length;
  const pauses: { startMs: number; durationMs: number }[] = [];
  const runs: number[] = [];
  let speechMs = 0;
  let silenceMs = 0;
  let currentSilence = 0;
  let currentRun = 0;

  for (const sample of envelope) {
    if (sample.rms >= threshold) {
      speechMs += step;
      currentRun += step;
      if (currentSilence >= 400) {
        pauses.push({ startMs: Math.round(sample.tMs - currentSilence), durationMs: Math.round(currentSilence) });
      }
      currentSilence = 0;
    } else {
      silenceMs += step;
      currentSilence += step;
      if (currentRun > 0) {
        runs.push(currentRun);
        currentRun = 0;
      }
    }
  }
  if (currentRun > 0) runs.push(currentRun);

  const meanRun = runs.length ? runs.reduce((a, b) => a + b, 0) / runs.length : 0;
  const runSd = runs.length
    ? Math.sqrt(runs.reduce((a, r) => a + (r - meanRun) ** 2, 0) / runs.length)
    : 0;

  return {
    speechMs: Math.round(speechMs),
    silenceMs: Math.round(silenceMs),
    pauses,
    longestPauseMs: pauses.reduce((a, p) => Math.max(a, p.durationMs), 0),
    runLengthSd: Math.round(runSd),
  };
}

export function evaluateSpeaking(input: {
  task: SpeakingTaskSpec;
  transcript: string;
  transcriptSource: 'browser_asr' | 'manual' | 'none';
  durationMs: number;
  envelope: EnvelopeSample[];
}): SpeakingEvaluation {
  const { task, transcript } = input;
  const hasTranscript = input.transcriptSource !== 'none' && transcript.trim().length > 12;
  const seg = segmentEnvelope(input.envelope, input.durationMs);
  const durationSec = input.durationMs / 1000;
  const toks = words(transcript);
  const dimensions: DimensionResult[] = [];
  const limitations: string[] = [];

  /* ---------------- Delivery: always available from audio ---------------- */

  const usedRatio = task.speakSeconds > 0 ? durationSec / task.speakSeconds : 1;
  const speechRatio = input.durationMs ? seg.speechMs / input.durationMs : 1;
  const longPauses = seg.pauses.filter((p) => p.durationMs >= 900);
  const pausesPerMinute = durationSec > 0 ? (longPauses.length * 60) / durationSec : 0;

  let pacingLevel: number;
  if (usedRatio < 0.5) pacingLevel = 5;
  else if (usedRatio < 0.7) pacingLevel = 6.5;
  else if (usedRatio < 0.85) pacingLevel = 8;
  else if (usedRatio <= 1.02) pacingLevel = 10.5;
  else pacingLevel = 9;
  if (usedRatio >= 0.95 && usedRatio <= 1.02) pacingLevel += 0.5;

  dimensions.push({
    microSkill: 'speaking.pacing',
    level: clamp(pacingLevel, 4, 12),
    evidence: [
      `${formatDuration(durationSec)} spoken of ${formatDuration(task.speakSeconds)} available (${Math.round(usedRatio * 100)}%)`,
      `${Math.round(speechRatio * 100)}% of the recording is speech, ${Math.round((1 - speechRatio) * 100)}% silence`,
    ],
    note:
      usedRatio < 0.8
        ? 'Unused time is unused evidence. Every second you leave empty is a point you did not make.'
        : 'You are filling the window, which is what lets the content dimensions carry your level.',
  });

  let fluencyLevel = 9;
  if (pausesPerMinute > 12) fluencyLevel = 6;
  else if (pausesPerMinute > 8) fluencyLevel = 7;
  else if (pausesPerMinute > 5) fluencyLevel = 8.5;
  else if (pausesPerMinute > 2.5) fluencyLevel = 10;
  else fluencyLevel = 11;
  if (seg.longestPauseMs > 2500) fluencyLevel -= 1.5;
  if (speechRatio < 0.55) fluencyLevel -= 1;

  dimensions.push({
    microSkill: 'speaking.fluency',
    level: clamp(fluencyLevel, 4, 12),
    evidence: [
      `${longPauses.length} pause${longPauses.length === 1 ? '' : 's'} of 0.9s or longer (${round(pausesPerMinute, 1)} per minute)`,
      seg.longestPauseMs ? `Longest pause ${round(seg.longestPauseMs / 1000, 1)}s` : 'No extended pauses',
      `Speech-run consistency ±${round(seg.runLengthSd / 1000, 1)}s`,
    ],
    note:
      pausesPerMinute > 8
        ? 'Frequent long pauses usually mean you are planning the sentence while speaking it. Plan the shape in prep time, not the words.'
        : 'Pausing at idea boundaries reads as control; pausing inside a phrase reads as searching.',
  });

  if (!hasTranscript) {
    limitations.push(
      'No transcript was available for this response, so only delivery could be analysed. Enable speech recognition in your browser, or type what you said, to get content feedback.',
    );
    limitations.push(
      'Pronunciation accuracy is outside what this analyser can measure. It reports pause structure and pacing, which are observable, and does not estimate phoneme accuracy.',
    );
    const estimated = dimensions.reduce((a, d) => a + d.level, 0) / dimensions.length;
    return {
      engine: SPEAKING_ENGINE,
      engineVersion: SPEAKING_ENGINE_VERSION,
      estimatedLevel: round(clamp(estimated, 4, 12), 1),
      levelSe: 2.0,
      dimensions: dimensions.map((d) => ({ ...d, level: round(d.level, 1) })),
      findings: [],
      criteriaCoverage: task.successCriteria.map((c) => ({ criterion: c, covered: false })),
      metrics: {
        durationSeconds: round(durationSec, 1),
        speechRatio: round(speechRatio, 2),
        longPauses: longPauses.length,
      },
      coaching: {
        headline:
          'Delivery only: this response was analysed from the audio alone because no transcript was captured.',
        strengths: [],
        priorities: [
          {
            title: 'Capture a transcript to unlock content feedback',
            microSkill: 'speaking.task_response',
            why: 'Structure, development and vocabulary are the dimensions that decide your level, and none of them can be seen without words.',
            how: 'Record again with speech recognition enabled, or paste what you said into the transcript box below the player.',
          },
        ],
      },
      limitations,
      transcriptQuality: 'none',
    };
  }

  /* ---------------- Content dimensions ---------------- */

  const lex = lexicalProfile(transcript);
  const syn = syntaxProfile(transcript);
  const coh = cohesionProfile(transcript);
  const findings = runUsageRules(transcript, { formal: false, transcript: true });

  const lower = ` ${transcript.toLowerCase()} `;
  let fillerCount = 0;
  const fillerHits: string[] = [];
  for (const f of FILLERS) {
    const matches = lower.split(` ${f} `).length - 1;
    if (matches > 0) {
      fillerCount += matches;
      fillerHits.push(`${f} ×${matches}`);
    }
  }
  const repeats = (transcript.toLowerCase().match(/\b(\w+)\s+\1\b/g) ?? []).length;
  const wordsPerMinute = durationSec > 0 ? (toks.length * 60) / durationSec : 0;
  const articulationRate = seg.speechMs > 0 ? (toks.length * 60000) / seg.speechMs : wordsPerMinute;

  // Task response: does the transcript perform the moves the task requires?
  const criteriaCoverage = task.successCriteria.map((criterion) => ({
    criterion,
    covered: detectMove(criterion, transcript),
  }));
  const criteriaRatio = criteriaCoverage.length
    ? criteriaCoverage.filter((c) => c.covered).length / criteriaCoverage.length
    : 1;
  const promptRelevance = overlapRatio(contentWords(task.prompt), contentWords(transcript));
  const commitsEarly = OPENING_MOVES.test(transcript.split(/[.!?]/).slice(0, 2).join(' '));

  let responseLevel = 5 + criteriaRatio * 5;
  if (commitsEarly) responseLevel += 1;
  if (promptRelevance < 0.15) responseLevel -= 2;
  if (promptRelevance > 0.35) responseLevel += 0.5;
  responseLevel = clamp(responseLevel, 4, 12);

  const hasReason = REASON_MOVES.test(transcript);
  const hasExample = EXAMPLE_MOVES.test(transcript);
  const hasClosing = CLOSING_MOVES.test(transcript.slice(-260));
  const reasonCount = (transcript.match(new RegExp(REASON_MOVES.source, 'gi')) ?? []).length;

  let developmentLevel = 6;
  if (hasReason) developmentLevel += 1.5;
  if (reasonCount >= 3) developmentLevel += 1;
  if (hasExample) developmentLevel += 1.5;
  if (toks.length >= (task.speakSeconds / 60) * 110) developmentLevel += 0.5;
  if (!hasReason && !hasExample) developmentLevel -= 1.5;
  developmentLevel = clamp(developmentLevel, 4, 12);

  let structureLevel = 6.5;
  if (commitsEarly) structureLevel += 1.5;
  if (hasClosing) structureLevel += 1.5;
  if (coh.connectiveTypes.length >= 3) structureLevel += 1;
  if (coh.connectiveTypes.length <= 1) structureLevel -= 1;
  structureLevel = clamp(structureLevel, 4, 12);

  const fillersPerMinute = durationSec > 0 ? (fillerCount * 60) / durationSec : 0;
  let fillerLevel = 11;
  if (fillersPerMinute > 12) fillerLevel = 5.5;
  else if (fillersPerMinute > 8) fillerLevel = 7;
  else if (fillersPerMinute > 5) fillerLevel = 8.5;
  else if (fillersPerMinute > 2) fillerLevel = 10;
  if (repeats >= 3) fillerLevel -= 1;
  fillerLevel = clamp(fillerLevel, 4, 12);

  const sophisticatedPer100 = toks.length ? (lex.sophisticatedWords.length * 100) / toks.length : 0;
  let lexicalLevel = 6;
  if (sophisticatedPer100 >= 1) lexicalLevel = 8;
  if (sophisticatedPer100 >= 2.2) lexicalLevel = 9.5;
  if (sophisticatedPer100 >= 3.5) lexicalLevel = 11;
  if (lex.mattr >= 0.68) lexicalLevel += 0.5;
  if (lex.overusedWords.length >= 3) lexicalLevel -= 1;
  lexicalLevel = clamp(lexicalLevel, 4, 12);

  const load = errorLoad(findings.filter((f) => f.errorCode.startsWith('grammar.')));
  const loadPer100 = toks.length ? (load * 100) / toks.length : 0;
  let grammarLevel = 11;
  if (loadPer100 > 3) grammarLevel = 5.5;
  else if (loadPer100 > 2) grammarLevel = 6.5;
  else if (loadPer100 > 1.2) grammarLevel = 8;
  else if (loadPer100 > 0.5) grammarLevel = 9.5;
  if (syn.subordinationRatio < 0.2) grammarLevel -= 1; // complexity avoided, not controlled
  grammarLevel = clamp(grammarLevel, 4, 12);

  let coherenceLevel = 7;
  if (coh.adjacentOverlap >= 0.1 && coh.adjacentOverlap <= 0.5) coherenceLevel += 1.5;
  if (coh.connectiveTypes.length >= 3) coherenceLevel += 1.5;
  if (coh.overusedConnectives.length) coherenceLevel -= 1;
  if (repeats >= 4) coherenceLevel -= 1;
  coherenceLevel = clamp(coherenceLevel, 4, 12);

  dimensions.push(
    {
      microSkill: 'speaking.task_response',
      level: responseLevel,
      evidence: [
        `${criteriaCoverage.filter((c) => c.covered).length} of ${criteriaCoverage.length} required moves detected`,
        commitsEarly ? 'You commit to a position in the opening' : 'The opening does not commit to a position',
        `Prompt relevance ${round(promptRelevance, 2)}`,
      ],
      note: commitsEarly
        ? 'Committing early gives you the whole window to support the position.'
        : 'Say what you think in the first sentence; the rest of the time is for defending it.',
    },
    {
      microSkill: 'speaking.structure',
      level: structureLevel,
      evidence: [
        commitsEarly ? 'Clear opening move' : 'No clear opening move',
        hasClosing ? 'Closing move present' : 'Response ends without a closing move',
        `${coh.connectiveTypes.length} connective types: ${coh.connectiveTypes.join(', ') || 'none'}`,
      ],
      note: hasClosing
        ? 'A closing sentence signals a complete answer rather than a truncated one.'
        : 'Reserve the last ten seconds for one sentence that lands the point.',
    },
    {
      microSkill: 'speaking.development',
      level: developmentLevel,
      evidence: [
        `${reasonCount} reason marker${reasonCount === 1 ? '' : 's'} (because / that way / which means)`,
        hasExample ? 'Concrete example given' : 'No concrete example',
        `${toks.length} words in ${formatDuration(durationSec)}`,
      ],
      note: hasExample
        ? 'The example is what makes the point memorable; keep it specific.'
        : 'Add one real example. A specific instance is worth more than a second general reason.',
    },
    {
      microSkill: 'speaking.filler_control',
      level: fillerLevel,
      evidence: [
        `${fillerCount} filler${fillerCount === 1 ? '' : 's'} (${round(fillersPerMinute, 1)} per minute)${fillerHits.length ? `: ${fillerHits.slice(0, 4).join(', ')}` : ''}`,
        repeats ? `${repeats} immediate word repetitions` : 'No immediate repetitions',
      ],
      note:
        fillersPerMinute > 5
          ? 'Replace vocalised hesitation with a short silent pause; silence reads as thinking, “um” reads as searching.'
          : 'Hesitation is controlled and does not distract from the content.',
    },
    {
      microSkill: 'speaking.lexical_range',
      level: lexicalLevel,
      evidence: [
        `${lex.sophisticatedWords.length} mid-to-low-frequency words: ${lex.sophisticatedWords.slice(0, 6).join(', ') || '—'}`,
        `Lexical diversity ${lex.mattr}`,
        lex.overusedWords.length ? `Repeated: ${lex.overusedWords.map((w) => `${w.word} ×${w.count}`).join(', ')}` : 'Little repetition',
      ],
      note:
        lexicalLevel >= 10
          ? 'Precise word choice under real-time pressure is a top-band signal.'
          : 'Prepare three topic-specific words during prep time and use them deliberately.',
    },
    {
      microSkill: 'speaking.grammar_control',
      level: grammarLevel,
      evidence: [
        `${findings.length} usage pattern${findings.length === 1 ? '' : 's'} flagged in the transcript`,
        `${round(syn.subordinationRatio, 2)} subordinate clauses per sentence`,
        ...findings.slice(0, 2).map((f) => `“${f.excerpt}” — ${f.message}`),
      ],
      note: 'Transcripts lack punctuation, so only patterns that survive that limitation are checked here.',
    },
    {
      microSkill: 'speaking.coherence',
      level: coherenceLevel,
      evidence: [
        `Adjacent-sentence overlap ${coh.adjacentOverlap}`,
        `${sentences(transcript).length} idea units detected`,
      ],
      note:
        coherenceLevel >= 10
          ? 'A listener can follow the logic without reconstructing it.'
          : 'Signal each new idea before you develop it, so the listener knows a turn is coming.',
    },
  );

  /* ---------------- Aggregate ---------------- */
  const weights: Record<string, number> = {
    'speaking.task_response': 2.0,
    'speaking.development': 1.8,
    'speaking.structure': 1.4,
    'speaking.fluency': 1.3,
    'speaking.pacing': 1.0,
    'speaking.lexical_range': 1.4,
    'speaking.grammar_control': 1.2,
    'speaking.coherence': 1.2,
    'speaking.filler_control': 0.8,
  };
  let weighted = 0;
  let weightSum = 0;
  for (const d of dimensions) {
    const w = weights[d.microSkill] ?? 1;
    weighted += d.level * w;
    weightSum += w;
  }
  let estimated = weighted / weightSum;
  if (usedRatio < 0.6) estimated = Math.min(estimated, 7.5);
  if (criteriaRatio < 0.5) estimated = Math.min(estimated, 8.5);

  const asrPenalty = input.transcriptSource === 'browser_asr' ? 0.45 : 0.2;
  const se = round(clamp(0.5 + asrPenalty + (toks.length < 60 ? 0.4 : 0), 0.4, 1.8), 2);

  const sorted = [...dimensions].sort((a, b) => a.level - b.level);
  const strengths = [...dimensions]
    .sort((a, b) => b.level - a.level)
    .slice(0, 2)
    .map((d) => `${speakingLabel(d.microSkill)} is working well (CLB ${Math.round(d.level)}). ${d.note}`);

  const priorities: CoachingPriority[] = sorted.slice(0, 3).map((d) => ({
    title: `${speakingLabel(d.microSkill)} — CLB ${Math.round(d.level)}`,
    microSkill: d.microSkill,
    why: speakingWhy(d.microSkill),
    how: speakingHow(d.microSkill, task),
    fromYourText: speakingExample(d.microSkill, { transcript, fillerHits, lex, criteriaCoverage, findings }),
    drill: speakingDrill(d.microSkill),
  }));

  limitations.push(
    'Pronunciation accuracy is outside what this analyser can measure. It reports pause structure, pacing and rhythm, which are observable from the recording, and makes no phoneme-level judgement.',
  );
  if (input.transcriptSource === 'browser_asr') {
    limitations.push(
      'The transcript came from browser speech recognition, which adds its own errors and no punctuation. Grammar findings are therefore indicative; check the transcript before acting on them.',
    );
  }
  limitations.push('This is a Meridian practice estimate, not a CELPIP score.');

  return {
    engine: SPEAKING_ENGINE,
    engineVersion: SPEAKING_ENGINE_VERSION,
    estimatedLevel: round(clamp(estimated, 4, 12), 1),
    levelSe: se,
    dimensions: dimensions.map((d) => ({ ...d, level: round(d.level, 1) })),
    findings,
    criteriaCoverage,
    metrics: {
      durationSeconds: round(durationSec, 1),
      wordsSpoken: toks.length,
      wordsPerMinute: Math.round(wordsPerMinute),
      articulationRate: Math.round(articulationRate),
      speechRatio: round(speechRatio, 2),
      longPauses: longPauses.length,
      longestPauseSeconds: round(seg.longestPauseMs / 1000, 1),
      fillers: fillerCount,
      lexicalDiversity: lex.mattr,
    },
    coaching: {
      headline: `Around CLB ${Math.round(estimated)} on this response. The dimension holding it back is ${speakingLabel(sorted[0].microSkill).toLowerCase()}.`,
      strengths,
      priorities,
    },
    limitations,
    transcriptQuality: input.transcriptSource === 'browser_asr' ? 'asr' : 'manual',
  };
}

function speakingLabel(microSkill: string): string {
  const map: Record<string, string> = {
    'speaking.task_response': 'Answering the task',
    'speaking.structure': 'Structure',
    'speaking.development': 'Depth of support',
    'speaking.fluency': 'Fluency',
    'speaking.pacing': 'Time use',
    'speaking.lexical_range': 'Vocabulary range',
    'speaking.grammar_control': 'Grammatical control',
    'speaking.coherence': 'Coherence',
    'speaking.filler_control': 'Filler control',
    'speaking.register': 'Register',
    'speaking.intelligibility': 'Intelligibility',
  };
  return map[microSkill] ?? microSkill;
}

function speakingWhy(microSkill: string): string {
  const map: Record<string, string> = {
    'speaking.task_response':
      'Every task asks for a specific communicative job. Doing a nearby job well still scores as not doing the task.',
    'speaking.structure':
      'Without an opening and closing move, a listener cannot tell whether your answer is finished or interrupted.',
    'speaking.development':
      'Unsupported points are the most common ceiling between CLB 8 and CLB 10 in speaking.',
    'speaking.fluency':
      'Long pauses inside a phrase force the listener to hold your sentence in memory while you finish it.',
    'speaking.pacing':
      'Unused seconds are unmade points; there is no credit for finishing early.',
    'speaking.lexical_range':
      'General vocabulary makes a precise idea sound approximate, which reads as a lower level.',
    'speaking.grammar_control':
      'Errors in the structures you attempt matter more than the structures you avoid.',
    'speaking.coherence':
      'When the connection between ideas is implicit, the listener does the work and hears it as less controlled.',
    'speaking.filler_control':
      'Fillers dilute an otherwise strong answer and are among the easiest things to change.',
  };
  return map[microSkill] ?? '';
}

function speakingHow(microSkill: string, task: SpeakingTaskSpec): string {
  const map: Record<string, string> = {
    'speaking.task_response': `Use your ${task.prepSeconds} seconds of prep to write the verb of the task — advise, compare, predict, describe — and open with it.`,
    'speaking.structure':
      'Rehearse a three-part shape: position, two supported reasons, one closing sentence. Say the closing sentence out loud before you record.',
    'speaking.development':
      'Practise the chain: claim → because → for example → so. Record one response using only that chain.',
    'speaking.fluency':
      'Record at 80% speed, keeping pauses only at commas and full stops. Speed comes back once the pauses move.',
    'speaking.pacing':
      'Set a timer for the full window and force yourself to keep speaking until it ends, even if you repeat a point in different words.',
    'speaking.lexical_range':
      'During prep, write three topic words you intend to use, then use all three.',
    'speaking.grammar_control':
      'Take the flagged pattern and produce ten correct spoken examples of it before your next recording.',
    'speaking.coherence':
      'Signal each turn: “The first reason is…”, “What matters more, though, is…”. Two signals per response is enough.',
    'speaking.filler_control':
      'Record a response where every “um” is replaced with a closed-mouth pause. It will feel slow and sound controlled.',
  };
  return map[microSkill] ?? '';
}

function speakingDrill(microSkill: string): CoachingPriority['drill'] {
  const map: Record<string, CoachingPriority['drill']> = {
    'speaking.development': { kind: 'lesson', ref: 'claim-because-example', label: 'Drill: claim → because → example' },
    'speaking.structure': { kind: 'lesson', ref: 'speaking-shapes', label: 'Lesson: response shapes by task' },
    'speaking.filler_control': { kind: 'lesson', ref: 'silent-pausing', label: 'Drill: silent pausing' },
    'speaking.task_response': { kind: 'lesson', ref: 'task-verbs', label: 'Lesson: the verb of the task' },
    'speaking.lexical_range': { kind: 'practice', ref: 'vocabulary', label: 'Practice: topic word sets' },
    'speaking.pacing': { kind: 'lesson', ref: 'filling-the-window', label: 'Drill: filling the window' },
  };
  return map[microSkill];
}

function speakingExample(
  microSkill: string,
  ctx: {
    transcript: string;
    fillerHits: string[];
    lex: ReturnType<typeof lexicalProfile>;
    criteriaCoverage: { criterion: string; covered: boolean }[];
    findings: UsageFinding[];
  },
): string | undefined {
  switch (microSkill) {
    case 'speaking.filler_control':
      return ctx.fillerHits.length ? `Fillers counted: ${ctx.fillerHits.join(', ')}` : undefined;
    case 'speaking.task_response': {
      const missing = ctx.criteriaCoverage.find((c) => !c.covered);
      return missing ? `Missing move: ${missing.criterion}` : undefined;
    }
    case 'speaking.lexical_range': {
      const o = ctx.lex.overusedWords[0];
      return o ? `You said “${o.word}” ${o.count} times.` : undefined;
    }
    case 'speaking.grammar_control': {
      const f = ctx.findings[0];
      return f ? `“${f.excerpt}” — ${f.suggestion}` : undefined;
    }
    default:
      return undefined;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
