import type { SeedGrammarPoint } from './types';

/**
 * Grammar points.
 *
 * Each point is joined to the usage-rule engine by `errorCode`: when the
 * writing or speaking analyser flags a pattern, the learner is routed to the
 * point that fixes it and the drills become scheduled retrieval cards. Points
 * exist only where a rule can actually detect the error — grammar the product
 * cannot observe is not taught here, because a lesson with no feedback loop is
 * a page, not a mechanism.
 */
export const grammarPoints: SeedGrammarPoint[] = [
  {
    slug: 'dependent-prepositions',
    title: 'Verbs that refuse a preposition',
    errorCode: 'grammar.preposition.transitive',
    explanation:
      'A group of high-frequency verbs takes a direct object with no preposition. Learners add one because the equivalent verb in many other languages requires it, and because the noun form often does take a preposition ("a discussion about"). The verb and the noun behave differently, and that is the whole difficulty.',
    contrasts: [
      { wrong: 'We discussed about the timeline.', right: 'We discussed the timeline.', why: 'Discuss takes a direct object. Compare the noun: “a discussion about the timeline”.' },
      { wrong: 'She mentioned about the delay.', right: 'She mentioned the delay.', why: 'Mention behaves the same way.' },
      { wrong: 'It depends of the weather.', right: 'It depends on the weather.', why: 'Depend does take a preposition — but always “on”.' },
      { wrong: 'Despite of the delay, we finished.', right: 'Despite the delay, we finished.', why: '“Despite” already contains the meaning of “in spite of”; only one form takes “of”.' },
    ],
    level: 7,
    drills: [
      { prompt: 'The committee will ______ the proposal on Tuesday. (discuss)', answer: 'discuss', explanation: 'No preposition: “discuss the proposal”.' },
      { prompt: 'The outcome ______ how quickly the permit is issued. (depend)', answer: 'depends on', explanation: 'Depend always pairs with “on”.' },
      { prompt: '______ the short notice, I am asking for an exception. (despite)', answer: 'Despite', alternatives: ['In spite of'], explanation: 'Either “despite” or “in spite of” — never “despite of”.' },
      { prompt: 'He ______ the damage when he returned the tool. (not mention)', answer: 'did not mention', explanation: 'Direct object, no preposition.' },
    ],
  },
  {
    slug: 'countable-uncountable',
    title: 'Uncountable nouns that look countable',
    errorCode: 'grammar.noun.uncountable',
    explanation:
      'English treats certain abstract and collective nouns as uncountable: they take no plural -s and no "a/an". The set is largely arbitrary and must be learned as a list, because the equivalents in most languages are countable.',
    contrasts: [
      { wrong: 'I need more informations.', right: 'I need more information.', why: 'Information has no plural form. Use “pieces of information” when you must count.' },
      { wrong: 'She gave me a good advice.', right: 'She gave me some good advice.', why: 'Or “a piece of advice” if you need the singular unit.' },
      { wrong: 'We bought new furnitures.', right: 'We bought new furniture.', why: 'Count the items instead: “three pieces of furniture”.' },
      { wrong: 'There are many evidences.', right: 'There is considerable evidence.', why: 'Evidence is uncountable in ordinary usage.' },
    ],
    level: 6,
    drills: [
      { prompt: 'Could you send me ______ about the schedule?', answer: 'some information', explanation: 'No plural, no “an”.' },
      { prompt: 'He offered me ______ that turned out to be useful.', answer: 'a piece of advice', alternatives: ['some advice'], explanation: 'Both work; “an advice” does not.' },
      { prompt: 'The clinic has purchased new ______ for the assessment room.', answer: 'equipment', explanation: 'Uncountable; count with “items of equipment”.' },
    ],
  },
  {
    slug: 'articles-basics',
    title: 'A, an, the — the decision sequence',
    errorCode: 'grammar.article.a_an',
    explanation:
      'Three questions in order decide almost every article: is the noun countable and singular? has the reader met it before? is it unique in this context? Learners who reach for a rule about "specific" nouns get stuck; the sequence is faster and more reliable.',
    contrasts: [
      { wrong: 'I have an university degree.', right: 'I have a university degree.', why: 'The choice follows the sound, not the letter: “university” starts with a /j/ sound.' },
      { wrong: 'It took a hour to complete.', right: 'It took an hour to complete.', why: 'The “h” is silent, so the word starts with a vowel sound.' },
      { wrong: 'I sent email yesterday.', right: 'I sent an email yesterday.', why: 'Countable, singular, new to the reader.' },
      { wrong: 'The technology has changed how people work.', right: 'Technology has changed how people work.', why: 'A whole category in general takes no article.' },
    ],
    level: 6,
    drills: [
      { prompt: 'She works at ______ university in Halifax.', answer: 'a', explanation: '/j/ sound at the start.' },
      { prompt: 'We waited ______ hour for the technician.', answer: 'an', explanation: 'Silent h, vowel sound.' },
      { prompt: '______ education is the strongest predictor in the data.', answer: '(no article)', alternatives: ['Education'], explanation: 'Generic category, no article.' },
      { prompt: 'I attached ______ invoice you asked for.', answer: 'the', explanation: 'Known to the reader — they asked for it.' },
    ],
  },
  {
    slug: 'subject-verb-agreement',
    title: 'Agreement across a long subject',
    errorCode: 'grammar.agreement.third_person',
    explanation:
      'Agreement errors at higher levels are rarely about knowing the rule. They happen when the subject is separated from the verb by a phrase, and the nearest noun captures the agreement instead of the real subject.',
    contrasts: [
      { wrong: 'The list of required documents were sent yesterday.', right: 'The list of required documents was sent yesterday.', why: 'The subject is “list”, not “documents”.' },
      { wrong: 'There is several reasons for this.', right: 'There are several reasons for this.', why: 'In “there is/are”, the verb agrees with what follows.' },
      { wrong: 'The staff is unhappy with the change.', right: 'The staff are unhappy with the change.', why: 'Collective nouns referring to individuals take plural agreement in Canadian usage.' },
      { wrong: 'Each of the options have a drawback.', right: 'Each of the options has a drawback.', why: '“Each” is singular however many items follow.' },
    ],
    level: 7,
    drills: [
      { prompt: 'The set of instructions ______ (be) unclear.', answer: 'is', explanation: 'Subject is “set”.' },
      { prompt: 'There ______ (be) three evenings still uncovered.', answer: 'are', explanation: 'Agreement runs forward to “evenings”.' },
      { prompt: 'Neither of the proposals ______ (address) the timing problem.', answer: 'addresses', explanation: '“Neither” is singular.' },
    ],
  },
  {
    slug: 'present-perfect',
    title: 'Present perfect: the unfinished period',
    errorCode: 'grammar.verb.perfect',
    explanation:
      'The present perfect connects a past event to now. Use it for a period that has not ended, for experience without a specific time, and for a past action with a present result. A finished time expression — yesterday, in 2019, last week — forces the past simple instead.',
    contrasts: [
      { wrong: 'I work here since 2021.', right: 'I have worked here since 2021.', why: 'The period began in the past and continues.' },
      { wrong: 'I have sent the invoice yesterday.', right: 'I sent the invoice yesterday.', why: '“Yesterday” is a finished time.' },
      { wrong: 'The contractor did not come for eight days.', right: 'The contractor has not been here for eight days.', why: 'The absence continues up to now, which is the point of the complaint.' },
      { wrong: 'Have you ever went to the depot on a Wednesday?', right: 'Have you ever been to the depot on a Wednesday?', why: 'Past participle after “have”.' },
    ],
    level: 8,
    drills: [
      { prompt: 'We ______ (not receive) a response since the fourteenth.', answer: 'have not received', explanation: 'Unfinished period marked by “since”.' },
      { prompt: 'I ______ (renew) the permit three weeks ago.', answer: 'renewed', explanation: '“Three weeks ago” is finished time.' },
      { prompt: 'She ______ (be) with the organisation for six years.', answer: 'has been', explanation: 'The period continues.' },
    ],
  },
  {
    slug: 'conditionals',
    title: 'Conditionals and where “will” belongs',
    errorCode: 'grammar.verb.conditional',
    explanation:
      'In a conditional sentence, the “if” clause states the condition and normally avoids “will”; the result clause carries it. Second conditionals shift the whole sentence back one step in time to signal that the situation is hypothetical.',
    contrasts: [
      { wrong: 'If the city will invest now, congestion will fall.', right: 'If the city invests now, congestion will fall.', why: 'Present tense in the condition, “will” in the result.' },
      { wrong: 'If I would have more time, I would take the course.', right: 'If I had more time, I would take the course.', why: 'Second conditional: past form in the condition, “would” in the result.' },
      { wrong: 'If the work is not finished by the twentieth, I will to arrange storage.', right: 'If the work is not finished by the twentieth, I will arrange storage.', why: 'Bare infinitive after “will”.' },
      { wrong: 'Unless you don’t confirm, I will assume it is agreed.', right: 'Unless you confirm, I will assume it is agreed.', why: '“Unless” already means “if not” — do not negate twice.' },
    ],
    level: 8,
    drills: [
      { prompt: 'If the permit ______ (arrive) this week, the contractor can start on Monday.', answer: 'arrives', explanation: 'Present in the condition.' },
      { prompt: 'If I ______ (be) in your position, I would take the warranty.', answer: 'were', alternatives: ['was'], explanation: '“Were” is standard in formal writing; “was” is common in speech.' },
      { prompt: '______ the gate is closed after the last session, the noise will continue. (unless)', answer: 'Unless', explanation: 'No second negative needed.' },
    ],
  },
  {
    slug: 'gerund-vs-infinitive',
    title: 'Gerund or infinitive after a verb',
    errorCode: 'grammar.verb.infinitive',
    explanation:
      'Some verbs take an infinitive, some take an -ing form, and a few take either with a change of meaning. The trap that costs most marks is the phrase where "to" is a preposition rather than part of an infinitive — after which an -ing form is required.',
    contrasts: [
      { wrong: 'I look forward to hear from you.', right: 'I look forward to hearing from you.', why: 'Here “to” is a preposition, so the -ing form follows.' },
      { wrong: 'We decided postponing the meeting.', right: 'We decided to postpone the meeting.', why: '“Decide” takes an infinitive.' },
      { wrong: 'I would recommend to book early.', right: 'I would recommend booking early.', why: '“Recommend” takes an -ing form, or “recommend that you book”.' },
      { wrong: 'She is committed to improve the process.', right: 'She is committed to improving the process.', why: 'Another preposition “to”.' },
    ],
    level: 8,
    drills: [
      { prompt: 'I look forward to ______ (discuss) this with you.', answer: 'discussing', explanation: 'Preposition “to”.' },
      { prompt: 'They agreed ______ (extend) the deadline.', answer: 'to extend', explanation: '“Agree” takes an infinitive.' },
      { prompt: 'I would suggest ______ (start) the quotes this month.', answer: 'starting', explanation: '“Suggest” takes an -ing form.' },
    ],
  },
  {
    slug: 'embedded-questions',
    title: 'Embedded questions keep statement order',
    errorCode: 'grammar.word_order.embedded_question',
    explanation:
      'When a question becomes part of a larger sentence, it stops behaving like a question: no inversion, no auxiliary "do". This is one of the most audible errors in speaking, because the inverted form sounds fluent and is still wrong.',
    contrasts: [
      { wrong: 'I would like to know when will the work be finished.', right: 'I would like to know when the work will be finished.', why: 'No inversion inside the embedded clause.' },
      { wrong: 'Could you tell me where is the north gate?', right: 'Could you tell me where the north gate is?', why: 'Same rule.' },
      { wrong: 'I am not sure what does the policy require.', right: 'I am not sure what the policy requires.', why: 'No auxiliary “do” in the embedded clause.' },
      { wrong: 'He explained why did the system fail.', right: 'He explained why the system failed.', why: 'Statement order after “explained”.' },
    ],
    level: 8,
    drills: [
      { prompt: 'Could you tell me when ______ (the office / open)?', answer: 'the office opens', explanation: 'Statement order.' },
      { prompt: 'I would like to understand why ______ (the permit / be delayed).', answer: 'the permit was delayed', explanation: 'No inversion.' },
      { prompt: 'She asked what ______ (I / need) for the appointment.', answer: 'I needed', explanation: 'No auxiliary “did”.' },
    ],
  },
  {
    slug: 'sentence-fragments',
    title: 'Fragments and comma splices',
    errorCode: 'grammar.clause.fragment',
    explanation:
      'A subordinate clause cannot stand alone, and a comma cannot join two independent clauses. Both errors are more common in timed writing than in untimed, because they appear when a sentence is revised halfway through.',
    contrasts: [
      { wrong: 'Because the drain has not been cleared. The water returned in April.', right: 'Because the drain has not been cleared, the water returned in April.', why: 'Join the subordinate clause to its main clause.' },
      { wrong: 'The renewal went through, however it was applied to the wrong plate.', right: 'The renewal went through; however, it was applied to the wrong plate.', why: '“However” is not a conjunction — it needs a semicolon or a full stop.' },
      { wrong: 'The work is half finished, no one has attended for eight days.', right: 'The work is half finished, and no one has attended for eight days.', why: 'Add a conjunction, or split into two sentences.' },
      { wrong: 'Although I gave three weeks notice. I understand the policy requires four.', right: 'Although I gave three weeks notice, I understand the policy requires four.', why: 'One sentence, two clauses.' },
    ],
    level: 8,
    drills: [
      { prompt: 'Fix: “Since the gate is left open. The noise carries across the car park.”', answer: 'Since the gate is left open, the noise carries across the car park.', explanation: 'Comma, not a full stop.' },
      { prompt: 'Fix: “The credit does not help, I cannot attend a future course.”', answer: 'The credit does not help, because I cannot attend a future course.', alternatives: ['The credit does not help; I cannot attend a future course.'], explanation: 'Either subordinate the second clause or use a semicolon.' },
    ],
  },
  {
    slug: 'contrast-linking',
    title: 'One contrast marker per sentence',
    errorCode: 'grammar.clause.double_connector',
    explanation:
      'English marks contrast once. Using "although" and "but" in the same sentence doubles the signal, which reads as a loss of control even though the meaning survives.',
    contrasts: [
      { wrong: 'Although the cost is higher, but the warranty covers three years.', right: 'Although the cost is higher, the warranty covers three years.', why: 'One marker is enough.' },
      { wrong: 'Even though I support the extended hours, however I have one concern.', right: 'Even though I support the extended hours, I have one concern.', why: 'Same doubling.' },
      { wrong: 'Despite the delay, but we finished on time.', right: 'Despite the delay, we finished on time.', why: 'A preposition and a conjunction cannot both carry the contrast.' },
    ],
    level: 7,
    drills: [
      { prompt: 'Fix: “Although the ramp costs less, but the kitchen is more popular.”', answer: 'Although the ramp costs less, the kitchen is more popular.', explanation: 'Drop “but”.' },
      { prompt: 'Fix: “While I appreciate the offer, however it does not resolve the problem.”', answer: 'While I appreciate the offer, it does not resolve the problem.', explanation: 'Drop “however”.' },
    ],
  },
  {
    slug: 'comparatives',
    title: 'Comparatives marked once',
    errorCode: 'grammar.comparative.double',
    explanation:
      'A comparative is marked either with -er or with "more", never both. Short adjectives take -er; longer ones take "more"; a small set of irregulars must be memorised.',
    contrasts: [
      { wrong: 'This option is more cheaper.', right: 'This option is cheaper.', why: 'One marker only.' },
      { wrong: 'It is the most easiest route.', right: 'It is the easiest route.', why: 'Same rule for superlatives.' },
      { wrong: 'The service is more better than last year.', right: 'The service is better than last year.', why: '“Better” is already comparative.' },
      { wrong: 'This is more effective then the alternative.', right: 'This is more effective than the alternative.', why: '“Than” compares; “then” sequences.' },
    ],
    level: 6,
    drills: [
      { prompt: 'Fix: “Flexi 20 is more cheaper than pay-per-trip.”', answer: 'Flexi 20 is cheaper than pay-per-trip.', explanation: 'One comparative marker.' },
      { prompt: 'Fix: “The ramp is more important then the kitchen for accessibility.”', answer: 'The ramp is more important than the kitchen for accessibility.', explanation: '“Than”, not “then”.' },
    ],
  },
  {
    slug: 'register-control',
    title: 'Contractions and casual lexis in formal writing',
    errorCode: 'register.contraction',
    explanation:
      'A formal message expands contractions and avoids conversational vocabulary. This is not a grammar rule but a consistency rule, and it is one of the fastest corrections available: a single editing pass removes almost every instance.',
    contrasts: [
      { wrong: "I can't accept a credit, it doesn't solve the problem.", right: 'I cannot accept a credit, as it does not resolve the problem.', why: 'Expanded forms, and “resolve” rather than “solve” in this register.' },
      { wrong: 'Thanks a lot for sorting this out!', right: 'Thank you for arranging this.', why: 'No exclamation mark, no casual intensifier.' },
      { wrong: 'There were a lot of things that went wrong.', right: 'Several aspects of the work were unsatisfactory.', why: '“A lot of things” is vague as well as informal.' },
    ],
    level: 7,
    drills: [
      { prompt: 'Rewrite formally: “I don’t think that’s gonna work for us.”', answer: 'I do not believe that arrangement will work for us.', explanation: 'Expand contractions and replace casual forms.' },
      { prompt: 'Rewrite formally: “Thanks in advance for fixing it soon!”', answer: 'Thank you for attending to this promptly.', explanation: 'Avoid presuming compliance.' },
    ],
  },
];
