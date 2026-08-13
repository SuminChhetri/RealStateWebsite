import type { SeedStimulus } from './types';

/**
 * Reading corpus — original passages and items.
 *
 * Topics are drawn from Canadian everyday, community and workplace life
 * because that is the register the test lives in, and because a learner
 * preparing for immigration benefits from vocabulary they will actually use.
 * Difficulty is controlled by four levers, not by making sentences longer:
 * abstraction of the idea, distance between question and evidence, subtlety of
 * the distractors, and how far the option wording departs from the text.
 */
export const readingStimuli: SeedStimulus[] = [
  /* ================================================================ */
  /* Correspondence                                                    */
  /* ================================================================ */
  {
    slug: 'read-corr-basement-flood',
    skill: 'reading',
    partType: 'reading.correspondence',
    title: 'A message about a flooded storage room',
    level: 8,
    topic: 'housing',
    body: `Hi Priya,

I wanted to put this in writing so we both have a record of it.

When I came back from Winnipeg on Sunday, the storage room in the basement had about two centimetres of standing water in it. The floor drain looks blocked rather than backed up — the water was clear, and there was no smell. Most of what I keep down there is in plastic bins, so the damage is limited, but the two boxes of my mother's photographs were on the bottom shelf and those are gone. I am not asking you to cover those; I should have moved them years ago.

What I would like is for the drain to be cleared before the spring melt. Rashid in 3B told me the same thing happened to him in April, and that the plumber who came out said the line needs to be snaked properly rather than plunged. I don't know whether that ever happened.

I know you have been dealing with the roof tender all month, so I am not expecting this tomorrow. But if it isn't done by the end of March I would rather move my things out than lose anything else, and I would need to know that in advance so I can arrange a locker.

Let me know either way.

Yannick`,
    questions: [
      {
        slug: 'read-corr-flood-q1',
        microSkill: 'reading.inference',
        prompt: 'Why does Yannick mention that the water was clear and had no smell?',
        options: [
          { key: 'A', text: 'To show that the problem is drainage rather than sewage', rationale: 'Correct: clear, odourless water rules out a sewage backup, which points to a blocked drain — the diagnosis he then acts on.' },
          { key: 'B', text: 'To explain why the damage to his belongings was limited', rationale: 'The limited damage is attributed to the plastic bins, not to the water quality.' },
          { key: 'C', text: 'To suggest that the flooding came from outside the building', rationale: 'He never raises an external source; he points at the floor drain inside.' },
          { key: 'D', text: 'To argue that the building manager should have inspected sooner', rationale: 'Plausible given the tone, but he explicitly avoids blaming her for the timing.' },
        ],
        answerKey: 'A',
        explanation:
          'The detail is diagnostic. Clear, odourless water excludes a sewage backup, which leaves a blocked drain — and the next sentence ("The floor drain looks blocked rather than backed up") confirms that this is the conclusion the detail supports. When a writer includes a physical observation in a complaint, ask what possibility it eliminates.',
        takeaway: 'Descriptive detail in correspondence is usually evidence for a claim. Find the claim it serves.',
        level: 9,
        difficulty: 8.6,
      },
      {
        slug: 'read-corr-flood-q2',
        microSkill: 'reading.literal_detail',
        prompt: 'What does Yannick say about the photographs?',
        options: [
          { key: 'A', text: 'He wants them replaced or compensated', rationale: 'The opposite: he explicitly says he is not asking for that.' },
          { key: 'B', text: 'He accepts responsibility for their loss', rationale: 'Correct: "I am not asking you to cover those; I should have moved them years ago."' },
          { key: 'C', text: 'He believes they can still be dried out', rationale: 'He says they are gone.' },
          { key: 'D', text: 'He had already moved them to a higher shelf', rationale: 'They were on the bottom shelf, which is why they were lost.' },
        ],
        answerKey: 'B',
        explanation:
          'This is stated directly, but the sentence carries a semicolon that reverses the expected direction: after describing a loss, most writers ask for compensation. Read to the end of the sentence before choosing.',
        level: 7,
        difficulty: 6.8,
      },
      {
        slug: 'read-corr-flood-q3',
        microSkill: 'reading.paraphrase',
        prompt: 'What does Yannick report about Rashid in 3B?',
        options: [
          { key: 'A', text: 'Rashid also lost belongings and is writing a similar message', rationale: 'Nothing suggests Rashid is writing anything.' },
          { key: 'B', text: 'Rashid experienced the same flooding and was told the pipe needed proper clearing', rationale: 'Correct paraphrase of "the same thing happened to him in April" and "the line needs to be snaked properly rather than plunged".' },
          { key: 'C', text: 'Rashid arranged for a plumber who cleared the drain last April', rationale: 'A plumber attended and gave advice; whether the work was done is precisely what Yannick says he does not know.' },
          { key: 'D', text: 'Rashid recommended moving belongings out of the basement', rationale: 'That is Yannick\'s own contingency, not Rashid\'s advice.' },
        ],
        answerKey: 'B',
        explanation:
          'Option C is the trap: it converts a plumber\'s recommendation into completed work. The passage ends that paragraph with "I don\'t know whether that ever happened", which exists precisely to block that reading.',
        takeaway: 'When a passage says the writer does not know something, no option may assume it happened.',
        level: 9,
        difficulty: 9.0,
      },
      {
        slug: 'read-corr-flood-q4',
        microSkill: 'reading.writer_purpose',
        prompt: 'What is the function of the sentence "I know you have been dealing with the roof tender all month"?',
        options: [
          { key: 'A', text: 'It softens the request by acknowledging competing demands', rationale: 'Correct: a concession that makes the deadline that follows sound reasonable rather than aggressive.' },
          { key: 'B', text: 'It explains why the drain became blocked', rationale: 'The roof tender has no causal link to the drain in the text.' },
          { key: 'C', text: 'It criticises the manager for prioritising the roof', rationale: 'The register is conciliatory; the clause reduces pressure rather than adding it.' },
          { key: 'D', text: 'It sets a deadline for the repair', rationale: 'The deadline arrives in the next sentence; this one prepares the ground for it.' },
        ],
        answerKey: 'A',
        explanation:
          'The move is concession-before-demand: acknowledge the reader\'s constraints, then state the requirement. Recognising this pattern matters twice over — you need to spot it in reading, and you need to use it in Writing Task 1.',
        takeaway: 'Concession before a demand is a politeness strategy, not a change of position.',
        level: 10,
        difficulty: 9.8,
      },
      {
        slug: 'read-corr-flood-q5',
        microSkill: 'reading.inference',
        prompt: 'What will Yannick do if the drain is not cleared by the end of March?',
        options: [
          { key: 'A', text: 'He will withhold rent until the repair is completed', rationale: 'A common real-world response, but rent is never mentioned in the message.' },
          { key: 'B', text: 'He will hire a plumber himself and send the invoice', rationale: 'A common real-world response, but not his stated plan.' },
          { key: 'C', text: 'He will move his belongings into rented storage', rationale: 'Correct: "I would rather move my things out… so I can arrange a locker."' },
          { key: 'D', text: 'He will ask Rashid to raise the issue jointly', rationale: 'Rashid supplies corroboration only.' },
        ],
        answerKey: 'C',
        explanation:
          'The consequence is stated across two clauses: move his things out, and arrange a locker. Distractors A and B are what many tenants would do — which is exactly why they are tempting. The text, not your experience, decides.',
        level: 8,
        difficulty: 7.4,
      },
      {
        slug: 'read-corr-flood-q6',
        microSkill: 'reading.tone_attitude',
        prompt: 'How would you describe Yannick’s tone in this message?',
        options: [
          { key: 'A', text: 'Firm but accommodating', rationale: 'Correct: he sets a clear deadline and consequence while conceding her workload and absorbing his own loss.' },
          { key: 'B', text: 'Apologetic and hesitant', rationale: 'He apologises for nothing and states a deadline plainly.' },
          { key: 'C', text: 'Frustrated and accusatory', rationale: 'He deliberately removes blame ("I should have moved them years ago").' },
          { key: 'D', text: 'Detached and purely procedural', rationale: 'The photographs and the personal contingency plan carry real stake.' },
        ],
        answerKey: 'A',
        explanation:
          'Tone is the sum of the moves: a written record, a self-blaming concession, an acknowledgement of her workload, a hard deadline, and an "either way" ending. Add the moves before naming the tone.',
        level: 10,
        difficulty: 9.5,
      },
      {
        slug: 'read-corr-flood-q7',
        microSkill: 'reading.gap_completion',
        format: 'blank_choice',
        prompt: 'Priya replies. Choose the option that best completes her reply:\n\n"Thanks for putting it in writing, Yannick — that helps. I have booked the drain contractor for the 14th, so ________. If anything changes I will tell you the same week rather than leaving you to find out."',
        options: [
          { key: 'A', text: 'you should arrange the locker now to be safe', rationale: 'Contradicts the booking she has just confirmed; it would undercut her own reassurance.' },
          { key: 'B', text: 'the work will be finished well before your deadline', rationale: 'Correct: the 14th precedes the end of March, and the clause connects her action to his stated condition.' },
          { key: 'C', text: 'the roof tender will have to wait until April', rationale: 'Introduces a trade-off the message never sets up.' },
          { key: 'D', text: 'I would suggest moving the remaining bins upstairs', rationale: 'Plausible advice, but it does not follow from "so", which requires a consequence of the booking.' },
        ],
        answerKey: 'B',
        explanation:
          '"So" requires a consequence of the preceding clause. Only B is caused by the booking. Completion items are decided by the connector: read the word before the gap and ask what logical relationship it demands.',
        takeaway: 'In gap items, the connector before the blank constrains the answer more than the topic does.',
        level: 9,
        difficulty: 8.8,
      },
      {
        slug: 'read-corr-flood-q8',
        microSkill: 'reading.cohesion',
        prompt: 'In "I don’t know whether that ever happened", what does "that" refer to?',
        options: [
          { key: 'A', text: 'The flooding in Rashid’s unit last April', rationale: 'That is reported as fact, so there would be nothing to doubt.' },
          { key: 'B', text: 'The plumber’s visit to the building', rationale: 'The visit is reported as having occurred — "the plumber who came out".' },
          { key: 'C', text: 'Snaking the line properly rather than plunging it', rationale: 'Correct: the recommended work is the only element left unresolved.' },
          { key: 'D', text: 'Rashid reporting the problem to the manager', rationale: 'Never mentioned as an action.' },
        ],
        answerKey: 'C',
        explanation:
          'Reference chains resolve backwards to the nearest element that is still open. The flood happened, the plumber came, the advice was given — the only thing not asserted is whether the recommended work was carried out.',
        level: 9,
        difficulty: 8.9,
      },
    ],
  },

  {
    slug: 'read-corr-shift-swap',
    skill: 'reading',
    partType: 'reading.correspondence',
    title: 'A workplace message about shift coverage',
    level: 9,
    topic: 'workplace',
    body: `Subject: Coverage for the 22nd–26th

Team,

Two things, and the second one matters more than it looks.

First: I need coverage for the evening shift from the 22nd to the 26th while I am at the regional training. Devika has offered the 22nd and 23rd. That leaves three evenings. If you can take one, reply to this thread rather than messaging me directly — I want everyone to see what is still open, so we don't end up with two people covering the same night and nobody covering the 26th.

Second: whoever takes the 26th will be on when the new intake system goes live. I have asked for the switch to be moved, and it will not be. Nothing about the work changes, but the screens do, and the first evening on a new system is slower than the training suggests. If you have not used it, take the practice module before you agree to that shift, not after. I would rather someone confident said no to the 26th than someone eager said yes and spent four hours apologising to families in the waiting room.

I will be reachable, but not quickly. Nadia has the authority to sign off on anything I would have signed off on, and she does not need to check with me first.

Thanks,
Colm`,
    questions: [
      {
        slug: 'read-corr-shift-q1',
        microSkill: 'reading.writer_purpose',
        prompt: 'Why does Colm ask people to reply to the thread instead of messaging him privately?',
        options: [
          { key: 'A', text: 'To keep a written record for the payroll department', rationale: 'Payroll is never mentioned.' },
          { key: 'B', text: 'So the team can see which evenings remain unclaimed', rationale: 'Correct — he states the visibility reason and the failure it prevents.' },
          { key: 'C', text: 'Because he will not be reading direct messages while away', rationale: 'He says he is reachable, though slowly; and the request applies before he leaves.' },
          { key: 'D', text: 'To encourage volunteers by showing who has already offered', rationale: 'A real side effect, but the stated purpose is avoiding double-coverage and gaps.' },
        ],
        answerKey: 'B',
        explanation:
          'The purpose is given explicitly after the dash. Option D is the kind of answer that feels sophisticated but adds a motive the text does not claim. Prefer the stated reason over the clever one.',
        level: 8,
        difficulty: 7.6,
      },
      {
        slug: 'read-corr-shift-q2',
        microSkill: 'reading.inference',
        prompt: 'What does Colm imply about the training for the new intake system?',
        options: [
          { key: 'A', text: 'It has been cancelled because of the go-live date', rationale: 'The go-live was not moved; the training is referenced as existing.' },
          { key: 'B', text: 'It understates how slow the first shift will be', rationale: 'Correct: "the first evening on a new system is slower than the training suggests."' },
          { key: 'C', text: 'It is only available to staff who take the 26th', rationale: 'He recommends the practice module to anyone considering that shift.' },
          { key: 'D', text: 'It covers the screens but not the underlying work', rationale: 'He says the work does not change — that is reassurance, not a criticism of the training.' },
        ],
        answerKey: 'B',
        explanation:
          '"Slower than the training suggests" is a comparison that judges the training. Comparative constructions frequently carry the writer\'s evaluation; do not read past them.',
        takeaway: 'A comparison ("slower than…", "less useful than…") often hides the writer’s real opinion.',
        level: 10,
        difficulty: 9.6,
      },
      {
        slug: 'read-corr-shift-q3',
        microSkill: 'reading.inference',
        prompt: 'What does Colm prefer regarding the 26th?',
        options: [
          { key: 'A', text: 'That the most experienced person takes it regardless of willingness', rationale: 'He does not assign it; he asks for informed self-selection.' },
          { key: 'B', text: 'That someone declines it rather than accepting it unprepared', rationale: 'Correct: he would rather a confident person said no than an eager person said yes unprepared.' },
          { key: 'C', text: 'That two people share it to reduce the risk', rationale: 'Sharing is what he is trying to avoid.' },
          { key: 'D', text: 'That it is left uncovered until the system is stable', rationale: 'Leaving the 26th uncovered is named as the failure to prevent.' },
        ],
        answerKey: 'B',
        explanation:
          'The sentence is built on a preference frame: "I would rather X than Y." Locate X and Y precisely — many learners invert them under time pressure.',
        level: 9,
        difficulty: 8.4,
      },
      {
        slug: 'read-corr-shift-q4',
        microSkill: 'reading.literal_detail',
        prompt: 'How many evenings still need coverage when this message is sent?',
        options: [
          { key: 'A', text: 'Two', rationale: 'Two are covered, not two remaining.' },
          { key: 'B', text: 'Three', rationale: 'Correct: five evenings (22nd–26th) minus Devika\'s two.' },
          { key: 'C', text: 'Four', rationale: 'Would be right if Devika had taken only one.' },
          { key: 'D', text: 'Five', rationale: 'The total range, before Devika\'s offer.' },
        ],
        answerKey: 'B',
        explanation:
          'The text does the arithmetic for you — "That leaves three evenings" — but only if you read past the list. Numeric detail is often confirmed a sentence later; check before calculating.',
        level: 6,
        difficulty: 6.0,
        targetSeconds: 35,
      },
      {
        slug: 'read-corr-shift-q5',
        microSkill: 'reading.inference',
        prompt: 'What does the paragraph about Nadia tell the reader?',
        options: [
          { key: 'A', text: 'Decisions can proceed in Colm’s absence without waiting for him', rationale: 'Correct: she holds equivalent authority and need not consult him.' },
          { key: 'B', text: 'Nadia will be covering one of the open evenings', rationale: 'Her shifts are never discussed.' },
          { key: 'C', text: 'Colm expects to be unreachable for the whole period', rationale: 'He says he is reachable, just not quickly.' },
          { key: 'D', text: 'Nadia is being promoted while Colm is away', rationale: 'Delegated authority for a period is not a promotion.' },
        ],
        answerKey: 'A',
        explanation:
          'The operative clause is "she does not need to check with me first" — it pre-empts the delay that delegated authority usually creates. Ask what problem a sentence prevents.',
        level: 9,
        difficulty: 8.2,
      },
      {
        slug: 'read-corr-shift-q6',
        microSkill: 'reading.tone_attitude',
        prompt: 'What is Colm’s attitude toward the go-live date?',
        options: [
          { key: 'A', text: 'He supports it and wants the team to embrace it', rationale: 'He describes it neutrally and warns about its effects.' },
          { key: 'B', text: 'He opposed it, failed to change it, and is now managing the consequences', rationale: 'Correct: "I have asked for the switch to be moved, and it will not be."' },
          { key: 'C', text: 'He is indifferent because the work itself is unchanged', rationale: 'He explicitly plans around the disruption, which is not indifference.' },
          { key: 'D', text: 'He believes the date will still be postponed', rationale: '"It will not be" closes that possibility.' },
        ],
        answerKey: 'B',
        explanation:
          'Two facts sit in one short sentence: he objected, and he lost. Everything after it is mitigation. Short flat sentences after a request often carry the writer\'s real position.',
        level: 10,
        difficulty: 9.4,
      },
      {
        slug: 'read-corr-shift-q7',
        microSkill: 'reading.gap_completion',
        format: 'blank_choice',
        prompt: 'A colleague replies:\n\n"I can take the 24th. I have not used the new system, so ________, and I would rather not learn it in front of a full waiting room."',
        options: [
          { key: 'A', text: 'I will do the practice module this week', rationale: 'Reasonable, but the second clause is about avoiding the 26th, so the first should explain declining it.' },
          { key: 'B', text: 'I am deliberately not offering for the 26th', rationale: 'Correct: it explains the choice of the 24th and connects to the reason that follows.' },
          { key: 'C', text: 'I may need to swap out of the 24th later', rationale: 'Introduces uncertainty about a shift they have just claimed.' },
          { key: 'D', text: 'someone else should take the 24th instead', rationale: 'Contradicts the opening sentence.' },
        ],
        answerKey: 'B',
        explanation:
          'The blank sits between "so" (a consequence of not knowing the system) and a reason about the waiting room. Only B is consistent with both sides. In completion items, check the clause after the blank as well as the one before it.',
        level: 9,
        difficulty: 9.1,
      },
      {
        slug: 'read-corr-shift-q8',
        microSkill: 'reading.main_idea',
        prompt: 'What is the main purpose of this message?',
        options: [
          { key: 'A', text: 'To announce a new intake system and explain how it works', rationale: 'The system is context for one shift, not the subject.' },
          { key: 'B', text: 'To arrange shift coverage while flagging a risk attached to one shift', rationale: 'Correct: both stated purposes, in the order the writer gives them.' },
          { key: 'C', text: 'To delegate authority to Nadia during an absence', rationale: 'A closing detail, not the reason for writing.' },
          { key: 'D', text: 'To discourage staff from volunteering for the 26th', rationale: 'He wants an informed volunteer, not none.' },
        ],
        answerKey: 'B',
        explanation:
          'Main-idea options fail in two ways: too narrow (C) or a distortion of one part (D). The correct option covers the whole message without adding to it.',
        level: 8,
        difficulty: 7.8,
      },
    ],
  },

  /* ================================================================ */
  /* Diagram                                                           */
  /* ================================================================ */
  {
    slug: 'read-diag-recycling-depot',
    skill: 'reading',
    partType: 'reading.diagram',
    title: 'Depot drop-off schedule',
    level: 8,
    topic: 'community',
    figure: {
      kind: 'schedule',
      caption: 'Riverbend Depot — accepted materials by day',
      columns: ['Day', 'Household recycling', 'Electronics', 'Paint & solvents', 'Yard waste', 'Hours'],
      rows: [
        ['Monday', 'Yes', 'No', 'No', 'Yes', '07:00–15:00'],
        ['Tuesday', 'Yes', 'Yes', 'No', 'Yes', '07:00–19:00'],
        ['Wednesday', 'Yes', 'No', 'Yes', 'No', '10:00–19:00'],
        ['Thursday', 'Yes', 'Yes', 'No', 'Yes', '07:00–19:00'],
        ['Friday', 'Yes', 'No', 'Yes', 'Yes', '07:00–15:00'],
        ['Saturday', 'Yes', 'Yes', 'Yes', 'Yes', '08:00–16:00'],
        ['Sunday', 'Closed', 'Closed', 'Closed', 'Closed', '—'],
      ],
      note: 'Loads over 250 kg require a commercial account. Electronics are accepted at the north gate only; all other materials use the south gate.',
    },
    body: `Hi Tomas,

Before you borrow the van on the weekend, read the depot table — I got this wrong last month and had to make two trips.

We have the old television, the two cans of deck stain that have been in the garage since the summer, and roughly six bags of branches from the hedge. Saturday takes everything, but the queue after eleven is long enough that we would lose most of the afternoon. My preference is a weekday evening.

One more thing: the television has to go through the north gate, so whichever day we choose, plan for that to be a separate stop from the rest of the load. Last time I queued at the south gate for forty minutes with it in the back and was turned away.

Val`,
    questions: [
      {
        slug: 'read-diag-depot-q1',
        microSkill: 'reading.information_matching',
        prompt: 'Which single weekday evening allows Val and Tomas to drop off everything they have?',
        options: [
          { key: 'A', text: 'Tuesday', rationale: 'Tuesday is open until 19:00 and takes electronics and yard waste, but not paint or solvents.' },
          { key: 'B', text: 'Wednesday', rationale: 'Wednesday takes paint until 19:00 but accepts neither electronics nor yard waste.' },
          { key: 'C', text: 'No weekday evening accepts all three materials', rationale: 'Correct: the only day accepting electronics, paint and yard waste together is Saturday, which is not an evening.' },
          { key: 'D', text: 'Friday', rationale: 'Friday takes paint and yard waste, but closes at 15:00 and does not accept electronics.' },
        ],
        answerKey: 'C',
        explanation:
          'The load has three material types: electronics (television), solvents (deck stain), yard waste (branches). Cross-reference all three against each day, then apply the evening constraint. When no option satisfies every condition, "none" is a legitimate answer — verify it rather than forcing a fit.',
        takeaway: 'With multi-condition table items, test every condition against every row before choosing.',
        level: 10,
        difficulty: 9.7,
        targetSeconds: 90,
      },
      {
        slug: 'read-diag-depot-q2',
        microSkill: 'reading.literal_detail',
        prompt: 'On which days does the depot open at 07:00?',
        options: [
          { key: 'A', text: 'Monday, Tuesday, Thursday and Friday', rationale: 'Correct — read directly from the Hours column.' },
          { key: 'B', text: 'Every day except Sunday', rationale: 'Wednesday opens at 10:00 and Saturday at 08:00.' },
          { key: 'C', text: 'Monday to Friday', rationale: 'Wednesday opens at 10:00, so the weekdays are not uniform.' },
          { key: 'D', text: 'Tuesday, Thursday and Saturday', rationale: 'These are the electronics days, not the early-opening days.' },
        ],
        answerKey: 'A',
        explanation:
          'Option D is a column confusion: it lists the days electronics are accepted. Under time pressure, confirm which column you are reading before you answer.',
        level: 7,
        difficulty: 6.4,
        targetSeconds: 40,
      },
      {
        slug: 'read-diag-depot-q3',
        microSkill: 'reading.inference',
        prompt: 'What does Val’s experience last month suggest about the gate rule?',
        options: [
          { key: 'A', text: 'The rule is enforced, and queueing at the wrong gate wastes the trip', rationale: 'Correct: she queued forty minutes at the south gate and was turned away.' },
          { key: 'B', text: 'The rule applies only on Saturdays', rationale: 'The note states it without a day condition.' },
          { key: 'C', text: 'Staff will redirect vehicles between gates on request', rationale: 'She was turned away, not redirected.' },
          { key: 'D', text: 'Electronics can be accepted at the south gate outside peak hours', rationale: 'No such exception exists in the note.' },
        ],
        answerKey: 'A',
        explanation:
          'A personal anecdote in a practical message usually exists to show that a rule has consequences. Read the anecdote as evidence about the rule.',
        level: 8,
        difficulty: 7.7,
      },
      {
        slug: 'read-diag-depot-q4',
        microSkill: 'reading.information_matching',
        prompt: 'If they decide to make two separate trips, which pair of days would let them drop off everything with the shortest total wait, given Val’s constraints?',
        options: [
          { key: 'A', text: 'Wednesday for the stain, Thursday for the television and branches', rationale: 'Correct: Wednesday evening covers paint; Thursday evening covers electronics and yard waste. Both avoid Saturday queues and both are open until 19:00.' },
          { key: 'B', text: 'Saturday for everything, arriving before eleven', rationale: 'One trip, but Val states a preference for a weekday evening, and the question asks about two trips.' },
          { key: 'C', text: 'Monday for the branches, Friday for the stain and television', rationale: 'Friday accepts no electronics and closes at 15:00.' },
          { key: 'D', text: 'Tuesday for the television, Friday for the stain and branches', rationale: 'Workable for materials but Friday closes at 15:00, which conflicts with an evening drop-off.' },
        ],
        answerKey: 'A',
        explanation:
          'Two-trip planning items reward eliminating on the hard constraint first — here, evening hours. That removes Monday and Friday immediately and leaves a small set to check on materials.',
        level: 10,
        difficulty: 10.1,
        targetSeconds: 95,
      },
      {
        slug: 'read-diag-depot-q5',
        microSkill: 'reading.scanning_speed',
        prompt: 'Which materials are accepted on Monday?',
        options: [
          { key: 'A', text: 'Household recycling and yard waste only', rationale: 'Correct: the Monday row shows Yes for recycling and yard waste, No for the rest.' },
          { key: 'B', text: 'Household recycling only', rationale: 'Yard waste is also accepted.' },
          { key: 'C', text: 'Household recycling, yard waste and electronics', rationale: 'Electronics are Tuesday, Thursday and Saturday.' },
          { key: 'D', text: 'All materials except paint and solvents', rationale: 'Electronics are also excluded on Monday.' },
        ],
        answerKey: 'A',
        explanation:
          'Row scanning is the fastest skill to build and the easiest to lose under pressure. Read across one row, ignore the rest of the table.',
        level: 6,
        difficulty: 5.8,
        targetSeconds: 30,
      },
      {
        slug: 'read-diag-depot-q6',
        microSkill: 'reading.inference',
        prompt: 'Why does Val mention the 250 kg limit indirectly by writing about the van?',
        options: [
          { key: 'A', text: 'She is unsure whether their load qualifies as commercial', rationale: 'Tempting, but she never raises weight as a concern; the message is about days and gates.' },
          { key: 'B', text: 'She does not mention it — the limit appears only in the depot note', rationale: 'Correct: the constraint is in the figure, not in her message, and nothing in the message engages with it.' },
          { key: 'C', text: 'She is warning that the van may exceed the limit', rationale: 'No weight estimate appears in her message.' },
          { key: 'D', text: 'She wants Tomas to open a commercial account', rationale: 'The commercial account is a condition in the depot note, never something Val proposes.' },
        ],
        answerKey: 'B',
        explanation:
          'Some items test whether you can tell the two sources apart. Information in the figure is not automatically claimed by the writer of the message. Track where each fact comes from.',
        takeaway: 'In diagram sets, keep the figure and the message as separate sources of truth.',
        level: 10,
        difficulty: 9.9,
      },
      {
        slug: 'read-diag-depot-q7',
        microSkill: 'reading.literal_detail',
        prompt: 'What is the shortest opening day at the depot?',
        options: [
          { key: 'A', text: 'Saturday, at eight hours', rationale: '08:00–16:00 is eight hours, but Monday and Friday are eight hours too, so Saturday is not shortest on its own.' },
          { key: 'B', text: 'Wednesday, at nine hours', rationale: '10:00–19:00 is nine hours, longer than eight.' },
          { key: 'C', text: 'Monday, at eight hours', rationale: '07:00–15:00 is eight hours, which ties with Friday and Saturday rather than being shortest alone.' },
          { key: 'D', text: 'Three days tie at eight hours: Monday, Friday and Saturday', rationale: 'Correct: all three run exactly eight hours, so no single day is shortest.' },
        ],
        answerKey: 'D',
        explanation:
          'Monday and Friday run 07:00–15:00 and Saturday 08:00–16:00: all eight hours. When several options describe the same underlying fact, the most complete one is usually the key.',
        level: 9,
        difficulty: 8.7,
        targetSeconds: 70,
      },
      {
        slug: 'read-diag-depot-q8',
        microSkill: 'reading.inference',
        prompt: 'What is Val’s main reason for avoiding Saturday?',
        options: [
          { key: 'A', text: 'The depot closes earlier on Saturday than on weekdays', rationale: 'It closes at 16:00, earlier than some evenings — but she gives a different reason.' },
          { key: 'B', text: 'The queue after eleven would consume the afternoon', rationale: 'Correct, and stated directly.' },
          { key: 'C', text: 'Electronics are not accepted at weekends', rationale: 'They are accepted on Saturday.' },
          { key: 'D', text: 'The van is unavailable at weekends', rationale: 'The van is being borrowed for the weekend.' },
        ],
        answerKey: 'B',
        explanation:
          'Option A is true of the table but is not the reason she gives. An option can be factually consistent and still be the wrong answer to "why".',
        level: 8,
        difficulty: 7.5,
      },
    ],
  },

  {
    slug: 'read-diag-transit-fares',
    skill: 'reading',
    partType: 'reading.diagram',
    title: 'Comparing transit passes',
    level: 10,
    topic: 'transport',
    figure: {
      kind: 'table',
      caption: 'Monthly fare options — Harbourline Transit',
      columns: ['Option', 'Monthly cost', 'Included trips', 'Extra trip cost', 'Transfers', 'Off-peak discount'],
      rows: [
        ['Pay-per-trip', '$0', 'None', '$3.40', '90 minutes free', 'No'],
        ['Flexi 20', '$58', '20', '$2.85', '90 minutes free', 'Yes (15%)'],
        ['Flexi 40', '$104', '40', '$2.45', '90 minutes free', 'Yes (15%)'],
        ['Unlimited', '$142', 'Unlimited', '—', '90 minutes free', 'Not applicable'],
      ],
      note: 'A trip is a single boarding. Transfers within 90 minutes do not count as a new trip. The off-peak discount applies to extra trips only, between 10:00–15:00 and after 19:00.',
    },
    body: `Nabila,

I have finally sat down with the fare table, because the pass I bought in September was the wrong one and I want to get this right for the new term.

My teaching days are Tuesday, Wednesday and Thursday: out in the morning, back in the evening. That is six boardings a week, plus the Saturday market run, which is two more. I stay late on Wednesdays and come home after seven.

What I keep getting wrong is the transfer rule. The Wednesday return needs a change at Harbour Junction, and I had been counting that as two trips all autumn.

If the numbers say Unlimited, I will take it for the peace of mind, but I suspect they won't.

Farid`,
    questions: [
      {
        slug: 'read-diag-fares-q1',
        microSkill: 'reading.inference',
        prompt: 'How many trips, as the table defines them, does Farid make in a typical week?',
        options: [
          { key: 'A', text: 'Six', rationale: 'Omits the Saturday market run.' },
          { key: 'B', text: 'Eight', rationale: 'Correct: six teaching boardings plus two on Saturday. The Wednesday change is a transfer within 90 minutes, so it does not add a trip.' },
          { key: 'C', text: 'Nine', rationale: 'Counts the Wednesday transfer as an extra trip — the error Farid says he has been making.' },
          { key: 'D', text: 'Ten', rationale: 'Double-counts the return journeys.' },
        ],
        answerKey: 'B',
        explanation:
          'The passage tells you the misconception, and the note tells you the rule. Items in this part frequently test whether you can apply a definition from the figure to a scenario in the text.',
        takeaway: 'When a figure defines a term, apply the definition literally — the passage often models the wrong way to count.',
        level: 10,
        difficulty: 10.0,
        targetSeconds: 90,
      },
      {
        slug: 'read-diag-fares-q2',
        microSkill: 'reading.information_matching',
        prompt: 'Over a four-week month, which option is cheapest for Farid?',
        options: [
          { key: 'A', text: 'Pay-per-trip, at about $109', rationale: '32 trips × $3.40 = $108.80 — the most expensive option except Unlimited.' },
          { key: 'B', text: 'Flexi 20, at about $92', rationale: 'Correct: $58 covers 20 trips; the remaining 12 cost $2.85 each ($34.20), for $92.20 in total.' },
          { key: 'C', text: 'Flexi 40, at $104', rationale: 'Covers all 32 trips but costs more than Flexi 20 with extras.' },
          { key: 'D', text: 'Unlimited, at $142', rationale: 'The most expensive by a wide margin — and the option Farid suspects will lose.' },
        ],
        answerKey: 'B',
        explanation:
          'Eight trips a week over four weeks is 32. Flexi 20 costs $58 + (12 × $2.85) = $92.20; Flexi 40 costs $104; pay-per-trip costs $108.80. Flexi 20 wins. Note that the off-peak discount would reduce Flexi 20 further, since some extra trips fall after 19:00.',
        level: 11,
        difficulty: 10.6,
        targetSeconds: 110,
      },
      {
        slug: 'read-diag-fares-q3',
        microSkill: 'reading.literal_detail',
        prompt: 'When does the off-peak discount apply?',
        options: [
          { key: 'A', text: 'To all trips between 10:00 and 15:00 and after 19:00', rationale: 'Close, but the discount applies only to extra trips, not to all trips.' },
          { key: 'B', text: 'To extra trips taken between 10:00 and 15:00 and after 19:00', rationale: 'Correct, per the note.' },
          { key: 'C', text: 'To all Flexi and Unlimited holders at any time', rationale: 'Unlimited is marked "not applicable".' },
          { key: 'D', text: 'To transfers made within 90 minutes', rationale: 'Transfers are free regardless; the discount concerns extra trips.' },
        ],
        answerKey: 'B',
        explanation:
          'The difference between A and B is one qualifying word in the note. Read notes attached to tables in full — they exist to create exactly this distinction.',
        level: 9,
        difficulty: 8.5,
      },
      {
        slug: 'read-diag-fares-q4',
        microSkill: 'reading.inference',
        prompt: 'What does Farid mean by "I will take it for the peace of mind"?',
        options: [
          { key: 'A', text: 'He would pay more for the certainty of never calculating fares again', rationale: 'Correct: the phrase concedes he might accept a worse price for predictability.' },
          { key: 'B', text: 'He believes Unlimited will turn out to be cheapest', rationale: 'The next clause says he suspects it will not be.' },
          { key: 'C', text: 'He wants Nabila to make the decision for him', rationale: 'He is doing the analysis himself.' },
          { key: 'D', text: 'He is worried about fare increases later in the term', rationale: 'Price changes are never mentioned.' },
        ],
        answerKey: 'A',
        explanation:
          'The conditional "if the numbers say Unlimited" plus "peace of mind" signals a willingness to trade money for simplicity. Conditional clauses often expose what a writer values.',
        level: 10,
        difficulty: 9.5,
      },
      {
        slug: 'read-diag-fares-q5',
        microSkill: 'reading.scanning_speed',
        prompt: 'What does an extra trip cost on Flexi 40?',
        options: [
          { key: 'A', text: '$2.45', rationale: 'Correct: read across the Flexi 40 row to the extra-trip column.' },
          { key: 'B', text: '$2.85', rationale: 'That is the Flexi 20 rate.' },
          { key: 'C', text: '$3.40', rationale: 'That is the pay-per-trip rate.' },
          { key: 'D', text: 'There is no extra-trip charge', rationale: 'Only Unlimited has no extra-trip charge.' },
        ],
        answerKey: 'A',
        explanation:
          'Locate the row first, the column second. Reversing that order is the usual cause of adjacent-cell errors under time pressure.',
        level: 6,
        difficulty: 5.6,
        targetSeconds: 25,
      },
      {
        slug: 'read-diag-fares-q6',
        microSkill: 'reading.inference',
        prompt: 'What was Farid’s mistake in September?',
        options: [
          { key: 'A', text: 'He bought a pass that did not match his travel pattern', rationale: 'Correct: "the pass I bought in September was the wrong one".' },
          { key: 'B', text: 'He forgot to buy a pass at all', rationale: 'He says he bought one.' },
          { key: 'C', text: 'He bought Unlimited when Flexi 20 would have done', rationale: 'The specific pass is never named.' },
          { key: 'D', text: 'He missed the off-peak discount window', rationale: 'The discount is discussed as a rule, not as a past mistake.' },
        ],
        answerKey: 'A',
        explanation:
          'Option C over-specifies: it is a reasonable guess but the passage never names the pass. Prefer the option that stays exactly as specific as the text.',
        level: 8,
        difficulty: 7.9,
      },
      {
        slug: 'read-diag-fares-q7',
        microSkill: 'reading.information_matching',
        prompt: 'If Farid stopped the Saturday market run, which option would become cheapest?',
        options: [
          { key: 'A', text: 'Pay-per-trip, at $81.60', rationale: '24 trips × $3.40 = $81.60, which is more than Flexi 20 with four extra trips.' },
          { key: 'B', text: 'Flexi 20, at $69.40', rationale: 'Correct: 24 trips means 4 extra trips at $2.85 above the 20 included, giving $69.40 — still the cheapest.' },
          { key: 'C', text: 'Flexi 40, at $104', rationale: 'Unchanged and still more expensive.' },
          { key: 'D', text: 'Unlimited, at $142', rationale: 'Never competitive at this volume.' },
        ],
        answerKey: 'B',
        explanation:
          'Six trips a week over four weeks is 24. Flexi 20 covers 20 and charges $2.85 for four more: $69.40, below pay-per-trip at $81.60. Recomputing after a scenario change is a common Part 2 move — do the arithmetic rather than assuming the previous answer holds.',
        level: 11,
        difficulty: 10.4,
        targetSeconds: 100,
      },
      {
        slug: 'read-diag-fares-q8',
        microSkill: 'reading.main_idea',
        prompt: 'What is Farid’s purpose in writing?',
        options: [
          { key: 'A', text: 'To complain about the complexity of the fare system', rationale: 'He finds it confusing but writes to resolve it, not to complain.' },
          { key: 'B', text: 'To work through a decision and share his reasoning', rationale: 'Correct: he lays out his pattern, his past error, and his criterion for choosing.' },
          { key: 'C', text: 'To ask Nabila to buy the pass on his behalf', rationale: 'No request is made.' },
          { key: 'D', text: 'To recommend the Unlimited pass to Nabila', rationale: 'He suspects Unlimited will lose.' },
        ],
        answerKey: 'B',
        explanation:
          'The purpose of a message is what the writer is doing, not what they are feeling. He is reasoning in public, which is why every constraint is spelled out.',
        level: 9,
        difficulty: 8.3,
      },
    ],
  },

  /* ================================================================ */
  /* Information                                                       */
  /* ================================================================ */
  {
    slug: 'read-info-third-places',
    skill: 'reading',
    partType: 'reading.information',
    title: 'Four short pieces on public space',
    level: 10,
    topic: 'urban life',
    body: `**A.** When the library on Fenwick Street extended its hours to eleven at night, the stated reason was study space for students. Within a year the eleven o'clock users were mostly not students. They were shift workers waiting for a bus, parents of young children who wanted an hour of quiet, and a small number of people with nowhere warm to be. The library did not advertise these uses and did not discourage them. Its annual report described the extension as "successful", without disaggregating who was being served.

**B.** Designers of public seating have argued for two decades about the armrest. A bench divided by armrests cannot be slept on, which is the point for some municipalities and the objection for others. What is less often discussed is that armrests also make a bench harder to share between strangers, because they fix the distance between bodies. Cities that removed them reported more shared use and more complaints. Both results were predicted; neither settled the argument.

**C.** A community centre in Trois-Rivières tried an experiment: it stopped programming its main hall on Wednesday afternoons and simply left the space open with the chairs stacked. Staff expected it to be empty. Attendance in the first month was low, then rose steadily for six months and plateaued at roughly double the level of the programmed sessions it replaced. Asked why they came, most visitors gave an answer the centre had not anticipated: nothing was required of them.

**D.** Retail analysts have long tracked "dwell time" — how long a person stays in a space without buying anything. In shopping centres it is treated as a cost to be minimised, and seating is placed accordingly. In transit hubs, the same measurement is treated as a service level to be maximised, because a passenger who cannot sit is a passenger who complains. The measurement is identical. Only the sign in front of it changes.`,
    questions: [
      {
        slug: 'read-info-places-q1',
        microSkill: 'reading.information_matching',
        prompt: 'Which piece describes an outcome that exceeded the expectations of the people who created it?',
        options: [
          { key: 'A', text: 'Piece A', rationale: 'The library described the extension as successful but is shown avoiding scrutiny of who benefited.' },
          { key: 'B', text: 'Piece B', rationale: 'Both outcomes were predicted, which the text states explicitly.' },
          { key: 'C', text: 'Piece C', rationale: 'Correct: staff expected an empty hall and attendance eventually doubled the programmed sessions it replaced.' },
          { key: 'D', text: 'Piece D', rationale: 'Describes a difference in interpretation, not an unexpected outcome.' },
        ],
        answerKey: 'C',
        explanation:
          'The phrase "Staff expected it to be empty" sets a baseline that the result then exceeds. Matching items are decided by one clause, not by the general topic of the paragraph.',
        level: 9,
        difficulty: 8.6,
      },
      {
        slug: 'read-info-places-q2',
        microSkill: 'reading.main_idea',
        prompt: 'Which statement best captures the point of piece D?',
        options: [
          { key: 'A', text: 'Transit hubs are better designed than shopping centres', rationale: 'The text refuses this judgement; it observes a difference in framing.' },
          { key: 'B', text: 'The same measurement can be a problem or a goal depending on the institution', rationale: 'Correct: "The measurement is identical. Only the sign in front of it changes."' },
          { key: 'C', text: 'Dwell time is an unreliable measure of customer satisfaction', rationale: 'Its reliability is never questioned.' },
          { key: 'D', text: 'Seating should be increased in shopping centres', rationale: 'No recommendation is made.' },
        ],
        answerKey: 'B',
        explanation:
          'The last two sentences are the thesis, compressed. When a short paragraph ends with a short sentence, that sentence usually carries the claim.',
        takeaway: 'A short closing sentence after longer ones is doing rhetorical work — read it as the point.',
        level: 10,
        difficulty: 9.6,
      },
      {
        slug: 'read-info-places-q3',
        microSkill: 'reading.information_matching',
        prompt: 'Which piece presents evidence that failed to resolve a disagreement?',
        options: [
          { key: 'A', text: 'Piece A', rationale: 'No disagreement is described.' },
          { key: 'B', text: 'Piece B', rationale: 'Correct: "Both results were predicted; neither settled the argument."' },
          { key: 'C', text: 'Piece C', rationale: 'The experiment produced a clear result rather than an unresolved dispute.' },
          { key: 'D', text: 'Piece D', rationale: 'Describes divergent framing of one measurement, not a disagreement over evidence.' },
        ],
        answerKey: 'B',
        explanation:
          'Look for the vocabulary of dispute — argued, objection, settled. Matching is faster when you scan for the relationship named in the question rather than the topic.',
        level: 9,
        difficulty: 8.8,
      },
      {
        slug: 'read-info-places-q4',
        microSkill: 'reading.inference',
        prompt: 'What does piece A imply about the library’s annual report?',
        options: [
          { key: 'A', text: 'It overstated the number of students using the extended hours', rationale: 'It made no claim about numbers; the omission is the point.' },
          { key: 'B', text: 'It avoided examining who the extension actually served', rationale: 'Correct: "without disaggregating who was being served" identifies an omission, not a false claim.' },
          { key: 'C', text: 'It recommended ending the extended hours', rationale: 'It called the extension successful.' },
          { key: 'D', text: 'It acknowledged serving people with nowhere warm to be', rationale: 'That is the writer\'s observation, not the report\'s.' },
        ],
        answerKey: 'B',
        explanation:
          'The critical word is "without" — the sentence criticises by naming what is absent. Options A and B differ by whether the report lied or omitted. Choose the one the grammar supports.',
        level: 11,
        difficulty: 10.4,
      },
      {
        slug: 'read-info-places-q5',
        microSkill: 'reading.paraphrase',
        prompt: 'In piece C, what reason did most visitors give for attending?',
        options: [
          { key: 'A', text: 'The space was free of obligations', rationale: 'Correct paraphrase of "nothing was required of them".' },
          { key: 'B', text: 'The programming had improved', rationale: 'Programming was removed, not improved.' },
          { key: 'C', text: 'The hall was warmer than other options', rationale: 'That belongs to piece A.' },
          { key: 'D', text: 'They wanted to meet neighbours', rationale: 'Social contact is never given as the reason.' },
        ],
        answerKey: 'A',
        explanation:
          'Distractor C imports a detail from another paragraph. In multi-source sets, always confirm which piece a detail belongs to before selecting.',
        takeaway: 'In information-matching sets, cross-paragraph contamination is the most common trap.',
        level: 9,
        difficulty: 8.4,
      },
      {
        slug: 'read-info-places-q6',
        microSkill: 'reading.text_organisation',
        prompt: 'What structural pattern do pieces B and D share?',
        options: [
          { key: 'A', text: 'Both present a problem and then propose a solution', rationale: 'Neither proposes a solution.' },
          { key: 'B', text: 'Both set out two opposed interpretations of the same fact', rationale: 'Correct: armrests as protection or as barrier; dwell time as cost or as service.' },
          { key: 'C', text: 'Both describe an experiment and report its results', rationale: 'That describes piece C.' },
          { key: 'D', text: 'Both trace a change over time', rationale: 'B mentions two decades of argument, but neither traces a development.' },
        ],
        answerKey: 'B',
        explanation:
          'Structure questions ask what a paragraph does, not what it is about. Summarise each paragraph as a verb phrase — "sets two readings against each other" — and matching becomes mechanical.',
        level: 11,
        difficulty: 10.2,
      },
      {
        slug: 'read-info-places-q7',
        microSkill: 'reading.vocabulary_in_context',
        prompt: 'In piece D, "Only the sign in front of it changes" uses "sign" to mean:',
        options: [
          { key: 'A', text: 'A physical notice displayed in the space', rationale: 'The literal reading, which the sentence does not support.' },
          { key: 'B', text: 'A mathematical positive or negative value', rationale: 'Correct: the same measurement is counted as a cost in one setting and a benefit in the other.' },
          { key: 'C', text: 'An indication that something is about to happen', rationale: 'No prediction is being made.' },
          { key: 'D', text: 'A gesture used to communicate without speech', rationale: 'Unrelated to the context.' },
        ],
        answerKey: 'B',
        explanation:
          'A common word in a technical sense is a reliable top-band item. The clue is "The measurement is identical" — only something attached to a number can change while the number stays the same.',
        level: 11,
        difficulty: 10.7,
      },
      {
        slug: 'read-info-places-q8',
        microSkill: 'reading.information_matching',
        prompt: 'Which piece is most relevant to a council deciding whether to install seating that discourages lying down?',
        options: [
          { key: 'A', text: 'Piece A', rationale: 'Concerns opening hours and unacknowledged users.' },
          { key: 'B', text: 'Piece B', rationale: 'Correct: armrests are exactly this design decision, with both consequences reported.' },
          { key: 'C', text: 'Piece C', rationale: 'Concerns unprogrammed time in a hall, not the shape of seating.' },
          { key: 'D', text: 'Piece D', rationale: 'Concerns how dwell time is valued, not how seating is designed.' },
        ],
        answerKey: 'B',
        explanation:
          'Application items give you a real decision and ask which source informs it. Translate the decision into its underlying design feature — here, the armrest — and the match becomes obvious.',
        level: 8,
        difficulty: 7.6,
      },
    ],
  },

  {
    slug: 'read-info-credential-recognition',
    skill: 'reading',
    partType: 'reading.information',
    title: 'Four notes on professional credentials',
    level: 9,
    topic: 'employment',
    body: `**A.** Assessment agencies compare a qualification earned abroad with its closest domestic equivalent and issue a report. The report is an opinion, not a licence. Employers may accept it, ignore it, or ask for a different agency's version. Applicants routinely discover this after paying for the first report, because the agencies themselves have no reason to explain it and the employer has not yet entered the process.

**B.** Regulators — the bodies that actually grant the right to practise — generally require three things: verified education, supervised local experience, and an examination. The order is not negotiable, and the middle requirement is the one that traps people, because supervised positions are usually filled by graduates of local programmes who are already in the building.

**C.** Bridging programmes exist to solve the middle problem. They combine coursework with a placement, and their completion rates are high. Their capacity is not: a programme with forty places in a city receiving several thousand qualified newcomers a year is a solution in form rather than in scale. Graduates report strong outcomes; the people who never got a place are not surveyed.

**D.** A quieter route is lateral entry: taking an adjacent role that a regulator does not control, accumulating local reference points, and re-entering the licensed profession later. It costs time and status. It also produces the local experience that the regulator wants and that the bridging programme cannot supply at volume. Career counsellors mention it rarely, because it looks like giving up.`,
    questions: [
      {
        slug: 'read-info-cred-q1',
        microSkill: 'reading.information_matching',
        prompt: 'Which piece explains why a solution that works for individuals fails at population level?',
        options: [
          { key: 'A', text: 'Piece A', rationale: 'Explains a misunderstanding about reports, not a scaling failure.' },
          { key: 'B', text: 'Piece B', rationale: 'Names the bottleneck but not the failed solution.' },
          { key: 'C', text: 'Piece C', rationale: 'Correct: high completion rates, forty places, and several thousand newcomers — a solution in form rather than in scale.' },
          { key: 'D', text: 'Piece D', rationale: 'Describes an individual route without making any claim about capacity.' },
        ],
        answerKey: 'C',
        explanation:
          'The question describes a relationship — works individually, fails collectively — and only one paragraph contains both halves. Read the question for its logical shape before scanning.',
        level: 10,
        difficulty: 9.4,
      },
      {
        slug: 'read-info-cred-q2',
        microSkill: 'reading.inference',
        prompt: 'What does piece C imply by "the people who never got a place are not surveyed"?',
        options: [
          { key: 'A', text: 'The reported success rates describe a filtered group', rationale: 'Correct: outcomes are measured only among those admitted, so they cannot represent all applicants.' },
          { key: 'B', text: 'The programmes deliberately conceal their failure rate', rationale: 'The sentence identifies a gap in measurement, not deception.' },
          { key: 'C', text: 'Surveys of newcomers are generally unreliable', rationale: 'No general claim about surveys is made.' },
          { key: 'D', text: 'Most applicants are rejected for lack of qualifications', rationale: 'Capacity, not qualification, is the stated constraint.' },
        ],
        answerKey: 'A',
        explanation:
          'This is a selection-effect argument. Whenever a text notes who was excluded from a measurement, it is questioning what the measurement can support — not accusing anyone of lying.',
        takeaway: 'Notice who is missing from a statistic. That absence is usually the writer’s real point.',
        level: 11,
        difficulty: 10.5,
      },
      {
        slug: 'read-info-cred-q3',
        microSkill: 'reading.paraphrase',
        prompt: 'According to piece A, what is the status of an assessment report?',
        options: [
          { key: 'A', text: 'A binding judgement that employers must accept', rationale: 'Directly contradicted: employers may accept it, ignore it, or ask for another.' },
          { key: 'B', text: 'A professional opinion that carries no automatic authority', rationale: 'Correct: "an opinion, not a licence", which employers may ignore.' },
          { key: 'C', text: 'A licence to practise in the assessed profession', rationale: 'Explicitly denied by the phrase “an opinion, not a licence”.' },
          { key: 'D', text: 'A document required by every regulator', rationale: 'Regulators appear in piece B with different requirements.' },
        ],
        answerKey: 'B',
        explanation:
          'The passage gives you the paraphrase in the form of a contrast ("X, not Y"). Contrastive definitions are the easiest evidence to locate — look for the comma-plus-negative pattern.',
        level: 8,
        difficulty: 7.4,
      },
      {
        slug: 'read-info-cred-q4',
        microSkill: 'reading.inference',
        prompt: 'Why does piece B describe supervised experience as the requirement that "traps people"?',
        options: [
          { key: 'A', text: 'It costs more than the examination', rationale: 'Cost is never compared.' },
          { key: 'B', text: 'The available positions are largely taken by local graduates already present', rationale: 'Correct, and stated as the reason.' },
          { key: 'C', text: 'It must be completed before the education is verified', rationale: 'The order is education, experience, examination.' },
          { key: 'D', text: 'Regulators rarely recognise supervision completed abroad', rationale: 'A plausible real-world fact, but not what the text says.' },
        ],
        answerKey: 'B',
        explanation:
          'Option D is the strongest distractor because it is true in the world. The item asks what the passage says. Keep outside knowledge out of the evidence.',
        level: 9,
        difficulty: 8.8,
      },
      {
        slug: 'read-info-cred-q5',
        microSkill: 'reading.tone_attitude',
        prompt: 'What is the writer’s attitude toward lateral entry in piece D?',
        options: [
          { key: 'A', text: 'Dismissive — it represents an abandonment of the profession', rationale: 'That is the perception the writer attributes to others.' },
          { key: 'B', text: 'Cautiously positive — costly, but it solves the real bottleneck', rationale: 'Correct: costs are named first, then the advantage, then an explanation of why it is under-recommended.' },
          { key: 'C', text: 'Neutral — the route is described without evaluation', rationale: '"Looks like giving up" is a judgement about the advice, not the route.' },
          { key: 'D', text: 'Enthusiastic — the writer recommends it over bridging programmes', rationale: 'No recommendation is made, and the costs are stated plainly.' },
        ],
        answerKey: 'B',
        explanation:
          'The final sentence explains why the route is under-recommended, which implies the writer thinks it deserves more attention. Attitude is often carried in the explanation of other people\'s behaviour.',
        level: 11,
        difficulty: 10.3,
      },
      {
        slug: 'read-info-cred-q6',
        microSkill: 'reading.text_organisation',
        prompt: 'How do pieces B, C and D relate to one another?',
        options: [
          { key: 'A', text: 'B names a problem, C offers a limited fix, D offers an alternative route', rationale: 'Correct — a problem-and-responses chain.' },
          { key: 'B', text: 'Each describes an independent barrier to licensing', rationale: 'C and D both address the barrier named in B.' },
          { key: 'C', text: 'B and C agree; D contradicts both', rationale: 'D complements rather than contradicts.' },
          { key: 'D', text: 'They describe three stages of one process in order', rationale: 'C and D are alternatives, not sequential stages.' },
        ],
        answerKey: 'A',
        explanation:
          'Reading across paragraphs is a distinct skill from reading within one. Ask what job each paragraph does for the set, then name the chain.',
        level: 10,
        difficulty: 9.8,
      },
      {
        slug: 'read-info-cred-q7',
        microSkill: 'reading.information_matching',
        prompt: 'Which piece would best explain why someone paid for a report that an employer then refused to use?',
        options: [
          { key: 'A', text: 'Piece A', rationale: 'Correct: employers may ignore a report or demand a different agency\'s.' },
          { key: 'B', text: 'Piece B', rationale: 'Concerns regulators, not employers.' },
          { key: 'C', text: 'Piece C', rationale: 'Concerns the capacity of bridging programmes, not assessment reports.' },
          { key: 'D', text: 'Piece D', rationale: 'Concerns lateral career routes, not assessment reports.' },
        ],
        answerKey: 'A',
        explanation:
          'Scenario-matching rewards translating the scenario into its key noun — here, "report" — and going straight to the paragraph that owns it.',
        level: 7,
        difficulty: 6.9,
        targetSeconds: 40,
      },
      {
        slug: 'read-info-cred-q8',
        microSkill: 'reading.vocabulary_in_context',
        prompt: 'In piece C, "a solution in form rather than in scale" means the programme:',
        options: [
          { key: 'A', text: 'Is correctly designed but far too small to meet demand', rationale: 'Correct: forty places against several thousand newcomers is a design that works and a scale that does not.' },
          { key: 'B', text: 'Is poorly designed but widely available', rationale: 'Reverses the contrast — the passage praises the design and criticises the scale.' },
          { key: 'C', text: 'Works only for certain professions', rationale: 'Profession-specific limits are not discussed.' },
          { key: 'D', text: 'Exists on paper but has never been implemented', rationale: 'It runs and reports completion rates.' },
        ],
        answerKey: 'A',
        explanation:
          '"In form rather than in scale" contrasts design with size. The surrounding numbers — forty places, several thousand newcomers — confirm which side of the contrast fails.',
        level: 10,
        difficulty: 9.7,
      },
    ],
  },

  /* ================================================================ */
  /* Viewpoints                                                        */
  /* ================================================================ */
  {
    slug: 'read-view-four-day-week',
    skill: 'reading',
    partType: 'reading.viewpoints',
    title: 'Opinion: the four-day week debate',
    level: 11,
    topic: 'work',
    body: `Every few years the four-day week returns to the front pages, and every few years the discussion makes the same mistake: it treats a scheduling change as though it were a single policy with a single effect.

The trials that generate the headlines are, for the most part, well designed and honestly reported. Output holds; sickness absence falls; the overwhelming majority of participating firms continue after the trial ends. What the coverage tends to omit is who participates. Firms that volunteer for a productivity experiment are firms that believe they have slack to find, which usually means knowledge work with flexible deadlines and a workforce whose output is not measured in hours of physical presence. A dental practice cannot find slack in its Wednesday. Neither can a bus route.

This is not an argument against the policy. It is an argument against the way its results are generalised. The honest version of the claim is narrower and still substantial: in work where output is only loosely coupled to hours, compressing the week appears to expose inefficiency that nobody had an incentive to name before.

There is a second omission, and it is the one I find more interesting. In several trials, the gains came less from working faster than from holding fewer meetings — which is to say, from removing coordination, not from adding effort. That is a finding about organisational design, and it does not require a shorter week to act on. A firm could take the meeting discipline and keep the five days. Very few do, which suggests the shorter week is doing something the discipline alone cannot: it makes the constraint external, and therefore harder to quietly abandon in a busy quarter.

Where I part company with the enthusiasts is on the question of who absorbs the difference. In sectors that cannot compress, a four-day norm elsewhere does not raise wages or reduce hours; it changes what a standard week looks like relative to the people who cannot have one. That is not a reason to stop. It is a reason to stop pretending the policy is universal, and to be specific about which workers a general norm would leave outside it.`,
    questions: [
      {
        slug: 'read-view-fdw-q1',
        microSkill: 'reading.writer_purpose',
        prompt: 'What is the writer’s main purpose?',
        options: [
          { key: 'A', text: 'To oppose the four-day week on economic grounds', rationale: 'The writer states explicitly that this is not an argument against the policy.' },
          { key: 'B', text: 'To challenge how trial results are generalised, not the policy itself', rationale: 'Correct: "It is an argument against the way its results are generalised."' },
          { key: 'C', text: 'To advocate for meeting reform instead of a shorter week', rationale: 'Raised as an interesting finding, then partly rejected in the same paragraph.' },
          { key: 'D', text: 'To summarise the evidence without taking a position', rationale: 'The final paragraph takes a clear position.' },
        ],
        answerKey: 'B',
        explanation:
          'The writer supplies the answer as an explicit self-correction: "This is not an argument against X. It is an argument against Y." When a text names its own purpose, do not overthink it.',
        level: 10,
        difficulty: 9.2,
      },
      {
        slug: 'read-view-fdw-q2',
        microSkill: 'reading.inference',
        prompt: 'Why does the writer mention a dental practice and a bus route?',
        options: [
          { key: 'A', text: 'To argue that these sectors are inefficiently managed', rationale: 'The opposite: they have no slack to find.' },
          { key: 'B', text: 'To illustrate work where output is tightly coupled to hours present', rationale: 'Correct: they are counter-examples to the volunteering firms.' },
          { key: 'C', text: 'To show that trials have been run in a wide range of industries', rationale: 'The point is that these industries do not volunteer.' },
          { key: 'D', text: 'To suggest that public services should be exempted from the policy', rationale: 'No exemption is proposed.' },
        ],
        answerKey: 'B',
        explanation:
          'Two concrete examples immediately after an abstract claim are almost always illustrations of that claim. Read the sentence before the examples to know what they illustrate.',
        level: 9,
        difficulty: 8.7,
      },
      {
        slug: 'read-view-fdw-q3',
        microSkill: 'reading.inference',
        prompt: 'What does the writer suggest about firms that keep five days but adopt meeting discipline?',
        options: [
          { key: 'A', text: 'They achieve the same gains at lower cost', rationale: 'The writer says very few do it, and implies the discipline does not hold.' },
          { key: 'B', text: 'They tend to abandon the discipline when work intensifies', rationale: 'Correct: the shorter week "makes the constraint external, and therefore harder to quietly abandon in a busy quarter."' },
          { key: 'C', text: 'They are more common than firms adopting a four-day week', rationale: '"Very few do" indicates the opposite.' },
          { key: 'D', text: 'They misunderstand the source of the productivity gains', rationale: 'The writer credits them with identifying the right mechanism.' },
        ],
        answerKey: 'B',
        explanation:
          'The inference sits in a subordinate clause at the end of a long sentence. Difficult inference items frequently place the key in the least prominent position — read the whole sentence before answering.',
        takeaway: 'The decisive clause is often the last one in a long sentence, not the first.',
        level: 11,
        difficulty: 10.8,
      },
      {
        slug: 'read-view-fdw-q4',
        microSkill: 'reading.tone_attitude',
        prompt: 'How would you characterise the writer’s stance toward the four-day-week trials?',
        options: [
          { key: 'A', text: 'Sceptical of their methods and their honesty', rationale: 'The trials are called well designed and honestly reported.' },
          { key: 'B', text: 'Supportive of the findings but critical of how they are extended', rationale: 'Correct: the evidence is credited; the generalisation is not.' },
          { key: 'C', text: 'Enthusiastic and impatient with critics', rationale: 'The writer is the critic here.' },
          { key: 'D', text: 'Undecided, weighing both sides equally', rationale: 'A definite position is taken in the last paragraph.' },
        ],
        answerKey: 'B',
        explanation:
          'This is the classic top-band stance: agree with the evidence, dispute the conclusion drawn from it. Distinguish what a writer accepts from what they reject.',
        level: 11,
        difficulty: 10.4,
      },
      {
        slug: 'read-view-fdw-q5',
        microSkill: 'reading.vocabulary_in_context',
        prompt: 'In "firms that believe they have slack to find", "slack" means:',
        options: [
          { key: 'A', text: 'Unproductive time or effort that could be removed', rationale: 'Correct in this context.' },
          { key: 'B', text: 'Financial reserves available for investment', rationale: 'A plausible business sense, but the paragraph concerns time and hours.' },
          { key: 'C', text: 'Flexibility in deadlines granted by clients', rationale: 'Flexible deadlines are mentioned separately as a characteristic of the firm.' },
          { key: 'D', text: 'A shortage of available staff', rationale: 'Opposite of the intended meaning.' },
        ],
        answerKey: 'A',
        explanation:
          'Later the writer says compression "expose[s] inefficiency", which confirms the reading. When a word is ambiguous, look for the sentence that restates the idea in different words.',
        level: 10,
        difficulty: 9.6,
      },
      {
        slug: 'read-view-fdw-q6',
        microSkill: 'reading.inference',
        prompt: 'What is the writer’s concern in the final paragraph?',
        options: [
          { key: 'A', text: 'That wages will fall in sectors that cannot compress', rationale: 'The text says the norm "does not raise wages" — it does not predict a fall.' },
          { key: 'B', text: 'That a norm adopted unevenly redefines the standard week against those excluded from it', rationale: 'Correct: the final paragraph is about what a general norm does to workers who cannot have one.' },
          { key: 'C', text: 'That the policy will be abandoned during economic downturns', rationale: 'That concern belongs to the meeting-discipline paragraph.' },
          { key: 'D', text: 'That employers in compressible sectors will exploit the norm', rationale: 'Employer behaviour is not the subject here.' },
        ],
        answerKey: 'B',
        explanation:
          'Option A is a near-miss built by strengthening "does not raise" into "will fall". Watch for distractors that intensify a hedge into a prediction.',
        level: 11,
        difficulty: 10.9,
      },
      {
        slug: 'read-view-fdw-q7',
        microSkill: 'reading.gap_completion',
        format: 'blank_choice',
        prompt: 'A reader comments:\n\n"The piece is right that volunteers are unrepresentative. But I would go further: ________, which means even the honest version of the claim may be measuring the willingness to change rather than the effect of the change itself."',
        options: [
          { key: 'A', text: 'the firms that volunteer are also the firms most motivated to make the trial succeed', rationale: 'Correct: it extends the selection argument and leads directly to the conclusion after the comma.' },
          { key: 'B', text: 'output measures in knowledge work are notoriously unreliable', rationale: 'A different criticism; it does not connect to "willingness to change".' },
          { key: 'C', text: 'most trials last less than a year', rationale: 'Duration is not the issue raised.' },
          { key: 'D', text: 'the four-day week has been discussed for decades without resolution', rationale: 'Restates the article\'s opening rather than going further.' },
        ],
        answerKey: 'A',
        explanation:
          'The comment sets up "I would go further", so the gap must extend the same argument, and the clause after it must follow from the gap. Only A satisfies both constraints.',
        level: 11,
        difficulty: 11.0,
      },
      {
        slug: 'read-view-fdw-q8',
        microSkill: 'reading.writer_purpose',
        prompt: 'What is the function of the second paragraph?',
        options: [
          { key: 'A', text: 'To establish the evidence and then identify what it omits', rationale: 'Correct: results first, then "what the coverage tends to omit".' },
          { key: 'B', text: 'To refute the trial results with contrary data', rationale: 'No contrary data is offered.' },
          { key: 'C', text: 'To explain how the trials were conducted', rationale: 'Method is asserted as sound, not explained.' },
          { key: 'D', text: 'To introduce the writer’s own proposal', rationale: 'No proposal appears anywhere in the article; the writer argues about interpretation.' },
        ],
        answerKey: 'A',
        explanation:
          'Paragraph-function questions are answered by naming the moves in order. Here: concede, report, then qualify. That shape is the whole answer.',
        level: 10,
        difficulty: 9.9,
      },
    ],
  },

  {
    slug: 'read-view-library-fines',
    skill: 'reading',
    partType: 'reading.viewpoints',
    title: 'Opinion: what happened when the fines went',
    level: 10,
    topic: 'community',
    body: `When our regional library system eliminated overdue fines four years ago, the objection was not really about money. Fine revenue had been falling for a decade and covered less than the cost of collecting it. The objection was about what would happen to the books.

Here is what happened. Return rates dropped for about five months, then recovered to slightly above where they had been. Losses — items never returned at all — rose by a fraction of a percentage point, which the system absorbed. Active borrowers rose by nineteen per cent, and the increase was concentrated in the branches serving the lowest-income postal codes. None of this is remarkable; systems across the country have reported the same pattern, and the finding is stable enough that the argument has largely moved on.

What has not moved on is the assumption underneath the original objection: that a penalty is what makes people return things. The five-month dip is instructive here. During that period, staff reported no increase in complaints about unavailable titles, because the books that were coming back late were, overwhelmingly, books nobody else had requested. The fine had been operating on a population that did not need it, in order to solve a problem that occurred somewhere else.

I want to be careful not to overstate this. There is a category of high-demand material where holds queues are long and a late return has a real cost to another reader. Most systems that removed fines kept a mechanism for that category — usually a borrowing suspension rather than a charge, which is a penalty by another name and works because it is targeted. The lesson is not that penalties never work. It is that a penalty applied to everyone, to correct the behaviour of a few, mostly succeeds in deterring the people who were least likely to cause the problem and least able to absorb the cost.

That, incidentally, is why the nineteen per cent matters more than the losses figure. The fines were never keeping the books safe. They were keeping some people out of the building.`,
    questions: [
      {
        slug: 'read-view-fines-q1',
        microSkill: 'reading.main_idea',
        prompt: 'What is the central argument of this piece?',
        options: [
          { key: 'A', text: 'Fines should never be used in public services', rationale: 'The writer explicitly allows targeted penalties for high-demand material.' },
          { key: 'B', text: 'Broad penalties mainly deter people who were not causing the problem', rationale: 'Correct — stated in the fourth paragraph and echoed in the last.' },
          { key: 'C', text: 'Library losses are lower than critics predicted', rationale: 'True in the piece, but it is evidence, not the argument.' },
          { key: 'D', text: 'Library membership should be actively promoted in low-income areas', rationale: 'No recommendation of this kind is made.' },
        ],
        answerKey: 'B',
        explanation:
          'Option C is the most common wrong answer here: it selects a true supporting fact and calls it the thesis. The thesis is the general claim the facts are marshalled for.',
        takeaway: 'A true detail is not the main idea. The main idea is what the details are used to prove.',
        level: 10,
        difficulty: 9.3,
      },
      {
        slug: 'read-view-fines-q2',
        microSkill: 'reading.inference',
        prompt: 'Why does the writer describe the five-month dip as "instructive"?',
        options: [
          { key: 'A', text: 'It shows that fines were preventing a problem that did not exist for most items', rationale: 'Correct: no complaints arose, because late books were ones nobody wanted.' },
          { key: 'B', text: 'It shows how quickly borrowers adapt to new rules', rationale: 'Adaptation speed is not the lesson drawn.' },
          { key: 'C', text: 'It proves that the policy change was initially a mistake', rationale: 'The writer treats the dip as evidence for the policy, not against it.' },
          { key: 'D', text: 'It explains why active borrowing rose by nineteen per cent', rationale: 'The rise is attributed to access, not to the dip.' },
        ],
        answerKey: 'A',
        explanation:
          'When a writer flags something as instructive, the next two sentences almost always contain the lesson. Read forward from the signal.',
        level: 10,
        difficulty: 9.8,
      },
      {
        slug: 'read-view-fines-q3',
        microSkill: 'reading.tone_attitude',
        prompt: 'What does "I want to be careful not to overstate this" signal?',
        options: [
          { key: 'A', text: 'The writer is about to withdraw the argument', rationale: 'The argument is maintained and refined.' },
          { key: 'B', text: 'The writer is about to qualify the claim before restating it more precisely', rationale: 'Correct: the concession introduces the high-demand exception, then sharpens the thesis.' },
          { key: 'C', text: 'The writer doubts the data presented earlier', rationale: 'The data is not questioned.' },
          { key: 'D', text: 'The writer is addressing a personal criticism', rationale: 'No critic is being answered directly.' },
        ],
        answerKey: 'B',
        explanation:
          'Hedging before a concession is a strength move, not a retreat: the writer anticipates the objection to remove it. Expect the sharpest version of the thesis immediately afterwards.',
        level: 11,
        difficulty: 10.6,
      },
      {
        slug: 'read-view-fines-q4',
        microSkill: 'reading.inference',
        prompt: 'What does the writer imply about borrowing suspensions?',
        options: [
          { key: 'A', text: 'They are unfair because they restrict access', rationale: 'The writer describes them as working precisely because they are targeted.' },
          { key: 'B', text: 'They are effective because they apply only where the harm occurs', rationale: 'Correct: "a penalty by another name and works because it is targeted".' },
          { key: 'C', text: 'They should replace all other library policies', rationale: 'No such scope is claimed.' },
          { key: 'D', text: 'They are less effective than monetary fines', rationale: 'The comparison favours suspensions.' },
        ],
        answerKey: 'B',
        explanation:
          'The writer concedes that suspensions are penalties, which strengthens rather than weakens the argument: the objection is to breadth, not to penalties as such.',
        level: 10,
        difficulty: 9.9,
      },
      {
        slug: 'read-view-fines-q5',
        microSkill: 'reading.writer_purpose',
        prompt: 'Why does the piece open with "the objection was not really about money"?',
        options: [
          { key: 'A', text: 'To set aside the financial argument before addressing the real one', rationale: 'Correct: revenue is dismissed in two sentences, clearing the way for the behavioural claim.' },
          { key: 'B', text: 'To argue that the library system was poorly funded', rationale: 'Funding levels are not the subject.' },
          { key: 'C', text: 'To criticise those who opposed the change', rationale: 'The opponents\' concern is taken seriously and answered.' },
          { key: 'D', text: 'To explain why fine revenue had been falling', rationale: 'The fall is stated, not explained.' },
        ],
        answerKey: 'A',
        explanation:
          'Opening moves in opinion writing typically clear ground. Naming what an argument is *not* about is a way of choosing the terrain on which it will be fought.',
        level: 10,
        difficulty: 9.7,
      },
      {
        slug: 'read-view-fines-q6',
        microSkill: 'reading.vocabulary_in_context',
        prompt: 'In the final paragraph, "keeping some people out of the building" is used to mean:',
        options: [
          { key: 'A', text: 'Physically barring entry to certain borrowers', rationale: 'Too literal; nobody was refused entry.' },
          { key: 'B', text: 'Deterring people from using the library at all', rationale: 'Correct: the nineteen per cent rise shows people returning once the deterrent was removed.' },
          { key: 'C', text: 'Reducing the hours during which branches were open', rationale: 'Opening hours are not discussed.' },
          { key: 'D', text: 'Preventing staff from working in certain branches', rationale: 'Unrelated to the argument.' },
        ],
        answerKey: 'B',
        explanation:
          'Figurative closings compress the argument into an image. Resolve the image against the statistic the writer just cited.',
        level: 9,
        difficulty: 8.9,
      },
      {
        slug: 'read-view-fines-q7',
        microSkill: 'reading.gap_completion',
        format: 'blank_choice',
        prompt: 'A reader responds:\n\n"I ran a branch through this transition. The nineteen per cent is real, but it took two years to appear in our numbers, and ________. Boards that expect the effect within a budget cycle will conclude the policy failed and reverse it."',
        options: [
          { key: 'A', text: 'we lost more high-demand items than the article suggests', rationale: 'Introduces a claim that the second sentence does not build on.' },
          { key: 'B', text: 'nobody warned us that the recovery would be that slow', rationale: 'Correct: it explains the timing problem that the next sentence turns into a warning about budget cycles.' },
          { key: 'C', text: 'the fines had never covered our collection costs anyway', rationale: 'Agrees with the article but does not lead to the point about timing.' },
          { key: 'D', text: 'staff needed training to explain the change to borrowers', rationale: 'Plausible operationally, but disconnected from the following sentence.' },
        ],
        answerKey: 'B',
        explanation:
          'The sentence after the gap is about institutions judging too early. Only B supplies the premise that makes that warning follow. Always read past the gap.',
        level: 11,
        difficulty: 10.5,
      },
      {
        slug: 'read-view-fines-q8',
        microSkill: 'reading.inference',
        prompt: 'What can be concluded about the loss figures after the change?',
        options: [
          { key: 'A', text: 'They rose sharply and forced a policy review', rationale: 'They rose by a fraction of a percentage point and were absorbed.' },
          { key: 'B', text: 'They rose slightly and were treated as an acceptable cost', rationale: 'Correct: a fraction of a percentage point, and the system absorbed it.' },
          { key: 'C', text: 'They fell once borrowing increased', rationale: 'No fall is reported.' },
          { key: 'D', text: 'They were not measured', rationale: 'They are reported explicitly.' },
        ],
        answerKey: 'B',
        explanation:
          '"Which the system absorbed" is the evaluative clause: it tells you how the increase was treated, not just its size. Evaluations attached to figures are frequently the answer.',
        level: 8,
        difficulty: 7.8,
      },
    ],
  },
];
