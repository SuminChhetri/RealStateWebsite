/**
 * High-precision usage rules.
 *
 * This is a curated rule set, not a statistical grammar model, and the product
 * says so wherever its output appears. Rules were selected on two criteria:
 *  1. The pattern is a genuinely frequent error for advanced learners.
 *  2. The pattern can be detected with very few false positives using surface
 *     context alone — no parser required.
 *
 * A rule that could not meet criterion 2 was left out rather than shipped
 * with a guess. Missing an error is acceptable; telling a CLB 10 learner that
 * correct English is wrong is not.
 *
 * `errorCode` values are stable and are the join key between an error found
 * here, the learner's mistake bank, and the grammar point that remediates it.
 */

export interface UsageRule {
  id: string;
  errorCode: string;
  microSkill: string;
  pattern: RegExp;
  severity: 'high' | 'medium' | 'low';
  /** What is wrong, addressed to the learner. */
  message: string;
  /** How to fix it. `$1`-style backreferences from the match are supported. */
  suggestion: string;
  /** Contexts where the rule should not fire. */
  skipIf?: RegExp;
  /** Only apply to formal registers. */
  formalOnly?: boolean;
  /** Skip when analysing an ASR transcript (punctuation is unreliable). */
  writtenOnly?: boolean;
  grammarPoint?: string;
}

