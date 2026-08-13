import type { SeedLesson } from './types';

/**
 * Lessons.
 *
 * Every lesson is built around one transferable move, not a topic. The
 * structure follows a retrieval-first pattern: a short explanation, a worked
 * contrast the learner evaluates, then a checkpoint that requires recall
 * before the next idea is introduced. Nothing here is longer than nine
 * minutes, because a lesson that cannot be completed between two practice sets
 * will not be completed at all.
 *
 * Lesson slugs are referenced directly by the writing and speaking analysers:
 * when a dimension comes back low, the coaching links to the lesson that
 * remediates it.
 */
export const lessons: SeedLesson[] = [
  {
    slug: 'develop-a-point',
    title: 'Turning a claim into support',
    summary:
      'The single most common ceiling between CLB 8 and CLB 10 is a response full of correct opinions and empty of support. This is the fix.',
    skill: 'writing',
    microSkills: ['writing.development', 'speaking.development'],
    level: 8,
    minutes: 7,
    blocks: [
      {
        type: 'prose',
        text: 'Most responses that stall around CLB 8 are not wrong. They are thin. The writer states a position, states a reason, and moves on — and each point occupies one sentence. A reader sees a list of opinions rather than an argument.',
      },
      {
        type: 'principle',
        text: 'A supported point has four parts: the claim, the reason, an instance, and the consequence. Three sentences, not one.',
      },
      {
        type: 'example',
        label: 'The same point, twice',
        weak: 'More frequent buses would be better for the city because more people would use them.',
        strong:
          'More frequent buses would change who uses transit at all. When a bus comes every eight minutes, you stop consulting a timetable and simply walk to the stop — which is the point at which people without a car stop planning their day around one route. My neighbour gave up her second car the month the 14 went to ten-minute service.',
        why: 'The strong version names the mechanism (you stop consulting a timetable), states the consequence (people stop planning around one route), and grounds it in an instance. It is not longer because it says more things; it is longer because it explains one thing.',
      },
      {
        type: 'callout',
        tone: 'insight',
        text: 'If you cannot say “which means…” after your reason, you have not finished the point.',
      },
      {
        type: 'checkpoint',
        question:
          'Which continuation best develops the claim “Fixed office days work better than flexible ones”?',
        options: [
          {
            text: 'They are more organised and everyone knows what to expect.',
            correct: false,
            feedback:
              'This restates the claim in different words. “More organised” is an evaluation, not a mechanism.',
          },
          {
            text: 'The value of coming in depends entirely on who else is there, so a day that is optional for everyone is empty for everyone — I have sat in a four-person office on a Tuesday that was meant to be a team day.',
            correct: true,
            feedback:
              'This names the mechanism (value depends on co-presence), draws the consequence, and grounds it in an instance.',
          },
          {
            text: 'Many companies have adopted fixed days recently and studies suggest it helps.',
            correct: false,
            feedback:
              'An appeal to what others do is not development of your own reasoning, and vague references to studies weaken rather than strengthen.',
          },
        ],
      },
      {
        type: 'drill',
        instruction:
          'For each claim, write one sentence beginning “which means…” that states the consequence. Say it aloud before you write it.',
        items: [
          {
            prompt: 'Libraries should stay open later on weekdays.',
            answer:
              'which means people finishing an evening shift would have somewhere to go that is neither home nor a paid space',
            note: 'Name who benefits and what changes for them.',
          },
          {
            prompt: 'New employees should shadow someone for their first week.',
            answer:
              'which means the questions they do not yet know how to ask get answered before they become mistakes',
            note: 'The best consequences describe a problem that never happens.',
          },
          {
            prompt: 'Schools should teach basic contract literacy.',
            answer:
              'which means a first rental agreement stops being the document where people learn what a clause costs',
            note: 'A specific situation beats a general benefit.',
          },
        ],
      },
    ],
  },

  {
    slug: 'information-flow',
    title: 'Given before new',
    summary:
      'Cohesion at the top bands comes from the order of information, not from adding connectors. This lesson teaches the ordering rule.',
    skill: 'writing',
    microSkills: ['writing.coherence', 'speaking.coherence'],
    level: 9,
    minutes: 8,
    blocks: [
      {
        type: 'prose',
        text: 'Learners who have been told their writing "does not flow" usually respond by adding connectors: however, moreover, furthermore. The result reads worse, because the problem was never a missing signpost. It was that each sentence started with something the reader had not met yet.',
      },
      {
        type: 'principle',
        text: 'Start a sentence with information the reader already has. End it with the new information. The next sentence then starts from that new information, which has just become given.',
      },
      {
        type: 'compare',
        heading: 'Same content, two orders',
        leftLabel: 'New first — reader stalls',
        rightLabel: 'Given first — reader flows',
        rows: [
          {
            left: 'A shortage of qualified operators is the reason for the reduction. Scheduling practices that make the job unattractive are what the union blames.',
            right: 'The reduction is caused by a shortage of qualified operators. That shortage, the union argues, comes from scheduling practices that make the job unattractive.',
          },
          {
            left: 'Fifteen minutes before your appointment is when you should arrive. The intake form is the reason.',
            right: 'Please arrive fifteen minutes early. That time is for the intake form, which takes about that long to complete.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'Connector spam is visible: three “however”s in a 180-word response is a marker, not a style.',
      },
      {
        type: 'checkpoint',
        question:
          'You have just written: “The deposit was paid in full on 3 March.” Which sentence continues best?',
        options: [
          {
            text: 'Half of the flooring remains unfinished, and no one has attended the site for eight days.',
            correct: false,
            feedback:
              'True and relevant, but it starts from new information. The link to the deposit has to be made by the reader.',
          },
          {
            text: 'That payment covered the materials and the first phase of labour, neither of which has been completed.',
            correct: true,
            feedback:
              'It opens with “that payment” — the given — and ends with what is new. The reader never has to reconstruct the connection.',
          },
          {
            text: 'However, the work is still not finished.',
            correct: false,
            feedback:
              'The connector is doing work the ordering should do, and “however” signals a contrast that was not set up.',
          },
        ],
      },
      {
        type: 'drill',
        instruction:
          'Rewrite each pair so the second sentence opens with the given information.',
        items: [
          {
            prompt:
              'The gate is left open after evening programmes. My neighbour’s dog reacts to the noise from the car park.',
            answer:
              'The gate is left open after evening programmes. That open gate is what carries the car park noise across to my neighbour’s dog.',
          },
          {
            prompt:
              'I enrolled for the supervised practice sessions. The online format has no practice sessions at all.',
            answer:
              'I enrolled for the supervised practice sessions. Those sessions are exactly what the online format removes.',
          },
        ],
      },
    ],
  },

  {
    slug: 'register-control',
    title: 'Holding one register',
    summary:
      'A register slip is one of the fastest things to fix and one of the most visible things to a reader. Decide the reader, then hold the level.',
    skill: 'writing',
    microSkills: ['writing.register', 'speaking.register', 'vocabulary.register_fit'],
    level: 8,
    minutes: 6,
    blocks: [
      {
        type: 'prose',
        text: 'Register is not politeness. It is consistency. A message that opens formally and drifts into casual phrasing halfway through reads as less controlled than one that is casual throughout, because the drift tells the reader the writer was not in charge of the choice.',
      },
      {
        type: 'compare',
        heading: 'Three levels, same message',
        leftLabel: 'Casual',
        rightLabel: 'Formal',
        rows: [
          { left: "I can't make it work with the new schedule.", right: 'The new schedule is not workable for me.' },
          { left: 'Thanks a lot for sorting this out!', right: 'Thank you for arranging this.' },
          { left: "Let me know if that's okay.", right: 'Please confirm whether this arrangement is acceptable.' },
          { left: 'It was a huge problem for us.', right: 'This created a substantial difficulty for the team.' },
        ],
      },
      {
        type: 'principle',
        text: 'Choose the register from the relationship, not from the topic. You write formally to a landlord about a small matter and informally to a friend about a serious one.',
      },
      {
        type: 'checkpoint',
        question:
          'You are writing to a course provider about a refund. Which sentence breaks register?',
        options: [
          {
            text: 'I enrolled specifically for the in-person practice component.',
            correct: false,
            feedback: 'Consistent with a formal complaint.',
          },
          {
            text: 'The credit you have offered does not address the reason I booked the course.',
            correct: false,
            feedback: 'Direct and formal — appropriate.',
          },
          {
            text: 'Honestly, a credit is not really going to cut it for me.',
            correct: true,
            feedback:
              '“Honestly”, “not really” and “cut it” are all conversational. The point is fine; the level is wrong.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'insight',
        text: 'One pass, one job: after drafting, read only for contractions and casual verbs. Do not edit anything else on that pass.',
      },
    ],
  },

  {
    slug: 'sentence-combining',
    title: 'Sentence combining',
    summary:
      'Variety is not decoration. Combining sentences shows the reader which idea is the main one and which is supporting.',
    skill: 'writing',
    microSkills: ['writing.sentence_variety', 'grammar.clause_structure'],
    level: 9,
    minutes: 7,
    blocks: [
      {
        type: 'prose',
        text: 'A run of similar-length sentences flattens emphasis: everything sounds equally important, so nothing does. Combining is how you tell the reader which claim is the point and which is the background to it.',
      },
      {
        type: 'principle',
        text: 'Put the idea you want the reader to keep in the main clause. Everything else becomes a subordinate clause, a participial phrase, or a modifier.',
      },
      {
        type: 'example',
        label: 'Three short, one shaped',
        weak:
          'The permit was renewed online. It was applied to the wrong plate. A ticket was issued on Tuesday.',
        strong:
          'Although the permit was renewed online three weeks ago, it was applied to a plate I no longer own, and a ticket was issued on Tuesday as a result.',
        why: 'The renewal becomes background (although…), the wrong plate becomes the cause, and the ticket becomes the outcome. The sentence now has a shape that matches the argument.',
      },
      {
        type: 'drill',
        instruction: 'Combine each set into one sentence, keeping the last idea as the main clause.',
        items: [
          {
            prompt: 'The hall was left unprogrammed. Staff expected it to be empty. Attendance doubled.',
            answer:
              'Although staff expected the unprogrammed hall to sit empty, attendance eventually doubled.',
          },
          {
            prompt: 'I gave three weeks notice. The policy requires four. I am asking for an exception.',
            answer:
              'Because I can give only three weeks notice rather than the four the policy requires, I am asking for an exception.',
          },
          {
            prompt: 'The van blocks the sightline. Children cross at half past eight. I am concerned.',
            answer:
              'Since the van blocks the sightline at exactly the time children are crossing, I am concerned.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'Combining is not lengthening. If a combined sentence passes about 35 words, split it again.',
      },
    ],
  },

  {
    slug: 'reading-the-prompt',
    title: 'Reading the prompt properly',
    summary:
      'A missing content point caps a response no matter how well it is written. Two minutes of prompt analysis protects the whole task.',
    skill: 'strategy',
    microSkills: ['writing.task_fulfilment', 'speaking.task_response'],
    level: 7,
    minutes: 6,
    blocks: [
      {
        type: 'prose',
        text: 'Every prompt contains a verb that names the job, and a set of elements that must appear. Learners lose more marks to skipping an element than to any grammar error, because the omission is structural: no amount of good writing elsewhere replaces it.',
      },
      {
        type: 'principle',
        text: 'Before writing: circle the verb, list the elements, and number them. Write to the numbers, then check them off before you submit.',
      },
      {
        type: 'example',
        label: 'Prompt analysis in practice',
        weak: 'Reads the scenario, starts writing, remembers the deadline element in the last sentence.',
        strong:
          'Verb: explain + request. Elements: (1) state of the work, (2) deposit, (3) date and why, (4) consequence. Paragraph plan: 1+2 together, 3 alone, 4 as the closing.',
        why: 'The plan takes ninety seconds and makes omission almost impossible. It also decides paragraphing, which is the other thing learners do accidentally.',
      },
      {
        type: 'checkpoint',
        question:
          'A prompt says: “Explain the situation, state what you need, and say what you will do if it is not resolved.” How many elements must appear?',
        options: [
          { text: 'Two — explain and request', correct: false, feedback: 'The conditional consequence is a separate required element.' },
          { text: 'Three', correct: true, feedback: 'Explain, request, and the consequence if unresolved.' },
          { text: 'One — the request is the point', correct: false, feedback: 'The other two are explicitly instructed.' },
        ],
      },
    ],
  },

  {
    slug: 'cutting-padding',
    title: 'Cutting ten per cent',
    summary:
      'Padding costs you the words you need for support, and it is visible in the first sentence. Learn what to delete.',
    skill: 'writing',
    microSkills: ['writing.concision'],
    level: 9,
    minutes: 5,
    blocks: [
      {
        type: 'prose',
        text: 'In a 180-word response, twenty wasted words are a whole supporting sentence you did not write. Padding clusters in three places: the opening, intensifiers, and restatements of the prompt.',
      },
      {
        type: 'compare',
        heading: 'What to delete',
        leftLabel: 'Padding',
        rightLabel: 'Replacement',
        rows: [
          { left: 'In this email I would like to write about the problem that I am having with…', right: 'The flooring you installed remains half finished.' },
          { left: 'It is a very important issue that is really quite serious.', right: '(delete — the facts already carry it)' },
          { left: 'As we all know, in today’s modern world…', right: '(delete — begin with your actual point)' },
          { left: 'I would just like to say that I think that maybe…', right: 'I would argue that…' },
        ],
      },
      {
        type: 'principle',
        text: 'Delete any sentence that could open any response to any prompt. It is not doing work specific to yours.',
      },
      {
        type: 'drill',
        instruction: 'Cut each sentence to its content without losing meaning.',
        items: [
          {
            prompt:
              'I am writing this email to you today because I would like to inform you about a situation that has occurred regarding my recent order.',
            answer: 'My order arrived incomplete.',
          },
          {
            prompt:
              'In my personal opinion, I think that it is very important that people should try to consider this issue carefully.',
            answer: 'This deserves careful consideration.',
          },
        ],
      },
    ],
  },

  {
    slug: 'paragraph-jobs',
    title: 'One job per paragraph',
    summary: 'A reader should be able to predict what a paragraph will do from its first sentence.',
    skill: 'writing',
    microSkills: ['writing.organisation'],
    level: 8,
    minutes: 6,
    blocks: [
      {
        type: 'prose',
        text: 'Organisation is not paragraph count. It is whether each paragraph has a job and announces it. Four paragraphs that each do half of two jobs read as less organised than three that each do one.',
      },
      {
        type: 'principle',
        text: 'Name each paragraph with a verb before you write it: establish, explain, request, warn, concede, close.',
      },
      {
        type: 'compare',
        heading: 'Two plans for the same message',
        leftLabel: 'Unplanned',
        rightLabel: 'Planned',
        rows: [
          { left: 'Paragraph 1: some background and a bit of the request', right: 'Paragraph 1: establish the situation and the reason for writing' },
          { left: 'Paragraph 2: more background, the deadline, some feelings', right: 'Paragraph 2: state the deadline and why it exists' },
          { left: 'Paragraph 3: the rest of the request and a sign-off', right: 'Paragraph 3: state the consequence and close' },
        ],
      },
      {
        type: 'checkpoint',
        question: 'Which opening sentence best announces a paragraph whose job is “concede”?',
        options: [
          { text: 'There are several reasons why this option is stronger.', correct: false, feedback: 'That announces an argument, not a concession.' },
          { text: 'The alternative does have one real advantage.', correct: true, feedback: 'The reader now knows exactly what this paragraph will do.' },
          { text: 'In conclusion, I believe the first option is better.', correct: false, feedback: 'That is a closing move.' },
        ],
      },
    ],
  },

  {
    slug: 'claim-because-example',
    title: 'The spoken support chain',
    summary:
      'A four-link chain you can run in real time: claim, because, for example, so. It is the fastest route out of list-shaped speaking.',
    skill: 'speaking',
    microSkills: ['speaking.development', 'speaking.structure'],
    level: 8,
    minutes: 6,
    blocks: [
      {
        type: 'prose',
        text: 'Under time pressure you cannot plan sentences, only shapes. The chain gives you a shape that produces development automatically, so you are never left repeating the claim in different words.',
      },
      {
        type: 'principle',
        text: 'Claim → because → for example → so. Four links, roughly twenty seconds. A sixty-second answer is two chains and a closing sentence.',
      },
      {
        type: 'example',
        label: 'One chain, spoken',
        weak: 'I would choose the cabin. It is cheaper and quieter, and I think it would be better for relaxing.',
        strong:
          'I would go with the cabin. Because you said you want two days without thinking, and the cabin removes every decision — there is nowhere to go and nothing to book. For example, last winter we did the same thing and by Saturday afternoon nobody had looked at a phone. So you would actually get the break you are describing, rather than a different kind of busy.',
        why: 'Same position, but each link adds information. The example is specific, and the “so” returns to the listener’s stated priority.',
      },
      {
        type: 'drill',
        instruction:
          'Record yourself running the chain on each prompt. Aim for twenty seconds per chain, no notes.',
        items: [
          { prompt: 'Public libraries should stay open later.', answer: 'claim → because → for example → so' },
          { prompt: 'New employees should shadow a colleague for a week.', answer: 'claim → because → for example → so' },
          { prompt: 'Cities should prioritise bus frequency over new routes.', answer: 'claim → because → for example → so' },
        ],
      },
      {
        type: 'callout',
        tone: 'insight',
        text: 'If you run out of chain before you run out of time, add a second reason — never repeat the first in new words.',
      },
    ],
  },

  {
    slug: 'speaking-shapes',
    title: 'A shape for each speaking task',
    summary:
      'Eight tasks, eight shapes. Knowing the shape before the prompt appears is what turns thirty seconds of preparation into a plan.',
    skill: 'speaking',
    microSkills: ['speaking.structure', 'speaking.task_response'],
    level: 9,
    minutes: 9,
    blocks: [
      {
        type: 'prose',
        text: 'Preparation time is too short to draft sentences. It is exactly long enough to choose a position and fit it to a shape you already know. These are the shapes.',
      },
      {
        type: 'compare',
        heading: 'Task shapes',
        leftLabel: 'Task',
        rightLabel: 'Shape',
        rows: [
          { left: 'Giving advice', right: 'Recommendation → two reasons tied to their situation → one risk → next step' },
          { left: 'Personal experience', right: 'One-sentence setting → sequence of events → what you did → what changed' },
          { left: 'Describing a scene', right: 'Frame (what kind of place, when) → foreground → middle → background → one telling detail' },
          { left: 'Making predictions', right: 'Most likely outcome → evidence → second prediction → hedged possibility → one thing that will not happen' },
          { left: 'Comparing and persuading', right: 'Choice → strongest reason in their terms → concede their option’s best feature → outweigh it → ask for agreement' },
          { left: 'Difficult situation', right: 'State the choice → why → what you will actually say → how you expect it to land' },
          { left: 'Expressing opinions', right: 'Position → reason one developed → reason two developed → strongest objection answered → sharpened restatement' },
          { left: 'Unusual situation', right: 'Overall impression → size and shape by comparison → parts in order → what is unclear about it' },
        ],
      },
      {
        type: 'callout',
        tone: 'insight',
        text: 'Use your preparation time to fill the first two slots of the shape only. The rest arrives once you are speaking.',
      },
      {
        type: 'checkpoint',
        question: 'In a persuasion task, when should you concede the other option’s advantage?',
        options: [
          { text: 'Never — it weakens your position', correct: false, feedback: 'Refusing to concede reads as not having considered the alternative.' },
          { text: 'After your strongest reason, and immediately outweighed', correct: true, feedback: 'The concession buys credibility; outweighing it immediately keeps the position.' },
          { text: 'At the very start, before your choice', correct: false, feedback: 'Conceding before committing leaves the listener unsure what you are arguing.' },
        ],
      },
    ],
  },

  {
    slug: 'silent-pausing',
    title: 'Silent pausing',
    summary:
      'Fillers dilute an otherwise strong answer. Replacing them is a mechanical change you can make in one session.',
    skill: 'speaking',
    microSkills: ['speaking.filler_control', 'speaking.fluency'],
    level: 7,
    minutes: 5,
    blocks: [
      {
        type: 'prose',
        text: 'Fillers are not a vocabulary problem. They are what happens when you begin a sentence before you know where it ends. The cure is not speaking faster; it is pausing where a listener expects a pause.',
      },
      {
        type: 'principle',
        text: 'A pause between ideas reads as thinking. A pause inside a phrase reads as searching. Move your pauses to the boundaries.',
      },
      {
        type: 'compare',
        heading: 'Where the pause falls',
        leftLabel: 'Searching',
        rightLabel: 'Thinking',
        rows: [
          { left: 'I would… um… choose the… the cabin because it is… quieter.', right: 'I would choose the cabin. [pause] The reason is simple: it removes every decision.' },
          { left: 'The main thing is like… you know… the cost.', right: 'The main consideration is cost. [pause] And not the price itself — the predictability.' },
        ],
      },
      {
        type: 'drill',
        instruction:
          'Record a 60-second answer with one rule: every time you would say “um”, close your mouth and count one. Play it back and count the fillers.',
        items: [
          { prompt: 'Describe a decision you made recently and why.', answer: 'Target: fewer than 3 fillers per minute.' },
          { prompt: 'Should cities charge for parking near transit stations?', answer: 'Target: no filler in the first 15 seconds.' },
        ],
      },
    ],
  },

  {
    slug: 'task-verbs',
    title: 'The verb of the task',
    summary:
      'Every speaking task has a verb. Answering a nearby question well still scores as not answering this one.',
    skill: 'speaking',
    microSkills: ['speaking.task_response'],
    level: 8,
    minutes: 5,
    blocks: [
      {
        type: 'prose',
        text: 'The most expensive speaking error is not grammar. It is describing when you were asked to predict, or comparing when you were asked to persuade. The response can be fluent, accurate and wrong-shaped.',
      },
      {
        type: 'compare',
        heading: 'Adjacent tasks, different verbs',
        leftLabel: 'Asked to…',
        rightLabel: 'Not…',
        rows: [
          { left: 'Predict what happens next', right: 'Describe what is happening now' },
          { left: 'Persuade a specific listener', right: 'List the advantages of both options' },
          { left: 'Advise a person', right: 'Explain what you personally would do, without recommending' },
          { left: 'Describe an unusual object', right: 'Guess what it is and talk about that' },
        ],
      },
      {
        type: 'checkpoint',
        question: 'The prompt says: “Predict what will happen next and explain why.” Which opening is on task?',
        options: [
          { text: 'In this picture there is a market with a vendor and some stalls.', correct: false, feedback: 'That is description. The verb is predict.' },
          { text: 'The two covered stalls will almost certainly open within the next few minutes, because the vendor beside them has already started setting up.', correct: true, feedback: 'Prediction plus grounded reason, in the first sentence.' },
          { text: 'I think markets are an important part of community life.', correct: false, feedback: 'Opinion, and unrelated to the scene.' },
        ],
      },
    ],
  },

  {
    slug: 'filling-the-window',
    title: 'Filling the window',
    summary: 'Unused seconds are unmade points. There is no credit for finishing early.',
    skill: 'speaking',
    microSkills: ['speaking.pacing'],
    level: 7,
    minutes: 5,
    blocks: [
      {
        type: 'prose',
        text: 'Many learners stop at forty seconds of a sixty-second window, then say they had nothing else to add. Almost always they had a second reason available and no method for reaching it under pressure.',
      },
      {
        type: 'principle',
        text: 'Plan for two chains, not one. If you finish the first with time remaining, the second is already waiting.',
      },
      {
        type: 'drill',
        instruction:
          'Record each prompt twice: once naturally, once forcing yourself to speak until the timer ends. Compare the two for content, not comfort.',
        items: [
          { prompt: 'Advise a friend on whether to move to a smaller city.', answer: '60 seconds, no early stop.' },
          { prompt: 'Describe a routine you have changed this year.', answer: '60 seconds, no early stop.' },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'Filling time by repeating the same point in new words does not help. Add a reason, an example, or a consequence.',
      },
    ],
  },

  {
    slug: 'inference-evidence',
    title: 'Inference that stays inside the text',
    summary:
      'The most common reading error at CLB 9+ is answering an inference question with world knowledge instead of textual evidence.',
    skill: 'reading',
    microSkills: ['reading.inference', 'listening.inference'],
    level: 9,
    minutes: 8,
    blocks: [
      {
        type: 'prose',
        text: 'An inference is a conclusion the text forces, not one it permits. Options that are reasonable, likely, or true in the world are the hardest distractors precisely because they are all three — and still wrong.',
      },
      {
        type: 'principle',
        text: 'For every inference answer, name the words in the text that make the alternative impossible. If you cannot, you are guessing well rather than reading.',
      },
      {
        type: 'example',
        label: 'Reasonable versus supported',
        weak:
          'The message says the plumber recommended snaking the line. Therefore the work was probably done at some point.',
        strong:
          'The message says the plumber recommended snaking the line, and then says “I don’t know whether that ever happened.” The text explicitly refuses the assumption.',
        why: 'The first reading imports a plausible world fact. The second locates the sentence that blocks it. That sentence exists in the passage for exactly this reason.',
      },
      {
        type: 'checkpoint',
        question:
          'A text says: “The authority points to a training programme that has doubled in size since March.” What is supported?',
        options: [
          { text: 'The shortage will be resolved by autumn', correct: false, feedback: 'That is the authority’s claim reported elsewhere, not something this sentence supports.' },
          { text: 'The authority offers the programme as evidence for its explanation', correct: true, feedback: '“Points to” tells you the function of the fact: it is being used as support.' },
          { text: 'Training programmes are the most effective response to shortages', correct: false, feedback: 'A general claim the text never makes.' },
        ],
      },
      {
        type: 'drill',
        instruction:
          'For each statement, decide whether it is supported, contradicted, or simply not addressed. The third category is the one learners under-use.',
        items: [
          { prompt: 'A library report called an initiative successful without analysing who benefited. → Claim: the report contained false figures.', answer: 'Not addressed', note: 'Omission is not falsification.' },
          { prompt: 'A clerk says “you’re the fourth person this month”. → Claim: the problem is not unique to this resident.', answer: 'Supported' },
          { prompt: 'A writer says “this is not an argument against the policy”. → Claim: the writer opposes the policy.', answer: 'Contradicted' },
        ],
      },
    ],
  },

  {
    slug: 'distractor-anatomy',
    title: 'How distractors are built',
    summary:
      'Wrong options are engineered. Knowing the four standard designs lets you eliminate faster and more confidently.',
    skill: 'reading',
    microSkills: ['reading.paraphrase', 'reading.main_idea'],
    level: 9,
    minutes: 7,
    blocks: [
      {
        type: 'prose',
        text: 'Distractors are not random. Item writers build them from a small set of patterns, and once you can name the pattern you can eliminate the option without re-reading the whole passage.',
      },
      {
        type: 'compare',
        heading: 'The four patterns',
        leftLabel: 'Pattern',
        rightLabel: 'How to spot it',
        rows: [
          { left: 'True but not asked', right: 'The statement is accurate; it simply answers a different question. Re-read the stem.' },
          { left: 'Right idea, wrong scope', right: 'Correct about one paragraph, presented as the point of the whole text.' },
          { left: 'Word-for-word echo', right: 'Reuses the passage’s exact vocabulary while changing the relationship between the ideas.' },
          { left: 'Strengthened hedge', right: 'Turns “may”, “tends to”, “does not raise” into “will”, “always”, “will fall”.' },
        ],
      },
      {
        type: 'checkpoint',
        question:
          'A passage says a policy “does not raise wages in sectors that cannot compress”. An option says wages “will fall” in those sectors. Which pattern is this?',
        options: [
          { text: 'True but not asked', correct: false, feedback: 'The statement is not true of the passage at all.' },
          { text: 'Strengthened hedge', correct: true, feedback: 'A neutral statement about absence of increase has been converted into a prediction of decrease.' },
          { text: 'Word-for-word echo', correct: false, feedback: 'The wording has changed, not been reused.' },
        ],
      },
      {
        type: 'callout',
        tone: 'insight',
        text: 'When two options seem equally good, one of them almost always contains a strengthened hedge. Compare their modal verbs first.',
      },
    ],
  },

  {
    slug: 'note-taking-symbols',
    title: 'Note-taking that survives one hearing',
    summary:
      'You hear the audio once. Notes that try to capture words fail; notes that capture relationships work.',
    skill: 'listening',
    microSkills: ['listening.note_taking', 'listening.detail_recall'],
    level: 9,
    minutes: 7,
    blocks: [
      {
        type: 'prose',
        text: 'Writing full words costs about a second each, and a second is a clause. The learners who score well write less than they think they should and remember more, because they are recording structure rather than transcript.',
      },
      {
        type: 'principle',
        text: 'Record three things only: who said it, what the relationship is, and any number with a label attached.',
      },
      {
        type: 'compare',
        heading: 'Two sets of notes for the same discussion',
        leftLabel: 'Transcript-style (fails)',
        rightLabel: 'Structure-style (works)',
        rows: [
          { left: 'Beau says the kitchen is the thing everyone asks for and it makes the hall rentable which is income', right: 'B: kitchen ← demand + rental income' },
          { left: 'Camille says she does not disagree that it is the most wanted but questions whether it can be delivered by March', right: 'C: agrees demand / doubts timing (permit)' },
          { left: 'Aditi suggests splitting six and six so if the kitchen slips the money is still spent', right: 'A: split 6/6 = risk cover, not preference' },
        ],
      },
      {
        type: 'drill',
        instruction: 'Practise the symbol set until it is automatic.',
        items: [
          { prompt: 'Cause and effect', answer: '→' },
          { prompt: 'Disagreement between speakers', answer: '≠ or ⟂' },
          { prompt: 'Concession followed by objection', answer: '✓… but' },
          { prompt: 'Number that will matter later', answer: 'circle it and write the label beside it' },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'A number without a label is worthless. Write “park 90”, never “90”.',
      },
    ],
  },

  {
    slug: 'tone-words',
    title: 'Hearing and reading stance',
    summary:
      'Tone questions come down to a small set of words that carry evaluation. Learn them and the coin flip disappears.',
    skill: 'reading',
    microSkills: ['reading.tone_attitude', 'listening.speaker_attitude'],
    level: 10,
    minutes: 8,
    blocks: [
      {
        type: 'prose',
        text: 'Stance is rarely stated. It is carried by hedges, intensifiers, concessives and attribution phrases — a small vocabulary that does most of the evaluative work in English.',
      },
      {
        type: 'compare',
        heading: 'Stance markers and what they signal',
        leftLabel: 'Marker',
        rightLabel: 'Signals',
        rows: [
          { left: '“what it calls…”, “so-called”, “described as”', right: 'The writer is not adopting this description' },
          { left: '“admittedly”, “granted”, “to be fair”', right: 'A concession is being made before the real point' },
          { left: '“that said”, “even so”, “nevertheless”', right: 'The concession is over; the position resumes' },
          { left: '“appears to”, “tends to”, “may well”', right: 'The claim is deliberately limited — do not strengthen it' },
          { left: '“notably”, “tellingly”, “revealingly”', right: 'The next statement carries the writer’s analysis' },
          { left: '“I want to be careful not to overstate”', right: 'A limitation is coming, followed by a sharper claim' },
        ],
      },
      {
        type: 'checkpoint',
        question:
          'A speaker says: “That’s fair, actually. Although the permit office is the part we don’t control.” What has happened?',
        options: [
          { text: 'Full agreement', correct: false, feedback: '“Although” reopens the objection in narrower form.' },
          { text: 'A real concession, followed by a narrowed objection', correct: true, feedback: '“Actually” marks a genuine update; the “although” keeps one part of the original point alive.' },
          { text: 'Polite disagreement with no concession', correct: false, feedback: 'The concession is genuine — the speaker gives up the earlier comparison.' },
        ],
      },
      {
        type: 'callout',
        tone: 'insight',
        text: 'When a tone question offers two plausible options, one is usually a stronger version of the other. The text almost always supports the more moderate one.',
      },
    ],
  },
];
