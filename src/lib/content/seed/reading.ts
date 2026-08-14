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

  /* ================================================================ */
  /* Set two — added to widen coverage of the part types a generator   */
  /* cannot write: correspondence, argument, and applied diagrams.     */
  /* ================================================================ */

  {
    slug: 'read-corr-shift-swap-refused',
    skill: 'reading',
    partType: 'reading.correspondence',
    title: 'A message about a refused shift swap',
    level: 9,
    topic: 'workplace',
    body: `Dev,

I am writing this down because I think we are talking past each other on the phone.

You are right that I turned down your swap request on the 14th. What I did not explain at the time, and should have, is that I had already agreed to cover Marisol that week and the schedule would have left me on for nine days without a break. I said no to the shift, not to you, and I can see how it looked from where you were standing given that I had asked you for two swaps in October.

On the wider point about the group chat: I did not think the message was about me until three people replied to it, and by then saying anything would have made it a bigger thing than it was. I let it sit. That was the wrong call, and it is the part of this I would take back.

What I would like to propose is that we stop arranging swaps in the chat entirely. When it is in there, whoever answers first gets it, and the person who needed it has no idea who saw the message and chose not to. If we message each other directly and give a yes or no the same day, at least the no comes with a name attached and can be explained.

I am on days Monday to Wednesday. Come and find me at the end of any of them and we can sort this out properly, or reply here if you would rather have it in writing.

Nadia`,
    questions: [
      {
        slug: 'read-corr-swap-q1',
        microSkill: 'reading.writer_purpose',
        prompt: 'What is Nadia’s main purpose in writing?',
        options: [
          { key: 'A', text: 'To repair the working relationship and change how swaps are arranged', rationale: 'Correct: she explains the refusal, admits one fault, and proposes a new arrangement — repair plus a concrete change.' },
          { key: 'B', text: 'To defend her decision to refuse the shift on the 14th', rationale: 'She does explain it, but the explanation occupies one paragraph and leads to a proposal rather than standing as the point.' },
          { key: 'C', text: 'To complain about the way the group chat is used', rationale: 'The chat is a problem she raises, but she raises it in order to propose replacing it, not to object.' },
          { key: 'D', text: 'To apologise for the two swaps she requested in October', rationale: 'October is mentioned to acknowledge how her refusal looked, not as something she apologises for.' },
        ],
        answerKey: 'A',
        explanation:
          'Purpose questions are decided by where the letter ends up, not by which topic takes the most lines. Nadia spends paragraphs on the past and then turns to "What I would like to propose", followed by an offer to meet. A message that explains, concedes and then proposes is doing repair work; the explanation is in service of that, not the point of it.',
        takeaway: 'To find purpose, read the last third. Correspondence usually states the reason for writing where it says what happens next.',
        level: 9,
        difficulty: 8.4,
      },
      {
        slug: 'read-corr-swap-q2',
        microSkill: 'reading.inference',
        prompt: 'What can be inferred about why Nadia says nothing in the group chat at the time?',
        options: [
          { key: 'A', text: 'She did not realise it concerned her until responding would have drawn more attention', rationale: 'Correct: she says she did not think it was about her until three people replied, by which point speaking would have escalated it.' },
          { key: 'B', text: 'She did not see the message until several days had passed', rationale: 'Nothing suggests a delay in seeing it; the delay was in recognising what it meant.' },
          { key: 'C', text: 'She thought Dev would raise it with her privately instead', rationale: 'She never mentions any expectation of what Dev would do.' },
          { key: 'D', text: 'She believed the other replies had already settled the matter', rationale: 'The replies are what made her hesitate, not what resolved anything.' },
        ],
        answerKey: 'A',
        explanation:
          'The sentence carries two stages: not recognising the message was aimed at her, and then judging that a reply would enlarge the incident. Weak readings collapse these into one. Watch for "until" and "by then" — they mark a change of state, and the reason often sits on either side of them rather than in a single clause.',
        takeaway: 'When a sentence contains "until" or "by then", it is describing two moments. Establish both before choosing.',
        level: 10,
        difficulty: 9.5,
      },
      {
        slug: 'read-corr-swap-q3',
        microSkill: 'reading.tone_attitude',
        prompt: 'How would you best describe Nadia’s attitude toward her own conduct?',
        options: [
          { key: 'A', text: 'She admits one specific failing and does not extend it further', rationale: 'Correct: she calls the silence "the wrong call" and "the part of this I would take back" — bounded to that one thing.' },
          { key: 'B', text: 'She accepts responsibility for the whole disagreement', rationale: 'She holds her position on the refusal itself; the concession is limited to the chat.' },
          { key: 'C', text: 'She is unwilling to accept that she has done anything wrong', rationale: 'She names a mistake explicitly, which rules this out.' },
          { key: 'D', text: 'She regrets the refusal but not the way she handled the chat', rationale: 'This reverses the letter: she stands by the refusal and regrets the silence.' },
        ],
        answerKey: 'A',
        explanation:
          'A precise concession is a distinct move from a general apology, and the options here are built to separate them. "That was the wrong call, and it is the part of this I would take back" both admits and limits — the word "part" does the limiting. Reading only the admission produces B; reading only the defence produces C.',
        takeaway: 'Look for the words that bound a concession — "the part", "on that point", "at the time". They tell you how far the writer is conceding.',
        level: 10,
        difficulty: 9.8,
      },
      {
        slug: 'read-corr-swap-q4',
        microSkill: 'reading.literal_detail',
        prompt: 'Why did Nadia refuse the swap on the 14th?',
        options: [
          { key: 'A', text: 'Taking it would have meant working nine consecutive days', rationale: 'Correct: she had already agreed to cover Marisol, and the swap would have produced nine days without a break.' },
          { key: 'B', text: 'She was owed swaps by Dev from October', rationale: 'October is when she asked Dev for swaps, not when he owed her any.' },
          { key: 'C', text: 'She was not scheduled to work that week at all', rationale: 'She was scheduled, and had additionally agreed to cover a colleague.' },
          { key: 'D', text: 'The request arrived through the group chat rather than directly', rationale: 'That is her objection to the process, and it is not given as the reason for this refusal.' },
        ],
        answerKey: 'A',
        explanation:
          'The reason is a chain: she had already committed to Marisol, so adding Dev’s shift would have run to nine days. Distractor D is drawn from a real complaint elsewhere in the letter, which is exactly the trap — a true statement in the text is not automatically the answer to the question asked.',
        takeaway: 'A distractor can be entirely true and still wrong. Check it answers this question, not another one the passage also raises.',
        level: 8,
        difficulty: 7.2,
      },
      {
        slug: 'read-corr-swap-q5',
        microSkill: 'reading.main_idea',
        prompt: 'What is the central argument for arranging swaps directly rather than in the group chat?',
        options: [
          { key: 'A', text: 'A refusal made privately can be explained; one made by silence cannot', rationale: 'Correct: she argues the no comes "with a name attached and can be explained", which silence never allows.' },
          { key: 'B', text: 'The group chat is read by too many people to be private', rationale: 'Privacy is not the objection she makes; accountability is.' },
          { key: 'C', text: 'Direct messages produce faster responses than group messages', rationale: 'She asks for a same-day answer, but speed is a condition of her proposal rather than its justification.' },
          { key: 'D', text: 'The first person to reply in the chat is rarely the best fit', rationale: 'She notes whoever answers first gets it, but her complaint is about the ones who do not answer.' },
        ],
        answerKey: 'A',
        explanation:
          'The argument turns on what a group refusal actually is: not a "no" but an absence, which cannot carry a reason. Distractor D repeats a true observation from the same sentence while missing its point. When a paragraph contains an observation and a conclusion, the main idea is the conclusion.',
        takeaway: 'When an option quotes the passage accurately but sits one step short of its conclusion, it is a distractor.',
        level: 10,
        difficulty: 9.6,
      },
      {
        slug: 'read-corr-swap-q6',
        microSkill: 'reading.cohesion',
        prompt: 'In the phrase “I said no to the shift, not to you”, what distinction is being drawn?',
        options: [
          { key: 'A', text: 'Between refusing a request and rejecting the person making it', rationale: 'Correct: she separates the practical decision from what Dev appears to have read into it.' },
          { key: 'B', text: 'Between a formal refusal and an informal one', rationale: 'Formality is not at issue anywhere in the letter.' },
          { key: 'C', text: 'Between refusing that shift and refusing all future shifts', rationale: 'Scope over time is not what the sentence contrasts; the contrast is shift against person.' },
          { key: 'D', text: 'Between her decision and the scheduler’s decision', rationale: 'She takes the decision as hers throughout; no one else is credited with it.' },
        ],
        answerKey: 'A',
        explanation:
          'A "not X, but Y" or "X, not Y" construction always signals a distinction the writer thinks the reader has missed — which tells you what they believe was misread. Here the parallel objects, "the shift" and "you", locate the distinction precisely: a decision about a rota versus a judgement about a colleague.',
        takeaway: 'The two things placed either side of "not" are the distinction. Read them as a pair rather than reading the sentence straight through.',
        level: 9,
        difficulty: 8.8,
      },
    ],
  },

  {
    slug: 'read-corr-course-withdrawal',
    skill: 'reading',
    partType: 'reading.correspondence',
    title: 'A reply about withdrawing from a programme',
    level: 10,
    topic: 'education',
    body: `Dear Ms Okonjo,

Thank you for your message of 3 February. I want to answer the question you actually asked before I address the policy, because I think the policy has been getting in the way of the answer.

You asked whether withdrawing now would prevent you from being readmitted later. It would not. Readmission after a voluntary withdrawal is treated as a fresh application, and a completed withdrawal carries no academic penalty of any kind. The two-year currency limit you were told about applies to transferring credits into a new programme, which is a different question and only becomes relevant if you return after that point. Nobody has been evasive with you; you have been asking one question and receiving the answer to another.

On the fee refund, I am afraid the news is less good. The deadline for a partial refund passed on 21 January. I have looked at whether the change of instructor mid-term constitutes a material change to the programme, since that would open a discretionary route, and in my view it does not — the syllabus, the assessment structure and the contact hours are unchanged. I would rather tell you that plainly now than encourage an appeal I do not expect to succeed.

There is a third option that you have not raised and that I would encourage you to consider. A leave of absence holds your place for up to twelve months, requires no new application, and preserves your existing credits regardless of the currency limit. It does not refund the fees for this term either, but it does not spend them: a return within the year resumes the programme where you left it.

If you would like to talk any of this through, I hold open hours on Thursday afternoons and I do not need you to book.

Kind regards,
Simon Weatherall
Programme Director`,
    questions: [
      {
        slug: 'read-corr-withdrawal-q1',
        microSkill: 'reading.main_idea',
        prompt: 'What is the most accurate summary of this reply?',
        options: [
          { key: 'A', text: 'It corrects a misunderstanding, refuses one request, and proposes an option she had not considered', rationale: 'Correct: the three movements are readmission (corrected), the refund (refused), and the leave of absence (proposed).' },
          { key: 'B', text: 'It explains why the fee refund deadline cannot be extended', rationale: 'That is one paragraph of four, and the reply does not end there.' },
          { key: 'C', text: 'It encourages her to remain in the programme rather than withdraw', rationale: 'He never argues she should stay; he sets out what each route costs.' },
          { key: 'D', text: 'It apologises for the confusion caused by the two-year currency limit', rationale: 'He explicitly says nobody has been evasive, which is the opposite of an apology for it.' },
        ],
        answerKey: 'A',
        explanation:
          'Longer correspondence usually has a shape rather than a single topic, and options that name one paragraph are the standard trap. Track what the writer does in each: corrects, refuses, offers. A summary that omits any of the three is describing part of the letter.',
        takeaway: 'Summarise a long message by what it does in each part, not by which part is longest.',
        level: 10,
        difficulty: 9.4,
      },
      {
        slug: 'read-corr-withdrawal-q2',
        microSkill: 'reading.paraphrase',
        prompt: 'What does “you have been asking one question and receiving the answer to another” mean here?',
        options: [
          { key: 'A', text: 'Her question about readmission was being answered with information about credit transfer', rationale: 'Correct: readmission carries no penalty, while the two-year limit she was quoted governs transferring credits.' },
          { key: 'B', text: 'Staff have been avoiding her question because the answer is unfavourable', rationale: 'He states directly that nobody has been evasive.' },
          { key: 'C', text: 'She has been asking the wrong department about her situation', rationale: 'No department is mentioned as being the wrong one to ask.' },
          { key: 'D', text: 'Her question was too vague for anyone to answer usefully', rationale: 'He treats her question as clear; it is the answers that missed it.' },
        ],
        answerKey: 'A',
        explanation:
          'The paraphrase is anchored by the sentence immediately before it, which names both questions: readmission after withdrawal, and the currency limit for transferring credits. When a general remark follows a specific explanation, the explanation is what the remark refers to — read backwards, not forwards.',
        takeaway: 'A summarising sentence points back at what it summarises. Its evidence is above it, not below.',
        level: 10,
        difficulty: 9.7,
      },
      {
        slug: 'read-corr-withdrawal-q3',
        microSkill: 'reading.writer_purpose',
        prompt: 'Why does Weatherall explain that he considered the change of instructor as grounds for a discretionary refund?',
        options: [
          { key: 'A', text: 'To show that the refusal follows from an examination rather than from the deadline alone', rationale: 'Correct: reporting the route he tested establishes that the answer is considered, not merely administrative.' },
          { key: 'B', text: 'To suggest she could still appeal on those grounds if she wished', rationale: 'He says the opposite — he would rather not encourage an appeal he expects to fail.' },
          { key: 'C', text: 'To explain why the refund deadline is set at 21 January', rationale: 'The deadline’s rationale is never discussed.' },
          { key: 'D', text: 'To indicate that a different instructor may be assigned next term', rationale: 'Nothing about future teaching arrangements appears in the letter.' },
        ],
        answerKey: 'A',
        explanation:
          'Showing your working in a refusal is a purposeful act: it converts "no, the deadline passed" into "no, and here is the exception I looked for on your behalf". The three specifics he lists — syllabus, assessment, contact hours — are the evidence that the examination was real. Ask what a paragraph achieves that its absence would not.',
        takeaway: 'When a writer describes an option they rejected, they are usually establishing that their answer was considered rather than automatic.',
        level: 11,
        difficulty: 10.4,
      },
      {
        slug: 'read-corr-withdrawal-q4',
        microSkill: 'reading.literal_detail',
        prompt: 'What does a leave of absence preserve that a withdrawal does not?',
        options: [
          { key: 'A', text: 'Her existing credits and her place, without a new application', rationale: 'Correct: the paragraph states it holds her place for twelve months, needs no new application, and preserves credits regardless of the currency limit.' },
          { key: 'B', text: 'Her entitlement to a partial refund of this term’s fees', rationale: 'He says explicitly that it does not refund the fees either.' },
          { key: 'C', text: 'Her right to be readmitted without academic penalty', rationale: 'Withdrawal already carries no academic penalty, so this is not a difference between them.' },
          { key: 'D', text: 'Her access to open hours with the programme director', rationale: 'Open hours are offered to her regardless of what she decides.' },
        ],
        answerKey: 'A',
        explanation:
          'Comparison questions need both sides. C is true of a leave of absence but equally true of a withdrawal, so it is not something one preserves and the other does not. Before choosing, check the option against the other member of the comparison.',
        takeaway: 'In a comparison question, test each option against both things being compared. A shared feature is never the difference.',
        level: 9,
        difficulty: 8.6,
      },
      {
        slug: 'read-corr-withdrawal-q5',
        microSkill: 'reading.tone_attitude',
        prompt: 'Which phrase best characterises the writer’s handling of the unwelcome part of his answer?',
        options: [
          { key: 'A', text: 'Direct, and explicit about preferring plainness to false encouragement', rationale: 'Correct: "I would rather tell you that plainly now than encourage an appeal I do not expect to succeed" states the principle he is applying.' },
          { key: 'B', text: 'Apologetic, softening the refusal as much as the rules allow', rationale: 'He uses one mild phrase, "I am afraid", and then states the position without softening it.' },
          { key: 'C', text: 'Detached, treating the outcome as purely procedural', rationale: 'He investigated a discretionary route and offers an alternative, which is not detachment.' },
          { key: 'D', text: 'Cautious, leaving room to revisit the decision later', rationale: 'He forecloses the appeal rather than leaving it open.' },
        ],
        answerKey: 'A',
        explanation:
          'Tone is carried by the sentence in which a writer describes their own choice of approach, and that sentence is present here. "I am afraid" is a courtesy marker and not the tone of the paragraph; the tone is set by the refusal to encourage an appeal he thinks will fail.',
        takeaway: 'Politeness formulas are not tone. Find the sentence where the writer says why they are putting it this way.',
        level: 11,
        difficulty: 10.2,
      },
      {
        slug: 'read-corr-withdrawal-q6',
        microSkill: 'reading.inference',
        prompt: 'What does the closing line suggest about how the writer expects the conversation to continue?',
        options: [
          { key: 'A', text: 'He expects she may need to talk it through and wants to remove obstacles to that', rationale: 'Correct: naming a fixed time and waiving the booking requirement lowers the cost of coming to see him.' },
          { key: 'B', text: 'He expects a written reply setting out her decision', rationale: 'He offers conversation rather than asking for a decision in writing.' },
          { key: 'C', text: 'He considers the matter closed unless she appeals', rationale: 'An open invitation is inconsistent with treating the matter as closed.' },
          { key: 'D', text: 'He is directing her to a colleague who handles withdrawals', rationale: 'The open hours are his own; no one else is named.' },
        ],
        answerKey: 'A',
        explanation:
          '"I do not need you to book" is doing work beyond politeness: it removes a step, and steps are what stop people from following up on difficult news. Small procedural details in a closing often carry the writer’s expectation of what happens next.',
        takeaway: 'Read the closing for what it makes easier. Removing a requirement is a signal about what the writer anticipates.',
        level: 10,
        difficulty: 9.9,
      },
    ],
  },

  {
    slug: 'read-view-credential-recognition',
    skill: 'reading',
    partType: 'reading.viewpoints',
    title: 'Opinion: recognising qualifications earned elsewhere',
    level: 11,
    topic: 'work',
    body: `The standard account of foreign credential recognition is a story about paperwork. On this telling, a qualified engineer arrives, encounters an assessment body, waits eighteen months, pays several thousand dollars, and eventually receives a licence — and the problem is the eighteen months and the several thousand dollars. Shorten the queue, subsidise the fee, and the waste disappears.

I have come to think this account is not so much wrong as beside the point, and that acting on it produces reforms that measurably improve the process without changing very much about the outcome.

Consider what the assessment is actually doing. Almost every regulated profession assesses two different things under one heading: whether the applicant knows the subject, and whether they know how the subject is practised here. The first is largely portable — structural engineering does not change at a border — and it is also the part the existing process handles best, because credentials, transcripts and examinations are built for it. The second is not portable at all, and the existing process barely tests it, because there is no document that certifies familiarity with local codes, liability conventions, or the informal expectations of an inspector.

What fills the gap is the requirement for local experience. And here the reform agenda collides with something it cannot legislate: the experience requirement is satisfied by employers, not by regulators. A shorter assessment queue delivers a licensed engineer to a labour market that has not changed its mind about hiring someone whose references are all from another country. The bottleneck moves; it does not clear.

I want to be careful not to overstate this. Faster and cheaper assessment is a real gain, and dismissing it because it is insufficient would be the familiar mistake of treating the perfect as the enemy of the useful. Someone waiting eighteen months is losing eighteen months of earnings, and that loss is not made hypothetical by the existence of a further obstacle.

But if the object is to stop wasting the skills of people who already have them, the interventions that would matter most are the least discussed: paid bridging placements that generate the local references the market actually wants, employer-side incentives that are structured as risk-sharing rather than exhortation, and assessment bodies that separate the two judgements they currently blend, so that "not yet familiar with local practice" is recorded as what it is — a gap that six months of supervised work would close — rather than as a failure to qualify.

None of this is cheap, and none of it produces a press release as clean as a shorter queue. That is, I suspect, most of the explanation for which reforms get attempted.`,
    questions: [
      {
        slug: 'read-view-credential-q1',
        microSkill: 'reading.main_idea',
        prompt: 'What is the writer’s central claim?',
        options: [
          { key: 'A', text: 'Reforms aimed at the assessment process leave the real obstacle, employer hiring, untouched', rationale: 'Correct: the argument is that the bottleneck moves to employers rather than clearing.' },
          { key: 'B', text: 'Credential assessment takes too long and costs too much', rationale: 'That is the account the writer sets up in order to argue past it.' },
          { key: 'C', text: 'Foreign qualifications should be recognised automatically', rationale: 'The writer never proposes automatic recognition and treats local-practice knowledge as a real gap.' },
          { key: 'D', text: 'Regulated professions apply inconsistent standards across provinces', rationale: 'Inconsistency between jurisdictions is not discussed anywhere in the piece.' },
        ],
        answerKey: 'A',
        explanation:
          'The structure gives the answer: the first paragraph states a common view, the second rejects it as "beside the point", and the rest explains what it misses. B is the view being argued against, and mistaking the set-up for the thesis is the commonest error on opinion passages.',
        takeaway: 'A first paragraph that summarises a widely held view is usually the target of the argument, not the argument.',
        level: 11,
        difficulty: 10.6,
      },
      {
        slug: 'read-view-credential-q2',
        microSkill: 'reading.text_organisation',
        prompt: 'What is the function of the fifth paragraph, beginning “I want to be careful not to overstate this”?',
        options: [
          { key: 'A', text: 'It concedes real value in the reforms he has just criticised', rationale: 'Correct: he grants that faster, cheaper assessment is a genuine gain before returning to his case.' },
          { key: 'B', text: 'It introduces a second, unrelated argument', rationale: 'It returns to the same reforms rather than opening a new line.' },
          { key: 'C', text: 'It summarises the argument before the conclusion', rationale: 'Nothing is restated; something new is granted.' },
          { key: 'D', text: 'It anticipates an objection in order to dismiss it', rationale: 'The objection is accepted, not dismissed — the eighteen-month loss is called real.' },
        ],
        answerKey: 'A',
        explanation:
          'Concession and rebuttal look alike from a distance, and the difference is whether the point survives. Here it does: the loss "is not made hypothetical by the existence of a further obstacle". A rebuttal would have explained the point away.',
        takeaway: 'To tell a concession from a rebuttal, check whether the conceded point is still standing at the end of the paragraph.',
        level: 11,
        difficulty: 10.9,
      },
      {
        slug: 'read-view-credential-q3',
        microSkill: 'reading.inference',
        prompt: 'Why does the writer say “structural engineering does not change at a border”?',
        options: [
          { key: 'A', text: 'To establish that one of the two judgements being made is genuinely portable', rationale: 'Correct: it supports the claim that subject knowledge transfers, unlike knowledge of local practice.' },
          { key: 'B', text: 'To argue that engineering licences should be recognised internationally', rationale: 'He is separating two components of the assessment, not proposing mutual recognition.' },
          { key: 'C', text: 'To criticise assessment bodies for testing knowledge unnecessarily', rationale: 'He says the existing process handles that part best, which is praise rather than criticism.' },
          { key: 'D', text: 'To show that local codes are less important than technical knowledge', rationale: 'The rest of the argument insists local practice matters a great deal.' },
        ],
        answerKey: 'A',
        explanation:
          'The line sits inside a two-part contrast: portable subject knowledge against non-portable local practice. Its job is to make the first half undeniable so the second half carries the weight. An example placed inside a contrast almost always exists to fix one side of it.',
        takeaway: 'When an example appears mid-contrast, ask which side it is nailing down. That is its purpose.',
        level: 11,
        difficulty: 10.5,
      },
      {
        slug: 'read-view-credential-q4',
        microSkill: 'reading.vocabulary_in_context',
        prompt: 'In “The bottleneck moves; it does not clear”, what does the writer mean?',
        options: [
          { key: 'A', text: 'The constraint relocates from the regulator to the employer and continues to bind', rationale: 'Correct: a faster assessment delivers a licensed applicant into a market that still will not hire them.' },
          { key: 'B', text: 'The delay is transferred from one regulator to another', rationale: 'The second obstacle is the labour market, not a different regulator.' },
          { key: 'C', text: 'The problem becomes harder to see but smaller in scale', rationale: 'Nothing suggests the obstacle shrinks; the argument is that it persists at full strength.' },
          { key: 'D', text: 'Applicants abandon the process at a later stage than before', rationale: 'Where people give up is not discussed.' },
        ],
        answerKey: 'A',
        explanation:
          'The metaphor is precise and the preceding sentence names both ends of it: a queue that shortens at the regulator, and an employer who has not changed their mind. "Moves" and "clears" are opposed deliberately — relocation versus resolution.',
        takeaway: 'A metaphor in an argument is usually cashed out in the sentence beside it. Read that sentence rather than interpreting the image.',
        level: 11,
        difficulty: 10.7,
      },
      {
        slug: 'read-view-credential-q5',
        microSkill: 'reading.writer_purpose',
        prompt: 'What is the writer suggesting in the final sentence?',
        options: [
          { key: 'A', text: 'That reforms are chosen partly for how well they can be announced', rationale: 'Correct: the useful interventions lack "a press release as clean as a shorter queue", and he offers that as most of the explanation.' },
          { key: 'B', text: 'That the better interventions are too expensive to attempt', rationale: 'Cost is mentioned, but he identifies presentability as most of the explanation.' },
          { key: 'C', text: 'That policymakers are unaware of the alternatives he describes', rationale: 'He calls them least discussed rather than unknown, and blames incentives rather than ignorance.' },
          { key: 'D', text: 'That press coverage of the issue has been inaccurate', rationale: 'The press is invoked as a political incentive, not criticised for accuracy.' },
        ],
        answerKey: 'A',
        explanation:
          '"That is, I suspect, most of the explanation" attaches to the clause immediately before it — the press-release comparison — and the hedge marks it as the writer’s inference rather than an established fact. Both details matter: what the claim attaches to, and how strongly it is being made.',
        takeaway: 'A hedged final claim still has a definite referent. Identify what "that" points at before deciding what is being asserted.',
        level: 12,
        difficulty: 11.2,
      },
      {
        slug: 'read-view-credential-q6',
        microSkill: 'reading.tone_attitude',
        prompt: 'How does the writer treat the reforms he considers insufficient?',
        options: [
          { key: 'A', text: 'As real improvements that are wrongly treated as solutions', rationale: 'Correct: he calls faster assessment a real gain while arguing it does not reach the binding constraint.' },
          { key: 'B', text: 'As distractions that do more harm than good', rationale: 'He warns explicitly against dismissing them, which rules out treating them as harmful.' },
          { key: 'C', text: 'As sensible measures that simply need more funding', rationale: 'His argument is about what the measures reach, not about their scale.' },
          { key: 'D', text: 'As politically motivated gestures with no practical effect', rationale: 'He credits them with a measurable effect on the process; his objection is to what that effect leaves untouched.' },
        ],
        answerKey: 'A',
        explanation:
          'The piece is careful to hold two positions at once, and the options are built so that only one keeps both. The sentence about "the perfect as the enemy of the useful" exists precisely to block the reading in B and D. When a writer pre-empts a misreading, the misreading is usually a distractor.',
        takeaway: 'When a writer explicitly guards against an interpretation, expect that interpretation among the options.',
        level: 11,
        difficulty: 10.8,
      },
    ],
  },

  {
    slug: 'read-view-open-data-cameras',
    skill: 'reading',
    partType: 'reading.viewpoints',
    title: 'Opinion: publishing the speed camera data',
    level: 10,
    topic: 'community',
    body: `Our city publishes the location of every automated speed camera, updated weekly, on an open data portal. Every year or so somebody proposes stopping, and the argument is always the same: a driver who knows where the cameras are will slow down for them and speed up afterwards, so publication converts a safety programme into a revenue-neutral inconvenience.

I used to find this persuasive. I no longer do, and the reason is that the objection assumes the point of a camera is to catch people.

If the object is enforcement, then yes, concealment is more efficient. A hidden camera catches more drivers per week than a published one, and if the number of tickets issued is the measure, hiding them is obviously correct. But the number of tickets is a measure of failure, not of success. Nobody sets out to collect fines from a road where everyone is already driving at the limit; the fines exist to change the driving. A camera that everybody knows about, and that everybody slows down for, has achieved on that stretch of road exactly what it was installed to do.

The serious version of the objection is not about revenue but about the gaps — the acceleration after the camera, and the roads with no camera at all. That is a real effect and it is measurable. It is also an argument for more cameras and better placement, not for hiding the ones we have, and it is worth noticing that the same data that lets a driver plan around a camera lets a resident ask why their street does not have one. In the four years since publication began, three of the six new installations in this city started as neighbourhood requests citing the map. That is not a side benefit. That is the programme working through a route that concealment would close.

There is a further argument I hold more tentatively. Publication makes the enforcement legible, and legibility is what separates a rule from a trap. A driver who is ticketed by a camera they could have known about has been enforced against; a driver ticketed by one they could not have known about has been caught out. The behavioural difference may be small. The difference in whether people regard the system as legitimate is not, and a road safety programme that the public regards as a revenue exercise loses the political support it needs to be extended.

I would still concede the strongest counter-case. On a small number of roads — long, straight, and historically dangerous — the deterrent value of not knowing may genuinely exceed the value of legibility, and I would not fight a limited exception for them. What I would resist is the reverse presumption: that concealment is the default and publication the thing requiring justification. Where a rule is enforced automatically and at scale, the burden should sit with whoever wants it kept quiet.`,
    questions: [
      {
        slug: 'read-view-cameras-q1',
        microSkill: 'reading.main_idea',
        prompt: 'What is the writer’s position?',
        options: [
          { key: 'A', text: 'Camera locations should be published by default, with narrow exceptions', rationale: 'Correct: he defends publication, concedes a limited exception, and rejects concealment as the default.' },
          { key: 'B', text: 'Speed cameras are more effective when their locations are concealed', rationale: 'That is the objection he opens with and then argues against.' },
          { key: 'C', text: 'The city should install more cameras before deciding on publication', rationale: 'More cameras is a response to one objection, not his position on publication.' },
          { key: 'D', text: 'Fines from speed cameras should not be treated as revenue', rationale: 'He uses the revenue framing to make a point about measurement; it is not his conclusion.' },
        ],
        answerKey: 'A',
        explanation:
          'The final paragraph is where the position is stated most precisely: a limited exception is acceptable, but the presumption must favour publication. An answer that captures only the defence and not the qualification is a weaker summary than one that holds both.',
        takeaway: 'When a writer concedes an exception at the end, the exception belongs in your summary of their position.',
        level: 10,
        difficulty: 9.5,
      },
      {
        slug: 'read-view-cameras-q2',
        microSkill: 'reading.inference',
        prompt: 'Why does the writer describe the number of tickets as “a measure of failure”?',
        options: [
          { key: 'A', text: 'Because a ticket means the speeding it was meant to prevent still happened', rationale: 'Correct: the fines exist to change driving, so issuing one records that the change did not occur.' },
          { key: 'B', text: 'Because ticket revenue is unreliable as a source of funding', rationale: 'Funding reliability is never discussed.' },
          { key: 'C', text: 'Because many tickets are successfully appealed', rationale: 'Appeals do not appear in the passage.' },
          { key: 'D', text: 'Because tickets are issued disproportionately on a few roads', rationale: 'Distribution across roads is raised in a different argument, about gaps.' },
        ],
        answerKey: 'A',
        explanation:
          'The inference turns on the stated purpose: "the fines exist to change the driving". If prevention is the goal, each ticket records an instance where prevention did not happen. Inference questions on argument passages are usually solved by locating the stated purpose and reasoning from it.',
        takeaway: 'When a writer redefines a measure, find the goal they are measuring against. The redefinition follows from it.',
        level: 10,
        difficulty: 9.8,
      },
      {
        slug: 'read-view-cameras-q3',
        microSkill: 'reading.literal_detail',
        prompt: 'What does the writer report about the six new camera installations?',
        options: [
          { key: 'A', text: 'Three began as neighbourhood requests that cited the published map', rationale: 'Correct: three of the six are attributed to residents using the open data.' },
          { key: 'B', text: 'All six were placed on roads with a history of collisions', rationale: 'Collision history is mentioned only for the exception in the final paragraph.' },
          { key: 'C', text: 'Three were removed after residents objected to their placement', rationale: 'No removals are described anywhere.' },
          { key: 'D', text: 'Six were requested but only three were approved', rationale: 'All six were installed; three of them originated as requests.' },
        ],
        answerKey: 'A',
        explanation:
          'Distractor D reuses both numbers in a plausible but different relation. Numeric detail in an argument is worth re-reading in the source rather than reconstructing from memory, because a distractor only has to reorder the figures to look right.',
        takeaway: 'With two numbers in one sentence, confirm the relation between them, not just the values.',
        level: 8,
        difficulty: 7.8,
      },
      {
        slug: 'read-view-cameras-q4',
        microSkill: 'reading.text_organisation',
        prompt: 'What does the writer do with the objection about drivers speeding up after a camera?',
        options: [
          { key: 'A', text: 'He accepts it as real and argues it points to a different remedy', rationale: 'Correct: he calls it real and measurable, then treats it as an argument for more and better-placed cameras.' },
          { key: 'B', text: 'He dismisses it as unsupported by evidence', rationale: 'He explicitly calls the effect measurable.' },
          { key: 'C', text: 'He argues it applies equally to hidden cameras', rationale: 'That comparison is never made.' },
          { key: 'D', text: 'He treats it as the strongest argument against his position', rationale: 'He calls it the serious version of the objection but reserves the strongest counter-case for the final paragraph.' },
        ],
        answerKey: 'A',
        explanation:
          'Redirecting an objection — accepting the fact and disputing what follows from it — is a distinct move from rejecting it, and D is the subtle distractor here because "the serious version" sounds superlative without being one. Read on: the phrase "the strongest counter-case" appears later and attaches to something else.',
        takeaway: 'Superlatives are anchors. If an option claims something is the strongest point, find where the passage actually says so.',
        level: 11,
        difficulty: 10.3,
      },
      {
        slug: 'read-view-cameras-q5',
        microSkill: 'reading.paraphrase',
        prompt: 'What distinction is drawn between being “enforced against” and being “caught out”?',
        options: [
          { key: 'A', text: 'Whether the driver could have known the rule was being enforced there', rationale: 'Correct: the difference is knowability, which is what publication supplies.' },
          { key: 'B', text: 'Whether the penalty issued is proportionate to the offence', rationale: 'Proportionality of penalties is not discussed.' },
          { key: 'C', text: 'Whether the driver was speeding deliberately or inadvertently', rationale: 'Intent is not the basis of the distinction; foreknowledge is.' },
          { key: 'D', text: 'Whether the camera was operating within its legal authority', rationale: 'Legality of the cameras is never questioned.' },
        ],
        answerKey: 'A',
        explanation:
          'The two clauses are built in parallel and differ in exactly one element: "could have known about" versus "could not have known about". Where a writer constructs a minimal pair, the single varying element is the distinction they are drawing.',
        takeaway: 'Find the one thing that differs between two parallel clauses. That difference is the point being made.',
        level: 10,
        difficulty: 9.9,
      },
      {
        slug: 'read-view-cameras-q6',
        microSkill: 'reading.writer_purpose',
        prompt: 'What is the purpose of the final sentence about where the burden should sit?',
        options: [
          { key: 'A', text: 'To shift what needs justifying, rather than to rule concealment out entirely', rationale: 'Correct: having allowed an exception, he insists the presumption favours publication and concealment must be argued for.' },
          { key: 'B', text: 'To argue that automatic enforcement should be reduced in scale', rationale: 'He treats scale as a reason for transparency, not as something to reduce.' },
          { key: 'C', text: 'To propose that the public vote on camera placement', rationale: 'No voting mechanism is suggested.' },
          { key: 'D', text: 'To withdraw the exception he made in the preceding sentence', rationale: 'The exception stands; he says he would not fight it.' },
        ],
        answerKey: 'A',
        explanation:
          'The move is about presumption rather than prohibition, and the passage marks it: "What I would resist is the reverse presumption". A writer who concedes and then restates the default is defining how much ground the concession costs them.',
        takeaway: 'Watch for arguments about where the burden of proof sits. They allow a writer to concede a case without conceding the principle.',
        level: 11,
        difficulty: 10.6,
      },
    ],
  },

  {
    slug: 'read-diag-clinic-eligibility',
    skill: 'reading',
    partType: 'reading.diagram',
    title: 'Applying a clinic eligibility table',
    level: 9,
    topic: 'health',
    figure: {
      kind: 'table',
      caption: 'Northline Community Clinic — walk-in eligibility and fees',
      columns: ['Service', 'Referral needed', 'Provincial card', 'Fee without card', 'Same-day slots', 'Notes'],
      rows: [
        ['General walk-in', 'No', 'Accepted', '$70', 'Yes', 'Closes to new arrivals at 4:00 p.m.'],
        ['Minor injury', 'No', 'Accepted', '$110', 'Yes', 'X-ray on site Tue and Thu only'],
        ['Travel advice', 'No', 'Not covered', '$95', 'No', 'Book at least 3 weeks before travel'],
        ['Physiotherapy', 'Yes', 'Partially', '$130', 'No', 'Referral valid for 6 months'],
        ['Prenatal check', 'No', 'Accepted', 'Not offered', 'Yes', 'Card required; no private option'],
        ['Mental health drop-in', 'No', 'Accepted', 'Free', 'Yes', 'Ages 16+, 1:00–7:00 p.m. Wed only'],
      ],
      note: 'A provincial card must be presented at the desk; a photograph of a card is not accepted. Fees without a card are payable on the day.',
    },
    body: `Hi Amara,

I have pasted the clinic table below because I keep giving people the wrong information about it and I would rather you read it yourself than take my summary of it.

Your situation, as I understand it: you arrive on the 14th, which is a Wednesday, and your provincial card has been applied for but not yet issued. You mentioned the ankle, which has been bothering you since the move, and you also wanted to ask someone about the travel injections for the trip in August. Read the table before you go rather than after, because two of these will not work the way you expect, and one of them cannot be fixed on the day.

The thing that catches everyone is the difference between a service accepting the card and a service being available without one. Those are separate columns and they do not mean the same thing. A service can accept the card and still be perfectly available to someone paying out of pocket; another can accept it and have no private option at all.

I would also say — do not rely on the photograph of your application confirmation, however official it looks. I watched them turn someone away at the desk for exactly that last month, and she had travelled across the city to get there.

If it turns out you need to come back on a different day, tell me and I will drive you.

Kishore`,
    questions: [
      {
        slug: 'read-diag-clinic-q1',
        microSkill: 'reading.information_matching',
        prompt: 'Amara arrives on Wednesday the 14th without her card in hand. Which service can she use at no cost?',
        options: [
          { key: 'A', text: 'Mental health drop-in', rationale: 'Correct: it is free regardless of card, has same-day slots, and runs on Wednesdays between 1:00 and 7:00 p.m.' },
          { key: 'B', text: 'General walk-in', rationale: 'Available that day, but without a card presented at the desk it costs $70.' },
          { key: 'C', text: 'Prenatal check', rationale: 'Accepts the card but has no private option, so without a card it is not available at all.' },
          { key: 'D', text: 'Minor injury', rationale: 'Same-day slots exist, but the fee without a card is $110.' },
        ],
        answerKey: 'A',
        explanation:
          'Three conditions have to hold together: no cost without a card, available that day, and available on a Wednesday. Applying them one at a time in the order that eliminates most rows is far faster than reading each row in full. Note that "Accepted" in the card column tells you nothing about what happens when you have no card — the fee column does.',
        takeaway: 'In an eligibility table, decide which column answers the question before you start reading rows.',
        level: 9,
        difficulty: 8.5,
      },
      {
        slug: 'read-diag-clinic-q2',
        microSkill: 'reading.literal_detail',
        prompt: 'What will happen if Amara presents a photograph of her card application?',
        options: [
          { key: 'A', text: 'It will not be accepted; only a physical card counts', rationale: 'Correct: the note states a photograph of a card is not accepted, and Kishore confirms he saw it refused.' },
          { key: 'B', text: 'It will be accepted for services that list the card as “Accepted”', rationale: 'The note admits no exceptions by service.' },
          { key: 'C', text: 'It will be accepted if she also pays a deposit', rationale: 'No deposit arrangement appears anywhere.' },
          { key: 'D', text: 'It will be accepted only for the mental health drop-in', rationale: 'That service is free regardless, so no card question arises for it.' },
        ],
        answerKey: 'A',
        explanation:
          'The governing rule is in the note under the table, not in any row. Learners who read only the grid miss conditions that apply across every row — and notes are where those conditions almost always live.',
        takeaway: 'Read the note under a table before the rows. It usually contains the rules that override them.',
        level: 8,
        difficulty: 7.4,
      },
      {
        slug: 'read-diag-clinic-q3',
        microSkill: 'reading.information_matching',
        prompt: 'Amara wants the travel advice appointment for a trip in August. What does the table require?',
        options: [
          { key: 'A', text: 'Booking at least three weeks ahead, and paying $95 as it is not covered', rationale: 'Correct: no same-day slots, a three-week lead time, and no provincial coverage.' },
          { key: 'B', text: 'A referral, since travel services are not walk-in', rationale: 'The referral column reads “No” for travel advice.' },
          { key: 'C', text: 'Attending on a Tuesday or Thursday when imaging is available', rationale: 'Those days apply to X-ray for minor injuries, not to travel advice.' },
          { key: 'D', text: 'Nothing beyond arriving before 4:00 p.m.', rationale: 'The 4:00 p.m. cut-off belongs to the general walk-in row.' },
        ],
        answerKey: 'A',
        explanation:
          'Every distractor here is a true fact taken from the wrong row, which is the characteristic error in table questions: the eye finds a plausible constraint and stops before checking which service it belongs to. Anchor on the row first, then read across.',
        takeaway: 'In a table, fix the row before you read any condition. Most wrong answers are right facts from the wrong line.',
        level: 9,
        difficulty: 8.8,
      },
      {
        slug: 'read-diag-clinic-q4',
        microSkill: 'reading.inference',
        prompt: 'Kishore says two things “will not work the way you expect”. Which two is he most likely referring to?',
        options: [
          { key: 'A', text: 'The travel advice, which cannot be same-day, and the fees, because her card is not issued', rationale: 'Correct: she plans to ask about injections on the day, which is not possible, and expects coverage she cannot yet claim.' },
          { key: 'B', text: 'The ankle, which needs a referral, and the travel advice, which needs one too', rationale: 'Neither requires a referral; minor injury and travel advice both read “No”.' },
          { key: 'C', text: 'The Wednesday hours and the 4:00 p.m. closing time for new arrivals', rationale: 'Both are real constraints, but neither conflicts with what she has said she plans to do.' },
          { key: 'D', text: 'The X-ray availability and the prenatal check', rationale: 'She has not mentioned a prenatal appointment at all.' },
        ],
        answerKey: 'A',
        explanation:
          'The question requires holding the message and the table together: his warning is only meaningful against what Amara said she intends. She named the ankle and the injections, and she has no card yet — so the mismatches are the same-day assumption and the coverage assumption.',
        takeaway: 'When a message points at a table, the answer usually lies where the writer’s stated plan collides with a listed condition.',
        level: 10,
        difficulty: 9.6,
      },
      {
        slug: 'read-diag-clinic-q5',
        microSkill: 'reading.literal_detail',
        prompt: 'If Amara comes for her ankle and needs an X-ray, when should she attend?',
        options: [
          { key: 'A', text: 'Tuesday or Thursday, when imaging is on site', rationale: 'Correct: the minor injury row restricts X-ray to those two days.' },
          { key: 'B', text: 'Any weekday before 4:00 p.m.', rationale: 'The 4:00 p.m. limit governs the general walk-in, and it does not make imaging available.' },
          { key: 'C', text: 'Wednesday, when the clinic runs its drop-in hours', rationale: 'Wednesday afternoon hours belong to the mental health drop-in.' },
          { key: 'D', text: 'Any day, with a referral arranged in advance', rationale: 'Minor injury needs no referral, and a referral would not change the imaging days.' },
        ],
        answerKey: 'A',
        explanation:
          'This is deliberately in tension with the Wednesday arrival in the message: the table does not bend to the plan. Table questions frequently test whether you will report what the grid says rather than what the surrounding text makes convenient.',
        takeaway: 'The table is the authority. When the message and the grid disagree, answer from the grid.',
        level: 8,
        difficulty: 7.6,
      },
      {
        slug: 'read-diag-clinic-q6',
        microSkill: 'reading.scanning_speed',
        prompt: 'Which service is the only one that cannot be obtained without a provincial card at any price?',
        options: [
          { key: 'A', text: 'Prenatal check', rationale: 'Correct: its fee column reads “Not offered” and the note says there is no private option.' },
          { key: 'B', text: 'Physiotherapy', rationale: 'Only partially covered, but available for $130 without a card.' },
          { key: 'C', text: 'Travel advice', rationale: 'Not covered by the card at all, and available to anyone for $95.' },
          { key: 'D', text: 'Mental health drop-in', rationale: 'Free to everyone, so no card is needed.' },
        ],
        answerKey: 'A',
        explanation:
          'One column answers this entirely: scan "Fee without card" for a value that is not a price. "Not offered" is the only entry of that kind. Choosing the column that can contain the answer, then reading it top to bottom, is far quicker than evaluating six rows.',
        takeaway: 'For “which one cannot” questions, scan the single column where an exception would have to appear.',
        level: 8,
        difficulty: 7.9,
      },
    ],
  },

  {
    slug: 'read-diag-tenancy-notice',
    skill: 'reading',
    partType: 'reading.diagram',
    title: 'Applying a notice period table',
    level: 10,
    topic: 'housing',
    figure: {
      kind: 'table',
      caption: 'Notice periods by reason and tenancy type',
      columns: ['Reason for ending tenancy', 'Fixed term', 'Month to month', 'Compensation owed', 'Tenant may dispute'],
      rows: [
        ['Landlord’s own use', 'End of term only', '3 months', '1 month’s rent', 'Yes, within 30 days'],
        ['Major renovation', 'End of term only', '4 months', '1 month’s rent', 'Yes, within 30 days'],
        ['Sale to a buyer who will occupy', 'End of term only', '3 months', '1 month’s rent', 'Yes, within 15 days'],
        ['Unpaid rent', 'Any time', '10 days', 'None', 'Yes, within 5 days'],
        ['Tenant ends tenancy', 'End of term only', '1 full rental month', 'None', 'Not applicable'],
        ['Agreed early end', 'By agreement', 'By agreement', 'By agreement', 'Not applicable'],
      ],
      note: 'Notice must be given in writing and takes effect on the last day of a rental month unless the reason is unpaid rent. A dispute filed within the stated window suspends the notice until the hearing.',
    },
    body: `Ola,

Here is the table I mentioned on the phone. Read the whole thing rather than the row that looks like your situation, because the row you need depends on a distinction you may not have made yet.

Yours is month to month. You signed the twelve-month term in 2022 and it rolled over at the end of it, so the fixed-term column does not apply to you any more, whatever the original agreement says on its front page. People get this wrong constantly and then plan around a rule that stopped applying to them years ago.

Two things you asked about. First, they told you verbally on the 2nd, and you wanted to know whether that started the clock. Second, they have mentioned both renovating and possibly selling. Those are not the same thing on this table: they carry different notice periods and, more importantly for you, different windows in which you can challenge the notice. Whichever reason they eventually put in writing is the one that governs, so it is worth knowing now which of the two you are dealing with.

One more thing. Do not sign anything about an agreed early end until you have worked out what you would be entitled to without agreeing. An agreement can be a perfectly good outcome, but it should be a decision made against a number, not instead of one.

Femi`,
    questions: [
      {
        slug: 'read-diag-tenancy-q1',
        microSkill: 'reading.information_matching',
        prompt: 'If Ola’s landlord proceeds on the basis of a major renovation, what notice and compensation apply?',
        options: [
          { key: 'A', text: 'Four months’ notice and one month’s rent', rationale: 'Correct: the renovation row gives four months for a month-to-month tenancy, with one month’s rent in compensation.' },
          { key: 'B', text: 'Three months’ notice and one month’s rent', rationale: 'Three months applies to the landlord’s own use and to a sale, not to renovation.' },
          { key: 'C', text: 'Notice at the end of the term only, with no compensation', rationale: 'The end-of-term rule is the fixed-term column, which Femi says no longer applies to her.' },
          { key: 'D', text: 'Four months’ notice with no compensation', rationale: 'The notice period is right but compensation of one month’s rent is owed.' },
        ],
        answerKey: 'A',
        explanation:
          'Two coordinates are needed — the reason (renovation) and the tenancy type (month to month) — and the message supplies the second. Distractor C is the value from the wrong column, which is the standard failure when a table has one column that does not apply to the reader.',
        takeaway: 'Establish which column applies to you before reading any row. Half the wrong answers live in the column you should be ignoring.',
        level: 9,
        difficulty: 8.7,
      },
      {
        slug: 'read-diag-tenancy-q2',
        microSkill: 'reading.literal_detail',
        prompt: 'What does the table say about notice given verbally on the 2nd?',
        options: [
          { key: 'A', text: 'It does not count, because notice must be in writing', rationale: 'Correct: the note requires written notice, so a verbal statement starts no clock.' },
          { key: 'B', text: 'It counts from the 2nd, since the reason determines the period', rationale: 'The reason sets the length, not whether an invalid notice counts at all.' },
          { key: 'C', text: 'It counts from the end of that rental month', rationale: 'That rule governs when valid notice takes effect, not whether verbal notice is valid.' },
          { key: 'D', text: 'It counts only if the tenant does not dispute it within 30 days', rationale: 'The dispute window applies to notices that exist; this one does not.' },
        ],
        answerKey: 'A',
        explanation:
          'Distractors B, C and D are all real rules from the note and the table, applied to a notice that never became valid. Check whether a rule is triggered before applying it — an invalid notice does not reach the questions about timing or disputes.',
        takeaway: 'Rules apply in order. Validity comes first; timing and remedies only matter once something is valid.',
        level: 10,
        difficulty: 9.3,
      },
      {
        slug: 'read-diag-tenancy-q3',
        microSkill: 'reading.information_matching',
        prompt: 'Which reason gives a tenant the shortest window to dispute?',
        options: [
          { key: 'A', text: 'Unpaid rent, at five days', rationale: 'Correct: five days is the shortest dispute window in the table.' },
          { key: 'B', text: 'Sale to a buyer who will occupy, at fifteen days', rationale: 'Shorter than thirty, but not the shortest.' },
          { key: 'C', text: 'Major renovation, at thirty days', rationale: 'Thirty days is the longest window listed.' },
          { key: 'D', text: 'Agreed early end, which has no window', rationale: '“Not applicable” means the question does not arise, which is not the same as a short window.' },
        ],
        answerKey: 'A',
        explanation:
          'D tests whether "not applicable" is read as a value. An absent category cannot be the smallest member of a comparison; only rows with an actual number are candidates. Scan the dispute column, discard the non-numeric entries, then compare.',
        takeaway: '“Not applicable” is not zero. Exclude it before comparing, or it will look like an extreme.',
        level: 9,
        difficulty: 8.4,
      },
      {
        slug: 'read-diag-tenancy-q4',
        microSkill: 'reading.inference',
        prompt: 'Why does Femi warn Ola not to agree to an early end before working out her position?',
        options: [
          { key: 'A', text: 'Agreeing replaces entitlements the table would otherwise guarantee', rationale: 'Correct: the agreed row makes notice and compensation matters of agreement, so fixed entitlements no longer apply.' },
          { key: 'B', text: 'An agreed end cannot be disputed once the hearing is scheduled', rationale: 'Disputes are marked not applicable because there is no imposed notice, not because a hearing bars them.' },
          { key: 'C', text: 'An agreed end requires four months’ notice regardless of reason', rationale: 'The row specifies “By agreement” in every column, including notice.' },
          { key: 'D', text: 'She would lose the right to give her own notice later', rationale: 'Nothing in the table removes the tenant’s own notice option.' },
        ],
        answerKey: 'A',
        explanation:
          'The whole row reads "By agreement", which means every protection in the other rows becomes negotiable. The inference is about what a row does not contain — a defined entitlement — and that absence is the point Femi is making.',
        takeaway: 'When a row replaces fixed values with “by agreement”, read it as the removal of a guarantee, not as flexibility.',
        level: 11,
        difficulty: 10.4,
      },
      {
        slug: 'read-diag-tenancy-q5',
        microSkill: 'reading.literal_detail',
        prompt: 'What effect does filing a dispute within the stated window have?',
        options: [
          { key: 'A', text: 'The notice is suspended until the hearing takes place', rationale: 'Correct: the note states a dispute filed in time suspends the notice until the hearing.' },
          { key: 'B', text: 'The notice is cancelled and the landlord must start again', rationale: 'It is suspended pending a hearing, not cancelled.' },
          { key: 'C', text: 'The compensation owed to the tenant doubles', rationale: 'Compensation is unaffected by a dispute.' },
          { key: 'D', text: 'The notice period is extended by the length of the window', rationale: 'No extension mechanism is described.' },
        ],
        answerKey: 'A',
        explanation:
          'Suspension and cancellation are different outcomes, and B is the reading that a hurried eye produces. Precise verbs in procedural text carry precise consequences; substituting a stronger one changes the answer.',
        takeaway: 'In procedural text, note the exact verb — suspend, cancel, extend, void. They are not interchangeable.',
        level: 9,
        difficulty: 8.9,
      },
      {
        slug: 'read-diag-tenancy-q6',
        microSkill: 'reading.scanning_speed',
        prompt: 'For which reasons is compensation of one month’s rent owed?',
        options: [
          { key: 'A', text: 'Landlord’s own use, major renovation, and sale to an occupying buyer', rationale: 'Correct: those three rows all show one month’s rent in the compensation column.' },
          { key: 'B', text: 'Every reason except unpaid rent', rationale: 'Tenant-ended and agreed-end tenancies also carry no fixed compensation.' },
          { key: 'C', text: 'Only where the tenancy is month to month', rationale: 'The compensation column does not vary by tenancy type.' },
          { key: 'D', text: 'Landlord’s own use and major renovation only', rationale: 'The sale row also shows one month’s rent.' },
        ],
        answerKey: 'A',
        explanation:
          'One column, read top to bottom, answers this completely. D is the near-miss produced by stopping one row early — the commonest scanning error, and the reason it is worth reading to the bottom of a column even after you think you have the set.',
        takeaway: 'When collecting every row that matches, read the whole column. Stopping early is what near-miss distractors are built from.',
        level: 8,
        difficulty: 7.7,
      },
    ],
  },
];
