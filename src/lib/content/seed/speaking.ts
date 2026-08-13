import type { SeedSpeakingTask } from './types';

/**
 * Speaking prompts — original scenarios, two per task type.
 *
 * `successCriteria` is the analytical backbone: each entry names a
 * communicative move a strong response performs. The analyser checks the
 * transcript for these moves, the UI shows them as a checklist after
 * recording, and the coaching is generated from the ones that are missing.
 * They are written as moves ("commits to one option in the first sentence"),
 * not as content ("mentions cost"), because the move is what transfers to a
 * prompt the learner has not seen.
 *
 * Timings follow the published shape of the test: 30 seconds preparation and
 * 90 seconds speaking for Tasks 1 and 7; 30 and 60 for Tasks 2, 3, 4 and 8;
 * 60 and 60 for Tasks 5 and 6.
 */
export const speakingTasks: SeedSpeakingTask[] = [
  /* ---- Task 1: Giving Advice ---- */
  {
    slug: 'speak-t1-cousin-car',
    taskType: 'speaking.t1_advice',
    taskNumber: 1,
    title: 'Advice about a first car',
    prompt:
      'Your cousin has saved enough to buy either a five-year-old car with low mileage and no warranty, or a new car with a longer loan and a full warranty. They have asked what you would do. Give them your advice.',
    context: { lines: ['Your cousin commutes 40 km a day.', 'They have never owned a car before.'] },
    prepSeconds: 30,
    speakSeconds: 90,
    level: 9,
    topic: 'personal finance',
    successCriteria: [
      'Commits to one recommendation in the first two sentences',
      'Gives at least two reasons that connect to the cousin’s specific situation',
      'Names a risk or drawback of the recommended option',
      'Ends with a concrete next step the cousin can take',
    ],
    modelNotes:
      'Advice tasks fail when they present both options evenly and never choose. Commit early — the remaining eighty seconds are for defending the choice, not for reaching it. The detail that lifts a response is using the given context: a 40 km daily commute makes reliability and warranty coverage matter more than the sticker price, and saying so shows you are advising this person rather than reciting general advice.',
  },
  {
    slug: 'speak-t1-friend-course',
    taskType: 'speaking.t1_advice',
    taskNumber: 1,
    title: 'Advice about leaving a course',
    prompt:
      'A friend is three months into a one-year professional programme and is finding it much harder than expected. They are considering withdrawing, which would mean losing the fees but keeping their evenings. They want your advice.',
    context: { lines: ['They currently work full time.', 'The programme is a requirement for the job they want.'] },
    prepSeconds: 30,
    speakSeconds: 90,
    level: 10,
    topic: 'education',
    successCriteria: [
      'States a clear recommendation rather than listing considerations',
      'Distinguishes between the difficulty of the course and the fit of the goal',
      'Offers an intermediate option rather than only continue-or-quit',
      'Acknowledges what the friend would give up',
    ],
    modelNotes:
      'The best responses refuse the binary the prompt sets up: deferring, reducing to part time, or continuing one more month with a specific test attached are all better advice than a flat yes or no. That refusal must be explicit and justified, not a way of avoiding a decision. Acknowledging the sunk fees without treating them as the reason to continue is a subtle move that reads as high-level reasoning.',
  },

  /* ---- Task 2: Personal Experience ---- */
  {
    slug: 'speak-t2-mistake-fixed',
    taskType: 'speaking.t2_experience',
    taskNumber: 2,
    title: 'A mistake you corrected',
    prompt:
      'Talk about a time you made a mistake at work, at school, or in your community, and what you did about it. Describe what happened and what you learned.',
    prepSeconds: 30,
    speakSeconds: 60,
    level: 9,
    topic: 'personal',
    successCriteria: [
      'Sets the situation in one sentence rather than three',
      'Narrates specific events in a clear time sequence',
      'States what was done about the mistake',
      'Ends with what changed afterwards',
    ],
    modelNotes:
      'The commonest failure is spending forty of the sixty seconds on background. One sentence of setting is enough. Past tenses must be controlled — narrative that slips into the present is the single most visible grammar issue in this task. Specificity is the differentiator: a named day, a real consequence, an actual conversation.',
  },
  {
    slug: 'speak-t2-helped-stranger',
    taskType: 'speaking.t2_experience',
    taskNumber: 2,
    title: 'A time someone helped you unexpectedly',
    prompt:
      'Describe a time when someone you did not know well helped you. Explain what happened and why it mattered to you.',
    prepSeconds: 30,
    speakSeconds: 60,
    level: 8,
    topic: 'personal',
    successCriteria: [
      'Establishes who the person was and the situation quickly',
      'Describes what they actually did',
      'Explains the effect on you at the time',
      'Explains why it still matters',
    ],
    modelNotes:
      'Two time frames are in play — then and now — and keeping them distinct is what the grammar of this task tests. "It mattered because I was new and had no one to ask" is stronger than "it was very kind", because it explains rather than evaluates.',
  },

  /* ---- Task 3: Describing a Scene ---- */
  {
    slug: 'speak-t3-market-morning',
    taskType: 'speaking.t3_scene',
    taskNumber: 3,
    title: 'Describe the scene: a market at opening time',
    prompt:
      'Describe this scene to someone who cannot see it. Include enough detail that they could picture it clearly.',
    context: {
      scene:
        'An outdoor market early in the morning. In the foreground, a vendor is lifting a crate of apples onto a wooden table that is already half arranged. To the left, a woman in a long coat is holding a paper cup and looking at a handwritten price sign. Behind them, two stalls are still covered with tarpaulins, and a delivery van has its rear doors open. The ground is wet, though it is not raining now. In the background, a row of low brick buildings, and a clock on one of them reading ten past seven.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 9,
    topic: 'daily life',
    successCriteria: [
      'Uses a consistent spatial order rather than jumping around the scene',
      'Describes people and what they are doing, not only objects',
      'Includes detail that establishes time and conditions',
      'Uses varied prepositional phrases to locate things',
    ],
    modelNotes:
      'Order is the whole skill here. Foreground to background, or left to right — pick one and hold it, because a listener who cannot see the image is building it from your sequence. Present continuous carries most of the description; the wet ground and the clock are the details that make the scene specific rather than generic.',
  },
  {
    slug: 'speak-t3-waiting-room',
    taskType: 'speaking.t3_scene',
    taskNumber: 3,
    title: 'Describe the scene: a busy waiting area',
    prompt: 'Describe this scene for someone who cannot see it.',
    context: {
      scene:
        'A community centre waiting area in the late afternoon. Rows of grey chairs face a reception desk where two staff members are working, one on the phone. A man with a folder is standing at the desk, half turned toward a screen showing a queue number. Along the right wall, a mother is kneeling to fasten a child\'s coat, with a stroller beside her. Three chairs are occupied by people looking at phones. A noticeboard by the door is crowded with overlapping flyers, and one has fallen to the floor.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 9,
    topic: 'daily life',
    successCriteria: [
      'Establishes the overall setting before the details',
      'Groups related elements rather than listing at random',
      'Describes actions in progress accurately',
      'Includes at least one small specific detail',
    ],
    modelNotes:
      'Start with the frame — what kind of place, what time — so the listener has somewhere to put the details. Group by area, not by object type. The fallen flyer is the kind of detail that shows a describer is observing rather than reciting a category list.',
  },

  /* ---- Task 4: Making Predictions ---- */
  {
    slug: 'speak-t4-market-next',
    taskType: 'speaking.t4_predictions',
    taskNumber: 4,
    title: 'Predict what happens next at the market',
    prompt:
      'Look at the same scene again. Predict what will happen in the next few minutes, and explain why you think so.',
    context: {
      scene:
        'The same outdoor market at ten past seven. The vendor is lifting a crate of apples; the woman in the coat is reading a price sign; two stalls are still covered; a delivery van stands with its doors open; the ground is wet.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'daily life',
    successCriteria: [
      'Makes several distinct predictions rather than one',
      'Grounds each prediction in something visible in the scene',
      'Uses a range of future and modal forms',
      'Distinguishes between what is likely and what is possible',
    ],
    modelNotes:
      'The grammar is the test: "will", "is going to", "is likely to", "may well", "I would expect" — using one form throughout caps the response. Every prediction must be anchored to visible evidence; ungrounded speculation is the most common weakness. Hedging distinctions ("the covered stalls will almost certainly open, though the van may leave first") demonstrate exactly the control CLB 11 requires.',
  },
  {
    slug: 'speak-t4-waiting-next',
    taskType: 'speaking.t4_predictions',
    taskNumber: 4,
    title: 'Predict what happens next in the waiting area',
    prompt: 'Predict what will happen next in this scene, and explain your reasoning.',
    context: {
      scene:
        'The same community centre waiting area. A man with a folder stands at the desk; a queue-number screen is visible; a mother is fastening a child\'s coat next to a stroller; two staff are at reception, one on the phone.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'daily life',
    successCriteria: [
      'Predicts outcomes for more than one person in the scene',
      'Links each prediction to a visible cue',
      'Varies the future forms used',
      'Includes one prediction about what will not happen',
    ],
    modelNotes:
      'Predicting what will not happen — "the man will not be called before the number on the screen changes" — is a move few learners make and it demonstrates control of negation in future forms. Cover two or three people rather than describing one at length.',
  },

  /* ---- Task 5: Comparing and Persuading ---- */
  {
    slug: 'speak-t5-family-trip',
    taskType: 'speaking.t5_persuade',
    taskNumber: 5,
    title: 'Persuade: which trip to book',
    prompt:
      'You are planning a weekend away with a family member. Choose ONE of the two options and persuade them that it is the better choice.',
    context: {
      options: [
        'A cabin two hours away: cheaper, quiet, no cell service, requires cooking every meal.',
        'A small city hotel four hours away: more expensive, walkable, restaurants nearby, arrives late on Friday.',
      ],
      lines: ['Your family member works long hours and says they want to "not think for two days".'],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 10,
    topic: 'travel',
    successCriteria: [
      'Chooses one option explicitly at the start',
      'Argues from the listener’s stated priority, not your own',
      'Acknowledges the strongest point for the other option',
      'Closes by asking for agreement or proposing the next step',
    ],
    modelNotes:
      'Persuasion is audience-shaped: the family member said they want to stop thinking, so an argument built on cost will land less well than one built on the absence of decisions to make. Conceding the other option\'s best feature and then outweighing it is more persuasive than pretending it has none. The sixty seconds of preparation are enough to decide the one thing you will lead with — use them for that rather than for drafting sentences.',
  },
  {
    slug: 'speak-t5-team-tool',
    taskType: 'speaking.t5_persuade',
    taskNumber: 5,
    title: 'Persuade: which system the team should adopt',
    prompt:
      'Your team must choose between two ways of tracking work. Choose ONE and persuade a colleague who prefers the other.',
    context: {
      options: [
        'A simple shared board: everyone can see everything, easy to learn, gets cluttered as work grows.',
        'A structured system: reporting and history, takes several weeks to learn, some people will resist it.',
      ],
      lines: ['Your colleague’s main concern is the time the team would lose while learning something new.'],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 11,
    topic: 'workplace',
    successCriteria: [
      'States the choice and the single strongest reason immediately',
      'Addresses the colleague’s specific objection directly',
      'Quantifies or bounds the cost being objected to',
      'Ends with a proposal that reduces the colleague’s risk',
    ],
    modelNotes:
      'The persuasive move at the top band is bounding the objection rather than dismissing it: "two weeks of slower work, and after that we stop rebuilding the same report every Friday" answers the concern in its own terms. Proposing a trial, a review date, or a fallback lowers the cost of agreeing — which is usually what actually changes a mind.',
  },

  /* ---- Task 6: Difficult Situation ---- */
  {
    slug: 'speak-t6-borrowed-tools',
    taskType: 'speaking.t6_difficult',
    taskNumber: 6,
    title: 'A difficult situation: the borrowed equipment',
    prompt:
      'You lent an expensive tool to a neighbour six weeks ago. It has been returned damaged, with no mention of the damage. Your neighbour has been helpful to you in the past and is about to ask to borrow something else. Choose who you will speak to and what you will say.',
    context: {
      options: [
        'Speak to the neighbour directly about the damage.',
        'Say nothing about the damage and decline the next request with a reason.',
      ],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 11,
    topic: 'community',
    successCriteria: [
      'States clearly which course of action is being taken',
      'Uses language suited to an ongoing relationship, not a one-off transaction',
      'Raises the difficult fact without accusation',
      'Proposes a resolution rather than only stating the problem',
    ],
    modelNotes:
      'This task is scored on register more than on content. The difficulty is naming the damage while protecting the relationship: describing what you found rather than what they did ("the guard was cracked when I unpacked it") avoids an accusation without avoiding the subject. Whichever path you choose, commit and justify it; drifting between the two options is the most common failure.',
  },
  {
    slug: 'speak-t6-shift-swap-broken',
    taskType: 'speaking.t6_difficult',
    taskNumber: 6,
    title: 'A difficult situation: the unreturned favour',
    prompt:
      'You covered a colleague’s shifts twice when they had a family emergency. You have now asked them to cover one shift for you and they said no without explanation. You need the shift covered and you still have to work with this person daily. Decide what you will do.',
    context: {
      options: [
        'Speak to the colleague again and explain why you are asking.',
        'Ask your supervisor to arrange coverage without naming the colleague.',
      ],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 11,
    topic: 'workplace',
    successCriteria: [
      'Chooses one course of action and commits to it',
      'Explains the reasoning behind the choice',
      'Uses language that preserves a working relationship',
      'Anticipates how the other person will receive it',
    ],
    modelNotes:
      'Strong responses separate the immediate problem (coverage) from the relational one (the unreturned favour) and say which they are solving. Anticipating the other person\'s perspective — they may have a reason they did not want to give — demonstrates the social reasoning the task is built to elicit.',
  },

  /* ---- Task 7: Expressing Opinions ---- */
  {
    slug: 'speak-t7-remote-services',
    taskType: 'speaking.t7_opinion',
    taskNumber: 7,
    title: 'Opinion: online-only public services',
    prompt:
      'Some public services are moving entirely online, closing in-person counters. Do you think this is a good development? Explain your opinion.',
    prepSeconds: 30,
    speakSeconds: 90,
    level: 11,
    topic: 'public affairs',
    successCriteria: [
      'States a clear position in the first sentence',
      'Develops at least two reasons with consequences, not just assertions',
      'Addresses the strongest argument against the position',
      'Closes with a restatement that is sharper than the opening',
    ],
    modelNotes:
      'Ninety seconds is enough for two developed reasons, not four listed ones. The differentiator is engaging the opposing case honestly: an argument that online services exclude people without reliable access is real, and answering it — with a condition, a safeguard, a limit — is stronger than ignoring it. The closing restatement should be a refinement, not a repetition.',
  },
  {
    slug: 'speak-t7-volunteering-requirement',
    taskType: 'speaking.t7_opinion',
    taskNumber: 7,
    title: 'Opinion: mandatory volunteering for students',
    prompt:
      'Some schools require students to complete volunteer hours before graduating. Do you agree with this requirement? Explain your view.',
    prepSeconds: 30,
    speakSeconds: 90,
    level: 11,
    topic: 'education',
    successCriteria: [
      'Takes a position and holds it throughout',
      'Gives reasons that go beyond the obvious first argument',
      'Includes at least one concrete example',
      'Concedes a genuine point on the other side',
    ],
    modelNotes:
      'This prompt attracts clichés about "giving back". Avoiding them is most of the work. Arguing from mechanism — what a requirement does to the motivation it is trying to build, or what students without transport or free hours can realistically complete — produces a response that sounds thought about rather than recited.',
  },

  /* ---- Task 8: Unusual Situation ---- */
  {
    slug: 'speak-t8-unfamiliar-object',
    taskType: 'speaking.t8_unusual',
    taskNumber: 8,
    title: 'Describe an unfamiliar object',
    prompt:
      'You found this object in a storage room at work and you are describing it over the phone to a colleague who has to identify it. Describe it precisely enough that they could recognise it.',
    context: {
      scene:
        'A metal frame about the height of a chair, with three adjustable legs ending in rubber feet. At the top, a flat circular plate roughly the size of a dinner plate, tilted at an angle and fixed by a knurled screw. A short arm extends from one side with a clamp on the end. The whole thing folds, and there is a faded label on one leg with a serial number and no manufacturer name.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'workplace',
    successCriteria: [
      'Gives an overall impression before the details',
      'Uses comparisons to familiar objects for size and shape',
      'Describes the parts in a systematic order',
      'Mentions what is unusual or unidentifiable about it',
    ],
    modelNotes:
      'Describing an unfamiliar object rewards two things: comparison ("about the height of a chair", "the size of a dinner plate") and systematic order (bottom to top, or largest part to smallest). Saying what you cannot determine — no manufacturer name, unclear purpose — is part of an accurate description, not an admission of failure.',
  },
  {
    slug: 'speak-t8-unusual-scene',
    taskType: 'speaking.t8_unusual',
    taskNumber: 8,
    title: 'Describe an unusual scene',
    prompt:
      'You are on the phone to a friend describing something unusual you have just come across in your neighbourhood. Describe it so they can picture it.',
    context: {
      scene:
        'A section of sidewalk has been fenced off with orange barriers. Inside the fenced area, instead of roadworks, there is a large circle of freshly laid soil about four metres across, with several dozen small saplings arranged in a spiral. A hand-painted wooden sign is propped against the fence, and a folding table nearby holds a clipboard and a stack of leaflets. Two people in ordinary clothes are talking to a passer-by. No machinery or official vehicles are present.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'community',
    successCriteria: [
      'Establishes the location and first impression quickly',
      'Explains what makes the scene unexpected',
      'Describes the elements in a logical order',
      'Speculates about the purpose while marking it as speculation',
    ],
    modelNotes:
      'What makes this "unusual" is the mismatch: construction barriers with no construction. Naming the mismatch early gives the listener the frame. Marking speculation as speculation — "it looks like", "I assume", "presumably" — is exactly the hedging control that separates the top bands from confident guessing.',
  },
];