export const USAGE_RULES: UsageRule[] = [
  /* ---- Prepositions and dependent structures ---- */
  {
    id: 'discuss-about',
    errorCode: 'grammar.preposition.transitive',
    microSkill: 'grammar.prepositions',
    pattern: /\b(discuss|discussed|discussing|mention|mentioned|emphasi[sz]e[ds]?)\s+about\b/gi,
    severity: 'high',
    message: '“$1” takes a direct object — no preposition follows it.',
    suggestion: 'Remove “about”: “discuss the proposal”, not “discuss about the proposal”.',
    grammarPoint: 'dependent-prepositions',
  },
  {
    id: 'despite-of',
    errorCode: 'grammar.preposition.despite',
    microSkill: 'grammar.prepositions',
    pattern: /\bdespite\s+of\b/gi,
    severity: 'high',
    message: '“Despite” is never followed by “of”.',
    suggestion: 'Use “despite the delay” or “in spite of the delay”.',
    grammarPoint: 'dependent-prepositions',
  },
  {
    id: 'depend-of',
    errorCode: 'grammar.preposition.depend',
    microSkill: 'grammar.prepositions',
    pattern: /\bdepend(s|ed|ing)?\s+(of|from)\b/gi,
    severity: 'high',
    message: '“Depend” pairs with “on”.',
    suggestion: 'Write “depends on the outcome”.',
    grammarPoint: 'dependent-prepositions',
  },
  {
    id: 'consist-of-missing',
    errorCode: 'grammar.preposition.consist',
    microSkill: 'grammar.prepositions',
    pattern: /\bconsists?\s+(in|from)\s+(?!a\s+series)/gi,
    severity: 'medium',
    message: '“Consist” normally pairs with “of” when listing components.',
    suggestion: 'Write “consists of three parts”.',
    grammarPoint: 'dependent-prepositions',
  },
  {
    id: 'married-with',
    errorCode: 'grammar.preposition.collocation',
    microSkill: 'grammar.prepositions',
    pattern: /\b(married|bored|worried|concerned)\s+with\b/gi,
    severity: 'medium',
    message: '“$1” takes a different preposition here.',
    suggestion: 'Use “married to”, “bored with/by”, “worried about”, “concerned about”.',
    grammarPoint: 'dependent-prepositions',
  },
  {
    id: 'in-the-other-hand',
    errorCode: 'grammar.preposition.fixed_phrase',
    microSkill: 'grammar.prepositions',
    pattern: /\bin\s+the\s+other\s+hand\b/gi,
    severity: 'high',
    message: 'The fixed phrase is “on the other hand”.',
    suggestion: 'Replace “in the other hand” with “on the other hand”.',
    grammarPoint: 'dependent-prepositions',
  },
  {
    id: 'according-to-me',
    errorCode: 'grammar.fixed_phrase.opinion',
    microSkill: 'grammar.word_order',
    pattern: /\baccording\s+to\s+(me|my\s+opinion)\b/gi,
    severity: 'high',
    message: '“According to” attributes an idea to someone else, never to yourself.',
    suggestion: 'Use “in my view”, “I would argue that”, or “to my mind”.',
    grammarPoint: 'stating-a-position',
  },

  /* ---- Verb forms ---- */
  {
    id: 'modal-plus-ing',
    errorCode: 'grammar.verb.after_modal',
    microSkill: 'grammar.verb_forms',
    pattern: /\b(can|could|may|might|must|shall|should|will|would)\s+(be\s+)?(\w+ing)\b/gi,
    severity: 'low',
    message: 'Check the form after a modal: a bare infinitive is required unless “be” intervenes.',
    suggestion: '“should consider”, or “should be considering” — not “should considering”.',
    skipIf: /\b(can|could|may|might|must|shall|should|will|would)\s+be\s+\w+ing\b/i,
    grammarPoint: 'modal-verb-forms',
  },
  {
    id: 'to-plus-ing',
    errorCode: 'grammar.verb.infinitive',
    microSkill: 'grammar.verb_forms',
    pattern: /\b(able|want|need|decide[ds]?|hope[ds]?|plan(ned)?|manage[ds]?|refuse[ds]?)\s+to\s+(\w+ing)\b/gi,
    severity: 'high',
    message: 'After “to” in an infinitive, use the base verb.',
    suggestion: '“decided to apply”, not “decided to applying”.',
    grammarPoint: 'gerund-vs-infinitive',
  },
  {
    id: 'look-forward-to-base',
    errorCode: 'grammar.verb.gerund_after_to',
    microSkill: 'grammar.verb_forms',
    pattern: /\b(look(ing)?\s+forward\s+to|committed\s+to|used\s+to\s+be\s+)\s*(hear|receive|meet|discuss|work|start)\b/gi,
    severity: 'medium',
    message: 'In “look forward to”, “to” is a preposition, so an -ing form follows.',
    suggestion: 'Write “I look forward to hearing from you”.',
    grammarPoint: 'gerund-vs-infinitive',
  },
  {
    id: 'since-present',
    errorCode: 'grammar.verb.perfect',
    microSkill: 'grammar.verb_forms',
    pattern: /\bI\s+(work|live|study|use)\s+(here|there|in\s+\w+)\s+since\b/gi,
    severity: 'high',
    message: 'A period starting in the past and continuing now takes the present perfect.',
    suggestion: '“I have worked here since 2021”.',
    grammarPoint: 'present-perfect',
  },
  {
    id: 'did-past',
    errorCode: 'grammar.verb.after_did',
    microSkill: 'grammar.verb_forms',
    pattern: /\bdid\s+not\s+(went|saw|took|came|made|gave|knew|thought|found|said|got)\b/gi,
    severity: 'high',
    message: 'After “did/did not”, use the base form.',
    suggestion: '“did not go”, not “did not went”.',
    grammarPoint: 'past-simple-formation',
  },
  {
    id: 'would-past',
    errorCode: 'grammar.verb.conditional',
    microSkill: 'grammar.verb_forms',
    pattern: /\bif\s+\w+\s+(will|would)\s+/gi,
    severity: 'medium',
    message: 'The “if” clause normally avoids “will/would”; the result clause carries it.',
    suggestion: '“If the city invests now, congestion will fall”, not “If the city will invest…”.',
    grammarPoint: 'conditionals',
  },

  /* ---- Agreement ---- */
  {
    id: 'there-is-plural',
    errorCode: 'grammar.agreement.existential',
    microSkill: 'grammar.agreement',
    pattern: /\bthere\s+is\s+(many|several|numerous|two|three|four|five|various)\s+\w+s\b/gi,
    severity: 'high',
    message: 'A plural subject after “there” needs “there are”.',
    suggestion: '“There are several reasons”.',
    grammarPoint: 'subject-verb-agreement',
  },
  {
    id: 'people-is',
    errorCode: 'grammar.agreement.plural_noun',
    microSkill: 'grammar.agreement',
    pattern: /\b(people|children|men|women|staff|police)\s+(is|was|has)\b/gi,
    severity: 'high',
    message: '“$1” takes a plural verb.',
    suggestion: '“People are”, “staff were”, “the police have”.',
    grammarPoint: 'subject-verb-agreement',
  },
  {
    id: 'third-person-s',
    errorCode: 'grammar.agreement.third_person',
    microSkill: 'grammar.agreement',
    pattern: /\b(he|she|it|this|that)\s+(have|do|go|make|take|seem|need|want|provide|allow)\b/gi,
    severity: 'high',
    message: 'A third-person singular subject needs the -s form.',
    suggestion: '“It provides”, “she needs”.',
    skipIf: /\b(he|she|it)\s+(do|have)\s+not\b/i,
    grammarPoint: 'subject-verb-agreement',
  },
  {
    id: 'each-every-plural',
    errorCode: 'grammar.agreement.quantifier',
    microSkill: 'grammar.agreement',
    pattern: /\b(each|every|either|neither)\s+(\w+s)\s+(are|were|have)\b/gi,
    severity: 'medium',
    message: '“Each/every/either/neither” are singular.',
    suggestion: '“Each option has its own cost”.',
    grammarPoint: 'subject-verb-agreement',
  },

  /* ---- Countability and articles ---- */
  {
    id: 'uncountable-plural',
    errorCode: 'grammar.noun.uncountable',
    microSkill: 'grammar.articles',
    pattern: /\b(informations|advices|equipments|furnitures|researches|knowledges|feedbacks|softwares|staffs|evidences|luggages|homeworks|traffics|accommodations)\b/gi,
    severity: 'high',
    message: '“$1” is uncountable in English and has no plural form.',
    suggestion: 'Use “information”, “a piece of advice”, “items of equipment”.',
    grammarPoint: 'countable-uncountable',
  },
  {
    id: 'a-uncountable',
    errorCode: 'grammar.article.uncountable',
    microSkill: 'grammar.articles',
    pattern: /\ba\s+(advice|information|equipment|research|knowledge|feedback|evidence|progress|access)\b/gi,
    severity: 'high',
    message: 'Uncountable nouns do not take “a/an”.',
    suggestion: 'Use “some advice”, “a piece of advice”, or drop the article.',
    grammarPoint: 'countable-uncountable',
  },
  {
    id: 'a-vowel',
    errorCode: 'grammar.article.a_an',
    microSkill: 'grammar.articles',
    pattern: /\ba\s+(a|e|i|o)[a-z]+/gi,
    severity: 'medium',
    message: 'Use “an” before a vowel sound.',
    suggestion: '“An opportunity”, “an issue”.',
    skipIf: /\ba\s+(one|once|unique|united|university|user|European|useful|eucalyptus)/i,
    grammarPoint: 'articles-basics',
  },
  {
    id: 'an-consonant',
    errorCode: 'grammar.article.a_an',
    microSkill: 'grammar.articles',
    pattern: /\ban\s+(?![aeiou]|hour|honest|honou?r|heir)[b-df-hj-np-tv-z][a-z]+/gi,
    severity: 'medium',
    message: 'Use “a” before a consonant sound.',
    suggestion: '“A proposal”, “a university”.',
    grammarPoint: 'articles-basics',
  },
  {
    id: 'the-plural-general',
    errorCode: 'grammar.article.generic',
    microSkill: 'grammar.articles',
    pattern: /\bthe\s+(people|society|nature|technology|education|health)\s+(is|are|has|have)\b/gi,
    severity: 'low',
    message: 'Generic statements about a whole category usually take no article.',
    suggestion: '“Technology has changed…”, not “The technology has changed…” (unless specific).',
    grammarPoint: 'articles-generic',
  },

  /* ---- Comparatives and quantifiers ---- */
  {
    id: 'double-comparative',
    errorCode: 'grammar.comparative.double',
    microSkill: 'grammar.clause_structure',
    pattern: /\bmore\s+\w+(er)\b|\bmost\s+\w+(est)\b/gi,
    severity: 'high',
    message: 'Do not mark the comparative twice.',
    suggestion: '“More efficient” or “faster” — not “more faster”.',
    grammarPoint: 'comparatives',
  },
  {
    id: 'than-then',
    errorCode: 'grammar.word_choice.than_then',
    microSkill: 'grammar.word_order',
    pattern: /\b(more|less|better|worse|higher|lower|greater|rather)\s+then\b/gi,
    severity: 'high',
    message: 'Comparison uses “than”; “then” is about time.',
    suggestion: '“More effective than the alternative”.',
    grammarPoint: 'commonly-confused',
  },
  {
    id: 'much-countable',
    errorCode: 'grammar.quantifier.countable',
    microSkill: 'grammar.articles',
    pattern: /\bmuch\s+(people|students|options|reasons|benefits|problems|opportunities|changes)\b/gi,
    severity: 'medium',
    message: 'Countable plurals take “many”, not “much”.',
    suggestion: '“Many options”.',
    grammarPoint: 'countable-uncountable',
  },
  {
    id: 'less-countable',
    errorCode: 'grammar.quantifier.countable',
    microSkill: 'grammar.articles',
    pattern: /\bless\s+(people|students|options|reasons|hours|days|items|resources)\b/gi,
    severity: 'low',
    message: 'Formal writing prefers “fewer” with countable plurals.',
    suggestion: '“Fewer people”.',
    formalOnly: true,
    grammarPoint: 'countable-uncountable',
  },

  /* ---- Word order and clause structure ---- */
  {
    id: 'embedded-question',
    errorCode: 'grammar.word_order.embedded_question',
    microSkill: 'grammar.word_order',
    pattern: /\b(know|wonder|ask(ed)?|explain(ed)?|tell|understand|sure)\s+(what|where|when|why|how|who)\s+(is|are|was|were|do|does|did|can|will)\s+\w+/gi,
    severity: 'medium',
    message: 'An embedded question uses statement word order.',
    suggestion: '“I wonder what the cost is”, not “I wonder what is the cost”.',
    grammarPoint: 'embedded-questions',
  },
  {
    id: 'adverb-between',
    errorCode: 'grammar.word_order.adverb',
    microSkill: 'grammar.word_order',
    pattern: /\b(explain|tell|describe|show|give|send)\s+(me|us|him|her|them)?\s*(clearly|carefully|quickly|briefly)\s+(the|this|that|your|our)\b/gi,
    severity: 'low',
    message: 'An adverb rarely sits between a verb and its direct object.',
    suggestion: '“Explain the process clearly”, not “explain clearly the process”.',
    grammarPoint: 'adverb-placement',
  },
  {
    id: 'because-fragment',
    errorCode: 'grammar.clause.fragment',
    microSkill: 'grammar.clause_structure',
    // A genuine fragment has no main clause, so it also has no comma joining
    // one. Requiring the span to be comma-free is what stops this rule firing
    // on correct sentences like "Although the cost is higher, the warranty
    // covers three years."
    pattern: /(^|[.!?]\s+)(Because|Although|Since|While|Whereas|Even though)\s+[^.!?,]{1,60}[.!?]/g,
    severity: 'medium',
    message: 'This looks like a subordinate clause standing alone as a sentence.',
    suggestion: 'Join it to the main clause it belongs with, or add a main clause.',
    writtenOnly: true,
    grammarPoint: 'sentence-fragments',
  },
  {
    id: 'although-but',
    errorCode: 'grammar.clause.double_connector',
    microSkill: 'grammar.clause_structure',
    pattern: /\b(although|though|even though|while)\b[^.!?]{5,90}\bbut\b/gi,
    severity: 'high',
    message: 'Use one contrast marker per sentence, not two.',
    suggestion: '“Although costs rose, demand held” — drop the “but”.',
    grammarPoint: 'contrast-linking',
  },
  {
    id: 'comma-splice',
    errorCode: 'grammar.clause.comma_splice',
    microSkill: 'grammar.clause_structure',
    pattern: /,\s*(however|therefore|moreover|furthermore|consequently|nevertheless)\s+[a-z]+\s+(is|are|was|were|has|have|will|would|can|could|do|does|did)\b/gi,
    severity: 'medium',
    message: 'A comma cannot join two independent clauses before a conjunctive adverb.',
    suggestion: 'Use a semicolon or a full stop: “…rose; however, demand held”.',
    writtenOnly: true,
    grammarPoint: 'punctuating-connectors',
  },
  {
    id: 'run-on-and',
    errorCode: 'grammar.clause.run_on',
    microSkill: 'grammar.clause_structure',
    pattern: /\b\w+\s+and\s+\w+\s+and\s+\w+\s+and\s+\w+/gi,
    severity: 'low',
    message: 'Several ideas are chained with “and”, which flattens their relationship.',
    suggestion: 'Subordinate the weaker ideas: “which meant…”, “so that…”, “although…”.',
    grammarPoint: 'sentence-variety',
  },

  /* ---- Register ---- */
  {
    id: 'contraction-formal',
    errorCode: 'register.contraction',
    microSkill: 'writing.register',
    pattern: /\b(don't|can't|won't|isn't|aren't|didn't|doesn't|it's|I'm|we're|they're|you're|I've|we've|shouldn't|wouldn't|couldn't)\b/gi,
    severity: 'medium',
    message: 'Contractions read as informal in a formal message.',
    suggestion: 'Expand it: “do not”, “cannot”, “it is”.',
    formalOnly: true,
    writtenOnly: true,
    grammarPoint: 'register-control',
  },
  {
    id: 'informal-lexis',
    errorCode: 'register.informal_lexis',
    microSkill: 'vocabulary.register_fit',
    pattern: /\b(kids|guys|stuff|a lot of things|gonna|wanna|kinda|sorta|huge|awesome|super|totally|okay|ok|yeah|big time)\b/gi,
    severity: 'medium',
    message: '“$1” belongs to casual speech.',
    suggestion: 'Choose a neutral equivalent: “children”, “colleagues”, “considerable”, “a range of”.',
    formalOnly: true,
    grammarPoint: 'register-control',
  },
  {
    id: 'vague-quantifier',
    errorCode: 'style.vague',
    microSkill: 'writing.lexical_range',
    pattern: /\b(a lot of|lots of|loads of|tons of|so many things|many things|a good amount)\b/gi,
    severity: 'low',
    message: 'This quantifier is vague and slightly informal.',
    suggestion: 'Be specific: “a substantial share”, “three of the five”, “most residents”.',
    grammarPoint: 'precision-in-quantity',
  },
  {
    id: 'empty-intensifier',
    errorCode: 'style.empty_intensifier',
    microSkill: 'writing.concision',
    pattern: /\b(very|really|extremely|absolutely|totally|completely)\s+(good|bad|important|nice|big|great|difficult|easy|interesting)\b/gi,
    severity: 'low',
    message: 'Intensifier plus general adjective adds emphasis but no information.',
    suggestion: 'Use a precise adjective: “critical”, “demanding”, “persuasive”, “substantial”.',
    grammarPoint: 'precision-in-adjectives',
  },
  {
    id: 'filler-opening',
    errorCode: 'style.padding',
    microSkill: 'writing.concision',
    pattern: /\b(in this essay I will|in my opinion I think|as we all know|it is a well known fact that|in today's (modern )?world|since the dawn of|nowadays in the modern era)\b/gi,
    severity: 'medium',
    message: 'This opening spends words without adding content.',
    suggestion: 'Start with your actual position or the reason for writing.',
    grammarPoint: 'openings-that-work',
  },
  {
    id: 'double-hedge',
    errorCode: 'style.overhedged',
    microSkill: 'writing.concision',
    pattern: /\b(I think (that )?maybe|maybe (it )?(could|might) possibly|perhaps (it )?might possibly)\b/gi,
    severity: 'low',
    message: 'Two hedges stacked together weaken the claim more than intended.',
    suggestion: 'Keep one: “it may” or “I would argue that”.',
    grammarPoint: 'hedging',
  },

  /* ---- Commonly confused ---- */
  {
    id: 'affect-effect',
    errorCode: 'lexis.confusable',
    microSkill: 'vocabulary.precision',
    pattern: /\b(a|the|this|that|positive|negative|significant|major)\s+affect\b|\beffect(s|ed)?\s+(the|our|their|my)\s+(way|ability|decision|outcome|health)\b/gi,
    severity: 'medium',
    message: '“Affect” is usually the verb; “effect” is usually the noun.',
    suggestion: '“The policy affected prices” / “The effect on prices was small”.',
    grammarPoint: 'commonly-confused',
  },
  {
    id: 'advice-advise',
    errorCode: 'lexis.confusable',
    microSkill: 'vocabulary.precision',
    pattern: /\b(would|should|could|can|to)\s+advice\b|\ban?\s+advise\b/gi,
    severity: 'medium',
    message: '“Advise” is the verb; “advice” is the noun.',
    suggestion: '“I would advise you to…” / “That is good advice”.',
    grammarPoint: 'commonly-confused',
  },
  {
    id: 'lose-loose',
    errorCode: 'lexis.confusable',
    microSkill: 'vocabulary.precision',
    pattern: /\b(will|would|might|could|to|not)\s+loose\b/gi,
    severity: 'medium',
    message: '“Lose” is the verb; “loose” means not tight.',
    suggestion: '“You might lose the deposit”.',
    grammarPoint: 'commonly-confused',
  },
  {
    id: 'its-possessive',
    errorCode: 'lexis.confusable',
    microSkill: 'vocabulary.precision',
    pattern: /\bit's\s+(own|purpose|impact|value|role|cost|benefit)\b/gi,
    severity: 'medium',
    message: '“It’s” means “it is”; the possessive is “its”.',
    suggestion: '“Its own purpose”.',
    writtenOnly: true,
    grammarPoint: 'commonly-confused',
  },
  {
    id: 'economic-economical',
    errorCode: 'lexis.confusable',
    microSkill: 'vocabulary.precision',
    pattern: /\beconomical\s+(growth|policy|impact|conditions|situation|development)\b/gi,
    severity: 'low',
    message: '“Economical” means cost-saving; the adjective for the economy is “economic”.',
    suggestion: '“Economic growth”.',
    grammarPoint: 'commonly-confused',
  },
  {
    id: 'nowadays-day',
    errorCode: 'lexis.confusable',
    microSkill: 'vocabulary.precision',
    pattern: /\bnowaday\b|\bin\s+nowadays\b/gi,
    severity: 'medium',
    message: 'The adverb is “nowadays”, used without a preposition.',
    suggestion: '“Nowadays, most applications are processed online”.',
    grammarPoint: 'commonly-confused',
  },

  /* ---- Email-specific conventions ---- */
  {
    id: 'dear-sir-name-known',
    errorCode: 'register.salutation',
    microSkill: 'writing.register',
    pattern: /\bdear\s+(sir|madam)\s*,/gi,
    severity: 'low',
    message: 'When you know the reader’s name, use it — a named salutation reads better.',
    suggestion: '“Dear Ms Okafor,” or “Dear Property Manager,” if no name is given.',
    formalOnly: true,
    writtenOnly: true,
    grammarPoint: 'email-conventions',
  },
  {
    id: 'i-am-writing-vague',
    errorCode: 'style.vague_purpose',
    microSkill: 'writing.task_fulfilment',
    pattern: /\bI\s+am\s+writing\s+(this\s+)?(email\s+)?(to\s+you\s+)?(because\s+of\s+some|for\s+some|about\s+some)\b/gi,
    severity: 'medium',
    message: 'The purpose statement is vague, so the reader does not know what you want.',
    suggestion: 'Name the outcome you want in the first sentence.',
    writtenOnly: true,
    grammarPoint: 'openings-that-work',
  },
  {
    id: 'thanks-in-advance',
    errorCode: 'register.closing',
    microSkill: 'writing.register',
    pattern: /\bthanks\s+in\s+advance\b/gi,
    severity: 'low',
    message: 'This closing presumes compliance and reads as informal in a formal message.',
    suggestion: '“Thank you for considering this request.”',
    formalOnly: true,
    writtenOnly: true,
    grammarPoint: 'email-conventions',
  },
];

export interface UsageFinding {
  ruleId: string;
  errorCode: string;
  microSkill: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  excerpt: string;
  span: [number, number];
  grammarPoint?: string;
}

export interface UsageOptions {
  /** Formal-only rules fire only when the task expects a formal register. */
  formal: boolean;
  /** ASR transcripts skip punctuation- and capitalisation-dependent rules. */
  transcript: boolean;
}

export function runUsageRules(text: string, options: UsageOptions): UsageFinding[] {
  const findings: UsageFinding[] = [];
  const seen = new Set<string>();

  for (const rule of USAGE_RULES) {
    if (rule.formalOnly && !options.formal) continue;
    if (rule.writtenOnly && options.transcript) continue;

    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);
    let match: RegExpExecArray | null;
    let guard = 0;
    while ((match = re.exec(text)) !== null && guard++ < 40) {
      if (match[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      const excerpt = match[0].trim();
      if (rule.skipIf && rule.skipIf.test(excerpt)) continue;
      const key = `${rule.id}:${match.index}`;
      if (seen.has(key)) continue;
      seen.add(key);

      findings.push({
        ruleId: rule.id,
        errorCode: rule.errorCode,
        microSkill: rule.microSkill,
        severity: rule.severity,
        message: interpolate(rule.message, match),
        suggestion: interpolate(rule.suggestion, match),
        excerpt,
        span: [match.index, match.index + match[0].length],
        grammarPoint: rule.grammarPoint,
      });
    }
  }

  return findings.sort((a, b) => a.span[0] - b.span[0]);
}

function interpolate(template: string, match: RegExpExecArray): string {
  return template.replace(/\$(\d)/g, (_, d: string) => match[Number(d)] ?? match[0]);
}

/** Weighted error density used by the accuracy dimension of both analysers. */
export function errorLoad(findings: UsageFinding[]): number {
  const weight = { high: 1, medium: 0.6, low: 0.25 } as const;
  return findings.reduce((acc, f) => acc + weight[f.severity], 0);
}
