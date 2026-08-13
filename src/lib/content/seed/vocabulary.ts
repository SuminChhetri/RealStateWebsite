import type { SeedVocabulary } from './types';

/**
 * Vocabulary corpus.
 *
 * Selection principle: every entry is a word that *earns points* in a specific
 * task, not a word that sounds advanced. Rare vocabulary used imprecisely
 * lowers a response; mid-frequency vocabulary used exactly raises it. Each
 * entry therefore records where it pays off (`usefulFor`), the collocations
 * that make it sound native rather than retrieved, and — where one exists —
 * the error learners reliably make with it.
 */
const v = (
  headword: string,
  pos: string,
  definition: string,
  example: string,
  collocations: string[],
  level: number,
  usefulFor: string[],
  topic: string,
  register: SeedVocabulary['register'] = 'neutral',
  pitfall?: string,
): SeedVocabulary => ({
  headword,
  pos,
  definition,
  example,
  collocations,
  register,
  level,
  usefulFor,
  pitfall,
  topic,
});

export const vocabulary: SeedVocabulary[] = [
  /* ---- Making and qualifying claims ---- */
  v('assert', 'verb', 'to state something firmly as true, without proving it', 'The report asserts that the shortage is temporary, but offers no data.', ['assert that', 'assert a right', 'boldly assert'], 9, ['writing.survey', 'speaking.t7_opinion'], 'argument', 'formal', 'Assert carries a hint that the claim is unproven — do not use it for your own well-supported points.'),
  v('concede', 'verb', 'to admit that something is true, usually a point in favour of the other side', 'I concede that the flexible policy suits teams working asynchronously.', ['concede a point', 'readily concede', 'concede that'], 10, ['writing.survey', 'speaking.t5_persuade'], 'argument', 'formal'),
  v('outweigh', 'verb', 'to be more important than something else', 'The coordination benefit outweighs the loss of individual flexibility.', ['clearly outweigh', 'outweigh the drawbacks', 'far outweigh'], 9, ['writing.survey', 'speaking.t5_persuade'], 'argument'),
  v('hinge on', 'phrasal verb', 'to depend entirely on', 'The whole argument hinges on whether the training keeps pace with resignations.', ['hinge on whether', 'the decision hinges on'], 10, ['writing.survey', 'speaking.t7_opinion'], 'argument'),
  v('warrant', 'verb', 'to justify or deserve', 'A three-week delay warrants more than an apology.', ['warrant attention', 'warrant a response', 'hardly warrant'], 10, ['writing.email'], 'argument', 'formal'),
  v('substantiate', 'verb', 'to support a claim with evidence', 'The complaint is substantiated by two years of maintenance records.', ['substantiate a claim', 'fully substantiated'], 11, ['writing.email'], 'argument', 'academic'),
  v('tenuous', 'adjective', 'weak; not well supported', 'The link between the two policies is tenuous at best.', ['tenuous link', 'tenuous connection', 'tenuous grounds'], 11, ['writing.survey', 'speaking.t7_opinion'], 'argument', 'academic'),
  v('compelling', 'adjective', 'convincing enough to demand attention', 'The strongest argument for fixed days is a compelling one: an office day is only worth attending if others attend it.', ['compelling reason', 'compelling evidence', 'find it compelling'], 10, ['writing.survey', 'speaking.t7_opinion'], 'argument'),
  v('nuance', 'noun', 'a small but important difference in meaning', 'The distinction between “does not raise” and “lowers” is a nuance that changes the claim.', ['a subtle nuance', 'miss the nuance', 'nuance of meaning'], 11, ['reading.viewpoints'], 'argument', 'academic'),
  v('qualify', 'verb', 'to limit a statement so it is more accurate', 'I would qualify that: the policy works where output is loosely coupled to hours.', ['qualify a statement', 'heavily qualified'], 11, ['writing.survey', 'speaking.t7_opinion'], 'argument', 'formal', 'Different from “qualify for”, which means to meet requirements.'),

  /* ---- Requests, complaints, workplace correspondence ---- */
  v('outstanding', 'adjective', 'not yet completed or paid', 'The outstanding work amounts to roughly half the contract.', ['outstanding balance', 'outstanding work', 'remain outstanding'], 9, ['writing.email'], 'workplace', 'formal', 'In this sense it means unfinished, not excellent — context decides.'),
  v('rectify', 'verb', 'to correct something that is wrong', 'I would like to know how you intend to rectify the situation.', ['rectify the situation', 'rectify an error'], 10, ['writing.email'], 'workplace', 'formal'),
  v('reiterate', 'verb', 'to say again for emphasis', 'To reiterate: the work must be complete by the twentieth.', ['reiterate a request', 'let me reiterate'], 10, ['writing.email'], 'workplace', 'formal'),
  v('accommodate', 'verb', 'to make room for someone’s needs', 'I appreciate that accommodating this request at short notice is not straightforward.', ['accommodate a request', 'happy to accommodate'], 9, ['writing.email', 'speaking.t6_difficult'], 'workplace', 'formal'),
  v('at short notice', 'phrase', 'with little warning', 'I recognise that I am asking at short notice.', ['ask at short notice', 'available at short notice'], 8, ['writing.email'], 'workplace'),
  v('in the interim', 'phrase', 'in the time between now and then', 'In the interim, I have arranged temporary storage.', ['in the interim', 'interim arrangement'], 10, ['writing.email'], 'workplace', 'formal'),
  v('discretion', 'noun', 'the freedom to decide something yourself', 'Approval is at the manager’s discretion.', ['at your discretion', 'use discretion', 'leave it to their discretion'], 10, ['writing.email'], 'workplace', 'formal'),
  v('contingency', 'noun', 'a plan for something that might go wrong', 'My contingency is to move the items into a rented locker.', ['contingency plan', 'build in a contingency'], 10, ['writing.email', 'speaking.t1_advice'], 'workplace', 'formal'),
  v('escalate', 'verb', 'to refer a problem to a higher level, or to become more serious', 'I would rather resolve this directly than escalate it.', ['escalate an issue', 'escalate quickly', 'escalate to management'], 9, ['writing.email', 'speaking.t6_difficult'], 'workplace'),
  v('prompt', 'adjective', 'quick, without delay', 'I would appreciate a prompt reply.', ['prompt response', 'prompt payment', 'prompt action'], 8, ['writing.email'], 'workplace', 'formal'),

  /* ---- Cause, effect and change ---- */
  v('attributable', 'adjective', 'caused by; able to be credited to', 'The delay is attributable to the permit office rather than the contractor.', ['directly attributable to', 'largely attributable'], 11, ['writing.survey'], 'analysis', 'academic'),
  v('knock-on effect', 'noun', 'an indirect result that follows from something else', 'Reducing frequency has a knock-on effect on how people plan their week.', ['a knock-on effect', 'knock-on consequences'], 9, ['writing.survey', 'speaking.t4_predictions'], 'analysis'),
  v('offset', 'verb', 'to balance out a negative with a positive', 'The learning time is offset by not rebuilding the same report each week.', ['offset the cost', 'partly offset', 'offset by'], 10, ['writing.survey', 'speaking.t5_persuade'], 'analysis'),
  v('erode', 'verb', 'to weaken gradually', 'Inconsistent enforcement erodes the policy faster than open opposition.', ['erode confidence', 'gradually erode', 'erode support'], 11, ['writing.survey'], 'analysis', 'academic'),
  v('exacerbate', 'verb', 'to make a bad situation worse', 'Cutting service exacerbates the very shortage it responds to.', ['exacerbate the problem', 'further exacerbate'], 11, ['writing.survey'], 'analysis', 'academic', 'Only for negative things — you cannot exacerbate a benefit.'),
  v('mitigate', 'verb', 'to reduce the seriousness of something', 'A trial period mitigates the risk of committing to the wrong system.', ['mitigate the risk', 'mitigate the impact'], 10, ['writing.survey', 'speaking.t5_persuade'], 'analysis', 'formal', 'Mitigate reduces harm; “militate against” means to work against — different words.'),
  v('threshold', 'noun', 'the point at which something starts to happen', 'Eight-minute frequency is the threshold at which people stop consulting a timetable.', ['cross a threshold', 'threshold for', 'below the threshold'], 10, ['writing.survey', 'reading.information'], 'analysis', 'academic'),
  v('marginal', 'adjective', 'small; only slightly significant', 'The increase in losses was marginal and absorbed by the system.', ['marginal increase', 'marginal difference', 'only marginal'], 10, ['reading.viewpoints'], 'analysis', 'academic'),
  v('disproportionate', 'adjective', 'too large or too small compared to something else', 'A blanket penalty has a disproportionate effect on those least able to absorb it.', ['disproportionate impact', 'disproportionate share'], 11, ['writing.survey'], 'analysis', 'academic'),
  v('unintended consequence', 'noun', 'a result that was not planned or expected', 'The unintended consequence was that some borrowers stopped coming at all.', ['unintended consequence', 'unintended effect'], 10, ['writing.survey', 'reading.viewpoints'], 'analysis'),

  /* ---- Community, services and civic life ---- */
  v('accessible', 'adjective', 'able to be reached or used, including by disabled people', 'The ramp makes the hall accessible to members who stopped attending.', ['accessible to', 'wheelchair accessible', 'make it accessible'], 8, ['writing.survey', 'speaking.t7_opinion'], 'community'),
  v('provision', 'noun', 'the supply of a service, or an arrangement in an agreement', 'Transit provision in the three neighbourhoods is currently non-existent.', ['service provision', 'make provision for', 'under the provisions of'], 10, ['writing.survey'], 'community', 'formal'),
  v('uptake', 'noun', 'the rate at which people start using something', 'Uptake was slow for a month and then rose steadily.', ['strong uptake', 'slow uptake', 'uptake rate'], 10, ['writing.survey', 'reading.information'], 'community', 'formal'),
  v('outreach', 'noun', 'work to bring a service to people who would not otherwise use it', 'Without outreach, the extended hours serve the people already comfortable in the building.', ['community outreach', 'outreach programme'], 10, ['writing.survey'], 'community'),
  v('stakeholder', 'noun', 'a person or group affected by a decision', 'The consultation reached residents but not the shift workers who use the lot at night.', ['key stakeholder', 'consult stakeholders'], 9, ['writing.survey'], 'community', 'formal'),
  v('feasible', 'adjective', 'possible to do in practice', 'A March completion is not feasible once the permit timeline is included.', ['technically feasible', 'not feasible', 'feasible option'], 9, ['writing.survey', 'speaking.t5_persuade'], 'community', 'formal'),
  v('deliverable', 'adjective', 'able to be completed as promised', 'The kitchen is the most wanted option but the least deliverable by the deadline.', ['deliverable by', 'realistically deliverable'], 10, ['speaking.t5_persuade'], 'community', 'formal'),
  v('duplication', 'noun', 'doing the same thing twice unnecessarily', 'Replying to the thread prevents duplication of coverage.', ['avoid duplication', 'unnecessary duplication'], 9, ['writing.email'], 'community', 'formal'),

  /* ---- Work and study ---- */
  v('remit', 'noun', 'the area of responsibility someone has', 'Signing off on the schedule is within Nadia’s remit while I am away.', ['within someone’s remit', 'outside the remit of'], 11, ['writing.email'], 'workplace', 'formal'),
  v('onboarding', 'noun', 'the process of bringing a new person into an organisation', 'A week of shadowing during onboarding prevents months of small errors.', ['onboarding process', 'during onboarding'], 9, ['writing.survey'], 'workplace'),
  v('workload', 'noun', 'the amount of work a person has', 'The change adds no workload once the first fortnight is past.', ['manage a workload', 'heavy workload', 'even out the workload'], 8, ['writing.email', 'speaking.t5_persuade'], 'workplace'),
  v('cohort', 'noun', 'a group who go through something at the same time', 'The programme takes one cohort of forty a year.', ['a cohort of', 'the first cohort'], 10, ['reading.information'], 'education', 'academic'),
  v('placement', 'noun', 'a period of supervised practical work as part of training', 'The bridging programme combines coursework with a placement.', ['secure a placement', 'clinical placement', 'work placement'], 9, ['reading.information'], 'education'),
  v('credential', 'noun', 'a qualification that proves training or ability', 'A credential earned abroad is assessed, not automatically recognised.', ['professional credential', 'credential recognition', 'hold a credential'], 9, ['reading.information'], 'education', 'formal'),
  v('lateral', 'adjective', 'sideways; at the same level rather than upward', 'A lateral move into an adjacent role can supply the local experience regulators want.', ['lateral move', 'lateral entry', 'think laterally'], 10, ['reading.information'], 'employment', 'formal'),
  v('backlog', 'noun', 'work that has accumulated and not been done', 'A returning learner should not be met with a backlog of four hundred reviews.', ['clear a backlog', 'growing backlog'], 9, ['writing.email'], 'workplace'),

  /* ---- Describing scenes and objects ---- */
  v('adjacent', 'adjective', 'next to; beside', 'A folding table stands adjacent to the fenced area.', ['adjacent to', 'immediately adjacent'], 9, ['speaking.t3_scene', 'speaking.t8_unusual'], 'description', 'formal'),
  v('propped', 'adjective', 'leaning against something for support', 'A hand-painted sign is propped against the fence.', ['propped against', 'propped up'], 9, ['speaking.t3_scene'], 'description'),
  v('tapered', 'adjective', 'becoming gradually narrower', 'The legs are tapered and end in rubber feet.', ['tapered end', 'gently tapered'], 10, ['speaking.t8_unusual'], 'description'),
  v('roughly', 'adverb', 'approximately', 'The plate is roughly the size of a dinner plate.', ['roughly the size of', 'roughly equivalent'], 7, ['speaking.t3_scene', 'speaking.t8_unusual'], 'description'),
  v('cluttered', 'adjective', 'covered with too many things in disorder', 'The noticeboard is cluttered with overlapping flyers.', ['cluttered with', 'visually cluttered'], 8, ['speaking.t3_scene'], 'description'),
  v('in the foreground', 'phrase', 'in the part of the scene nearest the viewer', 'In the foreground, a vendor is lifting a crate onto a table.', ['in the foreground', 'against the background'], 8, ['speaking.t3_scene'], 'description'),
  v('mismatch', 'noun', 'a combination of things that do not fit together', 'The mismatch is the point: construction barriers with no construction.', ['a mismatch between', 'obvious mismatch'], 10, ['speaking.t8_unusual'], 'description'),
  v('makeshift', 'adjective', 'made quickly from whatever was available', 'A makeshift table holds a clipboard and a stack of leaflets.', ['makeshift arrangement', 'makeshift shelter'], 10, ['speaking.t8_unusual'], 'description'),

  /* ---- Predicting and hedging ---- */
  v('presumably', 'adverb', 'probably, based on what seems reasonable', 'The covered stalls will presumably open once the delivery is unloaded.', ['presumably because', 'presumably the reason'], 9, ['speaking.t4_predictions', 'speaking.t8_unusual'], 'prediction', 'formal'),
  v('in all likelihood', 'phrase', 'very probably', 'In all likelihood the van will leave before the market fills.', ['in all likelihood'], 10, ['speaking.t4_predictions'], 'prediction', 'formal'),
  v('conceivably', 'adverb', 'possibly, though not likely', 'Conceivably the rain could return, though the ground is already drying.', ['conceivably could', 'not inconceivable'], 11, ['speaking.t4_predictions'], 'prediction', 'academic'),
  v('imminent', 'adjective', 'about to happen very soon', 'The opening looks imminent: the tarpaulins are already loosened.', ['imminent arrival', 'appears imminent'], 10, ['speaking.t4_predictions'], 'prediction', 'formal'),
  v('barring', 'preposition', 'unless something happens to prevent it', 'Barring another delay, the work will finish on the twentieth.', ['barring delays', 'barring the unexpected'], 11, ['speaking.t4_predictions', 'writing.email'], 'prediction', 'formal'),

  /* ---- Personal experience and reflection ---- */
  v('in hindsight', 'phrase', 'looking back with knowledge you did not have at the time', 'In hindsight, I should have checked the plate before submitting the renewal.', ['in hindsight', 'with hindsight'], 9, ['speaking.t2_experience'], 'personal'),
  v('unprompted', 'adjective', 'without being asked', 'She offered to help unprompted, which is why it stayed with me.', ['unprompted offer', 'entirely unprompted'], 10, ['speaking.t2_experience'], 'personal'),
  v('turning point', 'noun', 'the moment at which a situation changes direction', 'The turning point was realising nobody else was going to raise it.', ['a turning point', 'marked a turning point'], 9, ['speaking.t2_experience'], 'personal'),
  v('gloss over', 'phrasal verb', 'to avoid dealing with something difficult', 'I glossed over the error in my first report and had to correct it publicly later.', ['gloss over a problem', 'gloss over the details'], 10, ['speaking.t2_experience'], 'personal'),
  v('own up to', 'phrasal verb', 'to admit responsibility', 'Owning up to it early cost less than the delay would have.', ['own up to a mistake'], 8, ['speaking.t2_experience'], 'personal', 'informal'),

  /* ---- Advice and persuasion ---- */
  v('bear in mind', 'phrase', 'to remember when deciding', 'Bear in mind that the warranty covers the first three years of a commute like yours.', ['bear in mind that', 'worth bearing in mind'], 8, ['speaking.t1_advice'], 'advice'),
  v('in your position', 'phrase', 'if I were the person you are', 'In your position I would take the warranty and the higher payment.', ['in your position', 'if I were in your shoes'], 8, ['speaking.t1_advice'], 'advice'),
  v('the deciding factor', 'phrase', 'the consideration that settles the choice', 'For a forty-kilometre commute, reliability is the deciding factor.', ['the deciding factor', 'proved decisive'], 9, ['speaking.t1_advice', 'speaking.t5_persuade'], 'advice'),
  v('on balance', 'phrase', 'after considering everything', 'On balance the fixed policy costs less than the coordination it replaces.', ['on balance', 'on balance I would'], 9, ['writing.survey', 'speaking.t7_opinion'], 'advice', 'formal'),
  v('a false economy', 'phrase', 'a saving that costs more later', 'Buying without a warranty on that mileage is a false economy.', ['a false economy'], 10, ['speaking.t1_advice'], 'advice'),
  v('defer', 'verb', 'to delay until later', 'Deferring for a term is a real option, not a way of avoiding the decision.', ['defer a decision', 'defer payment', 'defer to someone'], 10, ['speaking.t1_advice'], 'advice', 'formal', '“Defer to someone” means to accept their authority — a different meaning.'),

  /* ---- Difficult situations and register ---- */
  v('raise something with', 'phrase', 'to bring a subject up with a person', 'I would rather raise it with him directly than go around him.', ['raise it with', 'raise a concern'], 9, ['speaking.t6_difficult'], 'interpersonal'),
  v('put someone on the spot', 'phrase', 'to force someone to answer immediately', 'I did not want to put her on the spot in front of the team.', ['put on the spot'], 9, ['speaking.t6_difficult'], 'interpersonal', 'informal'),
  v('clear the air', 'phrase', 'to resolve tension by talking openly', 'A short conversation would clear the air before it becomes a pattern.', ['clear the air'], 9, ['speaking.t6_difficult'], 'interpersonal', 'informal'),
  v('give someone the benefit of the doubt', 'phrase', 'to assume a good reason exists even without proof', 'I would give her the benefit of the doubt; she may have had a reason she did not want to share.', ['give the benefit of the doubt'], 9, ['speaking.t6_difficult'], 'interpersonal'),
  v('without accusing', 'phrase', 'describing a problem without blaming a person', 'Describing what I found, without accusing him of anything, kept it manageable.', ['without accusing anyone'], 10, ['speaking.t6_difficult'], 'interpersonal'),
  v('overstep', 'verb', 'to go beyond what is acceptable', 'Asking a second time is persistent; asking his supervisor first would overstep.', ['overstep the mark', 'overstep boundaries'], 10, ['speaking.t6_difficult'], 'interpersonal'),

  /* ---- Precision replacements for overused words ---- */
  v('substantial', 'adjective', 'large in amount or importance', 'A substantial share of the increase came from the two lowest-income branches.', ['substantial increase', 'substantial evidence'], 9, ['writing.survey'], 'precision', 'formal', 'Prefer this to “very big” in formal writing.'),
  v('considerable', 'adjective', 'notably large', 'The permit stage introduces considerable uncertainty.', ['considerable time', 'considerable expense'], 9, ['writing.email', 'writing.survey'], 'precision', 'formal'),
  v('negligible', 'adjective', 'so small it can be ignored', 'The rise in losses was negligible against the increase in borrowing.', ['negligible effect', 'negligible cost'], 10, ['writing.survey'], 'precision', 'academic'),
  v('persistent', 'adjective', 'continuing over time despite efforts to stop it', 'The problem is persistent rather than occasional, which is why I am writing.', ['persistent problem', 'persistent delays'], 9, ['writing.email'], 'precision'),
  v('intermittent', 'adjective', 'happening at irregular intervals', 'The fault is intermittent, which has made it easy to dismiss.', ['intermittent fault', 'intermittent service'], 10, ['writing.email'], 'precision', 'formal'),
  v('inadequate', 'adjective', 'not good enough for what is needed', 'A credit toward a future course is an inadequate remedy for a course I cannot now take.', ['inadequate response', 'wholly inadequate'], 9, ['writing.email'], 'precision', 'formal'),
  v('unworkable', 'adjective', 'impossible to put into practice', 'A four-week notice requirement is unworkable for shift changes of this kind.', ['unworkable in practice', 'prove unworkable'], 10, ['writing.email', 'writing.survey'], 'precision', 'formal'),
  v('straightforward', 'adjective', 'simple and easy to understand or do', 'The fix is straightforward: close the gate after the last session.', ['relatively straightforward', 'straightforward process'], 8, ['writing.email'], 'precision'),
  v('counterproductive', 'adjective', 'having the opposite effect to the one intended', 'A blanket fine is counterproductive if it deters the people least likely to cause the problem.', ['prove counterproductive'], 10, ['writing.survey'], 'precision', 'formal'),
  v('indispensable', 'adjective', 'absolutely necessary', 'Local experience is indispensable, which is precisely why the bottleneck matters.', ['indispensable to', 'considered indispensable'], 11, ['writing.survey'], 'precision', 'academic'),
];
