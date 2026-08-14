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

  /* ================================================================= */
  /* Set two — two further prompts per task type                        */
  /* ================================================================= */

  /* ---- Task 1: Giving Advice ---- */
  {
    slug: 'speak-t1-neighbour-tree',
    taskType: 'speaking.t1_advice',
    taskNumber: 1,
    title: 'Advice about a disputed tree',
    prompt:
      'A friend’s neighbour wants to remove a large tree that sits on the boundary between the two properties. Your friend likes the tree and thinks it is on their side. The neighbour has already booked a company. Your friend has asked what they should do.',
    context: { lines: ['The two households have got on well for six years.', 'Neither has checked the property survey.'] },
    prepSeconds: 30,
    speakSeconds: 90,
    level: 10,
    topic: 'community',
    successCriteria: [
      'Names the first practical step before giving an opinion about the tree',
      'Separates the factual question from the relationship question',
      'Warns against an action that would be hard to undo',
      'Ends with something the friend can do this week',
    ],
    modelNotes:
      'The mark of strong advice here is sequencing: what the survey says is knowable and decides most of the question, so it comes before any argument about the tree itself. Responses that lead with how upsetting it is, or with legal threats, are advising badly. The relationship point deserves one clear sentence — six good years is an asset, and treating a disagreement as a dispute is the move that spends it. Concrete and immediate beats comprehensive: "ask them to hold the booking for a week while you both look at the survey" is better advice than a list of options.',
  },
  {
    slug: 'speak-t1-colleague-credit',
    taskType: 'speaking.t1_advice',
    taskNumber: 1,
    title: 'Advice about unacknowledged work',
    prompt:
      'A colleague tells you that their manager presented their analysis in a meeting without naming them. It has happened twice. They are angry and are considering raising it with the manager’s director. They want your advice.',
    context: { lines: ['Your colleague is six months into the role.', 'The manager writes their performance review.'] },
    prepSeconds: 30,
    speakSeconds: 90,
    level: 11,
    topic: 'workplace',
    successCriteria: [
      'Takes the grievance seriously before advising caution',
      'Recommends a specific first conversation rather than escalation',
      'Names what evidence would matter',
      'Addresses the risk your colleague is not seeing',
    ],
    modelNotes:
      'Advice that opens with "be careful" without first acknowledging that the complaint is legitimate lands badly and reads as timid. The strong shape is: yes, that is a real problem; here is the step that costs least and often solves it; here is what to do if it does not. The unseen risk — going over a manager’s head six months in, before the relationship has any credit in it — has to be named plainly and once. Suggesting they start keeping a dated record is the kind of specific, low-cost action that distinguishes this band.',
  },

  /* ---- Task 2: Talking about a personal experience ---- */
  {
    slug: 'speak-t2-lost-document',
    taskType: 'speaking.t2_experience',
    taskNumber: 2,
    title: 'A time you lost something important',
    prompt:
      'Talk about a time you lost something that mattered — a document, a key, a piece of work. Say what happened, what you did about it, and how it turned out.',
    prepSeconds: 30,
    speakSeconds: 60,
    level: 9,
    topic: 'daily life',
    successCriteria: [
      'Establishes when and where in the first sentence',
      'Keeps one clear sequence of events rather than doubling back',
      'Includes what you were thinking or feeling at one specific moment',
      'Closes with the outcome rather than trailing off',
    ],
    modelNotes:
      'Sixty seconds is about four sentences of setup and four of consequence, and the commonest failure is spending fifty of them on background. Anchor time and place immediately, then move. One interior moment — the second you realised, what you checked first — does more for the band than three more facts, because it is the part that sounds like a person rather than a report. Past narrative also has to hold its tenses: a slip into the present is the single most frequent grammar loss on this task.',
  },
  {
    slug: 'speak-t2-changed-mind',
    taskType: 'speaking.t2_experience',
    taskNumber: 2,
    title: 'A time you changed your mind',
    prompt:
      'Talk about a time you changed your mind about something important. Explain what you thought before, what changed it, and what you think now.',
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'personal',
    successCriteria: [
      'States the earlier position clearly before describing the change',
      'Identifies a specific trigger rather than a gradual drift',
      'Contrasts the two positions explicitly',
      'Avoids turning the account into general opinion',
    ],
    modelNotes:
      'This prompt tempts speakers into an opinion piece. It is a narrative task: the question is what happened, not what is true. The structure that works is before / trigger / after, with the trigger being a single identifiable thing — someone said something, you saw a number, you had to do the job yourself. Contrastive language is what the analyser and the listener both hear: "at the time I assumed… what I had not considered was…". Vague endings ("so now I am more open-minded") cost more than they seem to; say what you now think, specifically.',
  },

  /* ---- Task 3: Describing a scene ---- */
  {
    slug: 'speak-t3-bus-stop',
    taskType: 'speaking.t3_scene',
    taskNumber: 3,
    title: 'Describe the scene: a bus stop in the rain',
    prompt:
      'Describe this scene to someone who cannot see it. Include enough detail that they could picture it clearly.',
    context: {
      scene:
        'A covered bus stop on a wide street during heavy rain. Under the shelter, three people stand close together: an older man holding a folded newspaper over a small dog, a teenager looking at a phone with headphones on, and a woman in a hospital uniform checking her watch. Rain runs off the edge of the shelter in a continuous sheet. Just outside, a bicycle is chained to a post and its seat is soaked. Across the street a shop awning has partly collapsed under the water, and a man is pushing it up with a broom handle. A bus is visible two blocks away, indicator flashing.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 9,
    topic: 'daily life',
    successCriteria: [
      'Moves through the scene in a consistent order',
      'Distinguishes the three people by what they are doing, not only by appearance',
      'Conveys the weather through its effects rather than by naming it repeatedly',
      'Locates things relative to each other with varied prepositions',
    ],
    modelNotes:
      'Description is scored on organisation as much as on vocabulary. Pick an order — under the shelter, then just outside, then across the street, then the distance — and hold it; a listener who is building a picture cannot cope with jumping. The rain is best carried by its consequences, which are already in the scene: the sheet of water off the shelter, the soaked seat, the collapsed awning. Naming everyone by clothing ("a man in a coat, a woman in a coat") is the flattening that keeps responses at CLB 7; what they are doing is what individuates them.',
  },
  {
    slug: 'speak-t3-kitchen-handover',
    taskType: 'speaking.t3_scene',
    taskNumber: 3,
    title: 'Describe the scene: a kitchen at shift change',
    prompt:
      'Describe this scene to someone who cannot see it. Include enough detail that they could picture it clearly.',
    context: {
      scene:
        'A commercial kitchen at the end of a shift. On the left, a cook in a white jacket is scraping a flat grill while talking over their shoulder. In the centre, a stainless steel counter holds four labelled containers, two of them still uncovered, and a clipboard with a page half filled in. To the right, a younger worker in street clothes is tying an apron and reading the clipboard at the same time. A tall rack of clean trays has been pushed against the back wall, blocking part of a door marked "Dry Store". One overhead light is out, leaving that corner darker than the rest. A wall clock reads five to three.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'workplace',
    successCriteria: [
      'Establishes the overall situation before the details',
      'Uses precise nouns rather than general ones',
      'Notes at least one thing that is incomplete or out of place',
      'Keeps a steady spatial progression',
    ],
    modelNotes:
      'An opening sentence that frames the whole scene — a kitchen changing over between shifts — gives the listener somewhere to put every detail that follows, and costs three seconds. Precision in nouns is where this task pays: rack, grill, clipboard, containers. The half-finished clipboard, the uncovered containers and the blocked door are the details a strong response notices, because they carry the story of the moment rather than just its contents. Resist interpreting too far; describing is the task, and speculation belongs to Task 8.',
  },

  /* ---- Task 4: Making predictions ---- */
  {
    slug: 'speak-t4-street-repair',
    taskType: 'speaking.t4_predictions',
    taskNumber: 4,
    title: 'Predict what happens next: a street dug up',
    prompt:
      'Look at the situation described and say what you think will happen next. Explain your reasoning.',
    context: {
      scene:
        'A residential street has been dug up across its full width. Metal plates cover the trench, and a temporary sign says the road will reopen on the 12th. It is now the 19th. Two workers are sitting in a parked van with the engine off. Residents have parked on the grass verge, and one has put up a hand-lettered sign asking people not to block a driveway. A city notice on a lamp post lists a phone number and a project name.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'community',
    successCriteria: [
      'Makes at least two distinct predictions rather than one elaborated guess',
      'Grounds each prediction in something visible in the situation',
      'Marks predictions as predictions with appropriate hedging',
      'Distinguishes what is likely from what is possible',
    ],
    modelNotes:
      'The task is reasoning, not fortune-telling, and the reasoning has to be traceable to the given detail: the overrun date, the idle van, the notice with a number, the improvised parking. Two predictions with visible grounds beat five plausible-sounding ones. Modality is what the analyser hears and what the band descriptors reward — "is likely to", "I would expect", "there is a chance that" — and flattening everything into "will" is the most common single loss here. Saying which of your predictions you are least sure of is a strong, rarely-used move.',
  },
  {
    slug: 'speak-t4-shop-closing',
    taskType: 'speaking.t4_predictions',
    taskNumber: 4,
    title: 'Predict what happens next: a shop with bare shelves',
    prompt:
      'Look at the situation described and say what you think will happen next. Explain your reasoning.',
    context: {
      scene:
        'A neighbourhood grocery has half-empty shelves and handwritten discount signs on most of the stock. The refrigerated section is switched off and empty. A notice on the door thanks customers for twenty-two years. Two people are looking in through the window, and one is taking a photograph of the notice. Next door, a vacant unit has a new "For Lease" sign. The parking area behind is being used by delivery vans for a different business.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'community',
    successCriteria: [
      'Predicts consequences for more than one party',
      'Uses evidence from the scene to justify each prediction',
      'Hedges appropriately rather than asserting',
      'Offers one less obvious prediction alongside the obvious one',
    ],
    modelNotes:
      'The obvious prediction — the shop closes — is already given by the notice, so a response that stops there has predicted nothing. The task opens up when you predict for the other parties: the customers who now travel further, the vacant unit next door, whoever takes the lease, the vans already using the lot. One non-obvious prediction with a stated reason is worth more than three obvious ones, and it is the difference between describing the picture and reasoning from it.',
  },

  /* ---- Task 5: Comparing and persuading ---- */
  {
    slug: 'speak-t5-course-format',
    taskType: 'speaking.t5_persuade',
    taskNumber: 5,
    title: 'Persuade: which course to take',
    prompt:
      'A friend can take one of two courses. Choose ONE and persuade them it is the better choice for them.',
    context: {
      options: [
        'An intensive four-week course, daytime, requires unpaid leave, finishes before the hiring season.',
        'A part-time course over six months, evenings, keeps their income, finishes after the hiring season.',
      ],
      lines: ['Your friend has enough savings for roughly two months without income.', 'They have said they are tired of "starting things and not finishing them".'],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 11,
    topic: 'education',
    successCriteria: [
      'Commits to one option in the opening sentence',
      'Uses the listener’s own stated concern as the main lever',
      'Concedes the strongest point on the other side without abandoning the case',
      'Closes with a direct call to act',
    ],
    modelNotes:
      'Both facts in the context point somewhere, and the persuasive move is to use the one the listener cares about rather than the one you would weigh most. The stated worry about not finishing things is the strongest lever available: a four-week course is over before motivation can lapse, or, argued the other way, six months of evenings is the exact habit they are saying they want to build. Persuasion is not the same as balanced comparison — an even-handed sixty seconds fails this task even when every sentence is well formed.',
  },
  {
    slug: 'speak-t5-office-space',
    taskType: 'speaking.t5_persuade',
    taskNumber: 5,
    title: 'Persuade: how to use a spare room',
    prompt:
      'Your household has one spare room and two proposals for it. Choose ONE and persuade the other person.',
    context: {
      options: [
        'A study for two people who both work from home two days a week.',
        'A rented room, bringing in about $700 a month from a lodger.',
      ],
      lines: ['The household is saving for a specific goal eighteen months away.', 'One person has said they find working at the kitchen table exhausting.'],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 10,
    topic: 'housing',
    successCriteria: [
      'States the choice immediately and does not revisit it',
      'Quantifies at least one part of the argument',
      'Addresses the cost the other person actually cares about',
      'Ends with a proposal rather than a summary',
    ],
    modelNotes:
      'A number used once is disproportionately persuasive — $700 over eighteen months is a figure the listener can check against the goal, and naming it forces the argument to be about something real. The counter-argument is not money but daily life, and a response that never mentions what it is like to share a home with a lodger has not engaged. Finishing with a proposal ("let us try it for three months and review") converts a speech into a decision, which is what persuasion is for.',
  },

  /* ---- Task 6: Dealing with a difficult situation ---- */
  {
    slug: 'speak-t6-wedding-clash',
    taskType: 'speaking.t6_difficult',
    taskNumber: 6,
    title: 'A difficult situation: two events on one day',
    prompt:
      'You accepted an invitation to a close friend’s wedding four months ago. Your employer has now scheduled the only interview round for an internal promotion on the same afternoon, and it cannot be moved. Decide what you will do and explain the choice.',
    context: {
      options: [
        'Tell your friend you cannot come, and attend the interview.',
        'Ask your employer to be assessed another way, and attend the wedding.',
      ],
      lines: ['You are one of four people being considered.', 'Your friend asked you to give a short reading at the ceremony.'],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 11,
    topic: 'personal',
    successCriteria: [
      'Commits to one course of action rather than describing the dilemma',
      'Says how the news will be delivered, not only what it is',
      'Acknowledges what is lost by the choice made',
      'Offers something that repairs the cost to the other party',
    ],
    modelNotes:
      'The dilemma is not the task; choosing is. A response that spends fifty seconds weighing an unresolvable conflict has not done what was asked. Because both options hurt someone, how the message is delivered carries most of the marks: telling a friend in person and early is a different act from sending a message the night before, and saying so is what demonstrates the judgement being assessed. Naming the loss honestly — a reading cannot be given by proxy — is stronger than minimising it, and the repair should be specific rather than warm.',
  },
  {
    slug: 'speak-t6-wrong-charge',
    taskType: 'speaking.t6_difficult',
    taskNumber: 6,
    title: 'A friend under-charged you and noticed later',
    prompt:
      'A friend who does contract work did a small job for you and charged you far less than the work was worth. They have since said, half-jokingly, that they "should have charged properly". You need to respond. Decide what you will say and explain your choice.',
    context: {
      options: [
        'Raise it directly, name a figure, and pay the difference now.',
        'Say nothing about this job and agree a proper rate before the next one.',
      ],
      lines: ['You would like to use them again and to recommend them.', 'They have never raised money directly with you before.'],
    },
    prepSeconds: 60,
    speakSeconds: 60,
    level: 11,
    topic: 'personal',
    successCriteria: [
      'Treats the half-joke as the real message it is',
      'Offers a concrete correction rather than sympathy',
      'Avoids making the friend justify the request',
      'Sets up how this will work next time',
    ],
    modelNotes:
      'The whole difficulty is that nothing has been asked for directly, and a response that answers only the surface — laughing along — fails the task while sounding pleasant. Reading the indirect signal aloud, kindly, is the high-level move: "I think you undercharged me, and I would rather fix it than have you regret the job." Offering a specific amount removes the burden of asking. Naming how the next job will be priced prevents the same silence recurring, and almost no response at CLB 8 gets that far.',
  },

  /* ---- Task 7: Expressing opinions ---- */
  {
    slug: 'speak-t7-paid-volunteering',
    taskType: 'speaking.t7_opinion',
    taskNumber: 7,
    title: 'Opinion: paying for volunteer time',
    prompt:
      'Some organisations have started giving volunteers a small payment for their time. Do you think volunteer work should be paid? Explain your position.',
    prepSeconds: 30,
    speakSeconds: 90,
    level: 11,
    topic: 'community',
    successCriteria: [
      'States a position in the first fifteen seconds',
      'Supports it with a reason that goes beyond restating the position',
      'Engages seriously with the opposing view',
      'Distinguishes between different kinds of volunteering',
    ],
    modelNotes:
      'The distinction is the whole opportunity: paying a stipend to someone who could not otherwise afford to volunteer is a different policy from paying people who already do it for free, and a response that separates those two is arguing at a level most do not reach. Ninety seconds is long enough that a thesis-and-three-reasons shape starts to sag; better is one argument developed properly with a real objection answered inside it. The opposing case has to be given its best form — that payment changes the motive — not a straw version.',
  },
  {
    slug: 'speak-t7-second-language',
    taskType: 'speaking.t7_opinion',
    taskNumber: 7,
    title: 'Opinion: learning a second language at school',
    prompt:
      'Some people argue that time spent teaching a second language in school would be better spent on other subjects, since translation tools are now widely available. What is your view?',
    prepSeconds: 30,
    speakSeconds: 90,
    level: 11,
    topic: 'education',
    successCriteria: [
      'Answers the actual question rather than a nearby one',
      'Uses at least one example that is specific rather than generic',
      'Concedes something real to the other side',
      'Ends with a restatement that has moved from where it began',
    ],
    modelNotes:
      'This prompt is a trap for anyone who has prepared a speech about the value of languages, because the claim on the table is narrower: that tools have made the classroom time inefficient. Answering the narrow claim is what scores. The strongest responses separate translation from language — what a tool does for you at a border versus what knowing a language does to how you think and who will talk to you — and they concede the efficiency point honestly before answering it. A closing line that repeats the opening word for word signals ninety seconds that went nowhere.',
  },

  /* ---- Task 8: Describing an unusual situation ---- */
  {
    slug: 'speak-t8-empty-office',
    taskType: 'speaking.t8_unusual',
    taskNumber: 8,
    title: 'An unusual situation: the office that is set up but empty',
    prompt:
      'Describe this unusual situation to someone who cannot see it, and say what you think is going on.',
    context: {
      scene:
        'A ground-floor office with the blinds up. Inside, about twenty desks are fully set up: monitors on, chairs pushed in, a jacket over one chair. A large screen on the wall shows a slide reading "Welcome — Day One". There are unopened water bottles at every place and a stack of lanyards by the door. The lights are on. The front door has a printed sign taped inside the glass, facing out, but it has curled so only the words "until further" are readable. A delivery of catering trays sits on the step, still wrapped.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 11,
    topic: 'workplace',
    successCriteria: [
      'Describes the scene before interpreting it',
      'Names precisely what makes the situation unusual',
      'Marks interpretation as interpretation',
      'Offers more than one possible explanation',
    ],
    modelNotes:
      'The unusual element is a mismatch, and naming it explicitly is what gives the listener the frame: everything is prepared for people who are not there, and the preparation is recent enough that the catering is still on the step. Description first, then interpretation, then hedged speculation — collapsing those into one stream is what makes weaker responses hard to follow. Two competing explanations, each tied to a specific detail, demonstrate exactly the control the top band is looking for; one confident explanation does not.',
  },
  {
    slug: 'speak-t8-single-lit-window',
    taskType: 'speaking.t8_unusual',
    taskNumber: 8,
    title: 'An unusual situation: one house on a dark street',
    prompt:
      'Describe this unusual situation to someone who cannot see it, and say what you think is going on.',
    context: {
      scene:
        'A residential street at night with no street lighting and no lit windows anywhere except one house in the middle. That house is brightly lit on both floors, with every curtain open. A portable generator sits on its driveway with a cable running to a downstairs window. Four or five people from neighbouring houses are standing on the pavement outside it, two of them holding kettles. A child is sitting on the front step of the lit house with a tablet. At the end of the street, a utility van is parked with its hazard lights on and no one inside it.',
    },
    prepSeconds: 30,
    speakSeconds: 60,
    level: 10,
    topic: 'community',
    successCriteria: [
      'Establishes the contrast that makes the scene unusual',
      'Reports the details that support the interpretation',
      'Uses hedged language for what is inferred',
      'Keeps description and speculation separate',
    ],
    modelNotes:
      'The generator and the kettles are the details that do the explanatory work, and a response that mentions them only in passing has buried its own evidence. Establishing the contrast first — one lit house on a completely dark street — sets up everything that follows. Hedging is assessed here: "presumably", "it looks as though", "that would explain" are the forms being listened for, and a speaker who states a guess as fact loses on exactly the criterion this task exists to test.',
  },
];
