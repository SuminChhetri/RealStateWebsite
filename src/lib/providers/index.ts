/**
 * Provider seams.
 *
 * Meridian runs entirely on local, free capabilities today: rule-based
 * analysers, browser-native speech synthesis and recognition, and disk
 * storage. That is a deliberate constraint, not a limitation to hide — the
 * product must be fully usable by a learner who pays for nothing and installs
 * nothing.
 *
 * Each capability is defined here as an interface with a working local
 * implementation. Adding a hosted provider later means implementing an
 * interface and changing one factory, not touching feature code. Nothing in
 * `app/` imports a provider implementation directly.
 */
import fs from 'node:fs';
import path from 'node:path';

/* ------------------------------------------------------------------ */
/* Evaluation                                                          */
/* ------------------------------------------------------------------ */

export interface EvaluationCapabilities {
  /** Can the engine judge argument quality rather than measurable structure? */
  semanticJudgement: boolean;
  /** Can it assess pronunciation at phoneme level? */
  pronunciation: boolean;
  /** Can it generate novel practice items on demand? */
  itemGeneration: boolean;
}

export interface EvaluationProvider {
  readonly id: string;
  readonly version: string;
  readonly capabilities: EvaluationCapabilities;
  /** Learner-facing statement of what this engine cannot do. */
  readonly limitations: string[];
}

export const localEvaluationProvider: EvaluationProvider = {
  id: 'local-linguistic',
  version: '1.0.0',
  capabilities: { semanticJudgement: false, pronunciation: false, itemGeneration: false },
  limitations: [
    'Analysis is rule-based: it measures structure, coverage, range and known error patterns.',
    'It does not judge how persuasive or original an argument is.',
    'It does not assess pronunciation at phoneme level.',
  ],
};

export function evaluationProvider(): EvaluationProvider {
  // A hosted provider would be selected here from configuration. None is
  // wired, because none is available without payment.
  return localEvaluationProvider;
}

/* ------------------------------------------------------------------ */
/* Speech synthesis                                                    */
/* ------------------------------------------------------------------ */

export type VoiceRole = 'narrator' | 'speaker_a' | 'speaker_b' | 'speaker_c' | 'reporter';

export interface SpeechTurn {
  speaker: string;
  voice: VoiceRole;
  text: string;
}

export interface SpeechSynthesisPlan {
  /**
   * Delivery hints applied per role by the browser player: rate and pitch
   * offsets that keep speakers distinguishable without sounding synthetic.
   */
  voiceProfiles: Record<VoiceRole, { rate: number; pitch: number; preferredVoices: string[] }>;
  /** Pause inserted between turns, in milliseconds. */
  turnGapMs: number;
}

/**
 * Listening audio is rendered in the browser with the Web Speech API. It costs
 * nothing, works offline once voices are installed, and gives every learner
 * the same content. The `audioUrl` seam below is where pre-rendered
 * professional audio would be served from once it exists.
 */
export const browserSpeechPlan: SpeechSynthesisPlan = {
  voiceProfiles: {
    narrator: { rate: 0.97, pitch: 1.0, preferredVoices: ['Google UK English Male', 'Daniel', 'Microsoft Ryan'] },
    speaker_a: { rate: 1.02, pitch: 1.08, preferredVoices: ['Google US English', 'Samantha', 'Microsoft Aria'] },
    speaker_b: { rate: 0.99, pitch: 0.92, preferredVoices: ['Google UK English Male', 'Alex', 'Microsoft Guy'] },
    speaker_c: { rate: 1.05, pitch: 1.15, preferredVoices: ['Karen', 'Microsoft Jenny', 'Google English'] },
    reporter: { rate: 0.95, pitch: 1.0, preferredVoices: ['Google UK English Female', 'Moira', 'Microsoft Sonia'] },
  },
  turnGapMs: 420,
};

export function audioUrlFor(_stimulusSlug: string): string | null {
  // Pre-rendered audio is not bundled: producing it would require a paid
  // service or shipping large binaries. The player falls back to browser
  // synthesis, and this function is the single place to change when real
  // recordings exist.
  return null;
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

export interface StorageProvider {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ data: Buffer; contentType: string } | null>;
  delete(key: string): Promise<void>;
}

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'data', 'uploads');

/** Keys are namespaced by tenant and validated; no client string reaches the filesystem. */
function resolveKey(key: string): string {
  if (!/^[a-z0-9/_.-]+$/i.test(key) || key.includes('..')) throw new Error('INVALID_KEY');
  return path.join(UPLOAD_ROOT, key);
}

export const localStorageProvider: StorageProvider = {
  async put(key, data, contentType) {
    const target = resolveKey(key);
    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    await fs.promises.writeFile(target, data);
    await fs.promises.writeFile(`${target}.meta`, contentType, 'utf8');
  },
  async get(key) {
    const target = resolveKey(key);
    try {
      const data = await fs.promises.readFile(target);
      const contentType = await fs.promises
        .readFile(`${target}.meta`, 'utf8')
        .catch(() => 'application/octet-stream');
      return { data, contentType };
    } catch {
      return null;
    }
  },
  async delete(key) {
    const target = resolveKey(key);
    await fs.promises.rm(target, { force: true });
    await fs.promises.rm(`${target}.meta`, { force: true });
  },
};

export function storage(): StorageProvider {
  return localStorageProvider;
}

/* ------------------------------------------------------------------ */
/* Entitlements                                                        */
/* ------------------------------------------------------------------ */

export interface Plan {
  key: string;
  name: string;
  audience: 'individual' | 'organisation';
  limits: {
    mockTestsPerMonth: number;
    writingEvaluationsPerMonth: number;
    speakingEvaluationsPerMonth: number;
    seats: number;
  };
  features: string[];
}

/**
 * Plans are modelled so entitlement checks exist from day one, but no billing
 * provider is connected and nothing in the product is gated. When billing is
 * added, `entitlements()` is the only function that changes.
 */
export const PLANS: Plan[] = [
  {
    key: 'learner_free',
    name: 'Learner',
    audience: 'individual',
    limits: {
      mockTestsPerMonth: Number.POSITIVE_INFINITY,
      writingEvaluationsPerMonth: Number.POSITIVE_INFINITY,
      speakingEvaluationsPerMonth: Number.POSITIVE_INFINITY,
      seats: 1,
    },
    features: ['diagnostic', 'practice', 'mistakes', 'plan', 'mock'],
  },
  {
    key: 'institute',
    name: 'Institute',
    audience: 'organisation',
    limits: {
      mockTestsPerMonth: Number.POSITIVE_INFINITY,
      writingEvaluationsPerMonth: Number.POSITIVE_INFINITY,
      speakingEvaluationsPerMonth: Number.POSITIVE_INFINITY,
      seats: 50,
    },
    features: ['diagnostic', 'practice', 'mistakes', 'plan', 'mock', 'cohorts', 'teacher_review'],
  },
];

export function entitlements(planKey: string): Plan {
  return PLANS.find((p) => p.key === planKey) ?? PLANS[0];
}

export function hasFeature(planKey: string, feature: string): boolean {
  return entitlements(planKey).features.includes(feature);
}
