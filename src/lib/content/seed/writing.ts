import type { SeedWritingTask } from './types';

/**
 * Writing prompts — original scenarios.
 *
 * Two task shapes mirror the test: a message with a purpose and required
 * content points, and a choice between two options that must be argued.
 * Scenarios are written so that the required content points cannot be covered
 * by a memorised template — each has at least one element that forces the
 * writer to make a decision about the specific situation.
 *
 * `modelNotes` is deliberately not a model answer. Supplying a model invites
 * copying, and copying is what produces the flat, template-shaped responses
 * that cap learners at CLB 8. The notes describe the *moves* a strong response
 * makes, which transfer to prompts the learner has never seen.
 */
export const writingTasks: SeedWritingTask[] = [
  {
    slug: 'write-email-contractor-delay',
    taskType: 'writing.email',
    title: 'A delayed renovation',
    scenario:
      'You hired a contractor to replace the flooring in your apartment. The work was scheduled to finish two weeks ago. It is now half done, and the contractor has not been on site for eight days. You have paid a 50% deposit. You need the work finished before a family member arrives to stay on the 20th.',
    instructions:
      'Write an email to the contractor. Explain the situation, state clearly what you need, and set out what you will do if the work is not completed.',
    requirements: [
      'Describe the current state of the work and how long it has been stalled',
      'Refer to the deposit you have already paid',
      'State the date by which the work must be finished and why that date matters',
      'Say what action you will take if the deadline is not met',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 9,
    topic: 'housing',
    modelNotes:
      'A strong response opens with the reason for writing rather than a greeting formula, and puts the deadline in the first paragraph — not the last. It states facts (eight days, half complete, deposit paid) without adjectives; the facts carry the complaint. The consequence is specific and proportionate: naming what you will do, and by when, is firmer than expressing displeasure. Register holds throughout: no contractions, no rhetorical questions. The commonest CLB 8 failure here is spending three sentences on how frustrating the situation is and one on what is required.',
  },
  {
    slug: 'write-email-manager-schedule',
    taskType: 'writing.email',
    title: 'Requesting a schedule change',
    scenario:
      'You work three evening shifts a week. Starting next month you will be taking a course that meets on Tuesday and Thursday evenings. Your workplace generally allows schedule changes but requires four weeks notice, and you are giving three. One colleague has already told you informally that they would prefer evening shifts.',
    instructions:
      'Write an email to your manager requesting the change. Make the request easy to approve.',
    requirements: [
      'State exactly which shifts you need to change and from when',
      'Acknowledge that you are giving less notice than the policy requires',
      'Mention the colleague who may be willing to take the shifts',
      'Offer something that reduces the inconvenience to the team',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 9,
    topic: 'workplace',
    modelNotes:
      'The move that distinguishes a strong response is doing the manager\'s work for them: the request arrives with the obstacle already named and a candidate solution attached. Acknowledging the short notice directly — once, without over-apologising — is stronger than hoping it goes unnoticed. The colleague must be described accurately: they said so informally, which is not a commitment, and a response that overstates it is dishonest and reads as such. Offer something concrete, not "I am happy to help however I can".',
  },
  {
    slug: 'write-email-course-refund',
    taskType: 'writing.email',
    title: 'A course that changed format',
    scenario:
      'You enrolled in an in-person weekend course. Three weeks before it started, the provider moved it online and shortened it from two days to one. You chose the course specifically for the in-person practice sessions. The provider offers a partial credit toward a future course but not a refund.',
    instructions:
      'Write to the provider explaining why the credit does not resolve the problem, and state what outcome you want.',
    requirements: [
      'Explain what you booked and what changed',
      'Explain specifically why the change matters to you',
      'Respond to the credit that has been offered',
      'State the outcome you are asking for',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 10,
    topic: 'education',
    modelNotes:
      'This prompt rewards precision about harm. "It was inconvenient" is weak; "I enrolled for the supervised practice sessions, which the online format removes entirely" is a reason the provider can act on. The response must engage with the credit rather than ignore it — explaining why a future course does not substitute for the one you needed is the argumentative core. Ending with a specific request beats ending with a complaint; a reader who does not know what you want will do nothing.',
  },
  {
    slug: 'write-email-community-noise',
    taskType: 'writing.email',
    title: 'A community facility’s new hours',
    scenario:
      'Your local community centre has extended its evening programming to 10 p.m. You live next to the building. The noise itself is manageable, but the car park empties directly under your bedroom window and the gate is left open, which sets off your neighbour\'s dog. You support the extended hours in principle.',
    instructions:
      'Write to the centre\'s manager. Raise the issue without opposing the extended hours.',
    requirements: [
      'Make clear that you support the extended programming',
      'Describe the specific problem precisely',
      'Distinguish between the parts you can live with and the part you cannot',
      'Suggest at least one practical change',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'semi_formal',
    level: 10,
    topic: 'community',
    modelNotes:
      'The difficulty here is holding two positions at once — support and complaint — without the message collapsing into either. Strong responses state the support first and mean it, then narrow sharply: not the programme, not the noise, the gate. Precision is the persuasive device. A practical suggestion (closing the gate, redirecting exit traffic to the far side) turns a complaint into a proposal, which is what makes a manager act rather than file it.',
  },
  {
    slug: 'write-survey-transit-funding',
    taskType: 'writing.survey',
    title: 'Survey: where should transit money go?',
    scenario:
      'Your city has funding to improve public transit and has asked residents to choose between two options.',
    instructions:
      'Choose ONE option and explain your choice. Give reasons and examples to support it.',
    requirements: [
      'State clearly which option you have chosen',
      'Give at least two distinct reasons for your choice',
      'Support each reason with an example or consequence',
      'Acknowledge a benefit of the option you did not choose',
    ],
    choices: [
      'Option A: Increase the frequency of existing routes, so buses run every 8 minutes instead of every 15 during peak hours.',
      'Option B: Extend service to three neighbourhoods that currently have no transit access.',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'semi_formal',
    level: 10,
    topic: 'transport',
    modelNotes:
      'The commonest ceiling on this task is two reasons stated and neither developed. A CLB 11 response gives each reason a consequence: frequency changes whether people plan around the bus at all, which changes ridership, which changes the case for further funding. Acknowledging the other option is not a formality — it must concede something real, then explain why it is outweighed. Responses that concede nothing read as unconsidered; responses that concede too much lose the position they were asked to argue.',
  },
  {
    slug: 'write-survey-work-from-home',
    taskType: 'writing.survey',
    title: 'Survey: office attendance policy',
    scenario:
      'Your employer is deciding how to set office attendance for roles that can be done remotely.',
    instructions: 'Choose ONE option and explain your choice with reasons and examples.',
    requirements: [
      'State your choice explicitly in the opening',
      'Give at least two developed reasons',
      'Include one concrete example from work or study',
      'Address the strongest objection to your choice',
    ],
    choices: [
      'Option A: A fixed policy — everyone attends the office on the same two days each week.',
      'Option B: A flexible policy — each team decides its own pattern, with no company-wide rule.',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'semi_formal',
    level: 10,
    topic: 'workplace',
    modelNotes:
      'Both options are genuinely defensible, which is the point: the level shows in the argument, not the choice. Fixed days can be defended on coordination — the value of an office day depends on who else is there. Flexibility can be defended on fit — a team whose work is asynchronous gains nothing from synchronised presence. Addressing the strongest objection, rather than a weak one you invent, is the move that separates CLB 10 from CLB 12.',
  },
  {
    slug: 'write-survey-library-space',
    taskType: 'writing.survey',
    title: 'Survey: how should a library use a new floor?',
    scenario:
      'A public library has acquired an additional floor and is consulting the community on how to use it. The floor is one large open room with good natural light and no interior walls; the budget covers furniture and one set of fittings, so the space can be adapted for one purpose but not easily for both.',
    instructions: 'Choose ONE option and argue for it.',
    requirements: [
      'State your choice in the first sentence',
      'Give two reasons, each supported',
      'Explain who benefits and how',
      'Acknowledge a cost or trade-off of your choice',
    ],
    choices: [
      'Option A: Quiet individual study space with power outlets and bookable desks.',
      'Option B: A flexible community room for classes, meetings and children’s programmes.',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'semi_formal',
    level: 9,
    topic: 'community',
    modelNotes:
      'Naming who benefits forces specificity: students without reliable internet at home, newcomers attending language classes, shift workers who need daytime quiet. Abstract beneficiaries ("the community") weaken the argument. The trade-off requirement is where most responses thin out — a real cost, honestly stated and then answered, is more persuasive than a claim that the choice has no downside.',
  },
  {
    slug: 'write-survey-school-devices',
    taskType: 'writing.survey',
    title: 'Survey: devices in secondary classrooms',
    scenario:
      'A school board is consulting families on personal device use during class time in secondary schools. Teachers currently apply their own rules, which vary between classrooms, and the board wants a single policy that every teacher can enforce consistently.',
    instructions: 'Choose ONE option and defend it.',
    requirements: [
      'State your position clearly',
      'Give two developed reasons',
      'Use one specific example',
      'Respond to the main argument on the other side',
    ],
    choices: [
      'Option A: Phones are stored during class and returned at the end of the day.',
      'Option B: Phones stay with students, with use permitted only when a teacher directs it.',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'semi_formal',
    level: 11,
    topic: 'education',
    modelNotes:
      'This topic invites cliché, and cliché is what caps it. The strongest responses avoid general claims about "young people today" and argue from mechanism: what a policy actually asks a teacher to enforce, and what happens when enforcement is inconsistent. Concrete examples of enforcement cost — a teacher spending five minutes of every lesson on it — do more than assertions about concentration. Responding to the other side means engaging with its best case (emergency contact, accessibility tools), not its weakest.',
  },

  /* ---- Set two: added to widen topic coverage ---- */
  {
    slug: 'write-email-neighbour-parking',
    taskType: 'writing.email',
    title: 'A parking space that is not yours',
    scenario:
      'Your building assigns one parking space per unit. For the past six weeks a vehicle you do not recognise has been parked in yours several nights a week. You have left two notes on the windscreen and had no reply. You pay $60 a month for the space and have twice had to park on the street overnight. The building manager handles parking complaints.',
    instructions:
      'Write an email to the building manager. Set out what has happened and what you want done about it.',
    requirements: [
      'Give the space number, the period involved and how often it has happened',
      'Say what you have already tried',
      'State that you pay separately for the space',
      'Ask for a specific remedy and a date by which you expect a reply',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 9,
    topic: 'housing',
    modelNotes:
      'The trap in this prompt is tone. The situation is genuinely annoying, and a response that lets the annoyance drive the sentences reads as a complaint rather than a request — which is weaker, not stronger. What raises the band is evidence and sequence: dates, the fee, the two notes, in that order, followed by one clear ask. Naming the remedy is essential; "please do something about this" leaves the manager to invent the solution and gives them room to do nothing. Asking for a reply by a date is firm without being a threat, and threats do not belong in a first email.',
  },
  {
    slug: 'write-email-employer-reference',
    taskType: 'writing.email',
    title: 'Asking for a reference at short notice',
    scenario:
      'You are applying for a position that closes in five days and needs two references. A former supervisor you worked with for two years would be ideal, but you have not been in contact for eighteen months, and you left that job on short notice for family reasons.',
    instructions:
      'Write an email asking the former supervisor to act as a reference. Make it easy for them to say yes.',
    requirements: [
      'Re-establish who you are and when you worked together',
      'Acknowledge both the gap in contact and the way you left',
      'State the deadline and exactly what the reference involves',
      'Give them a straightforward way to decline',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 10,
    topic: 'workplace',
    modelNotes:
      'Two hard things have to happen in one short message: an awkward history has to be acknowledged, and a favour has to be asked, without the acknowledgement swallowing the request. One sentence on the departure is enough — more reads as an apology and makes the reader uncomfortable. The move that marks a strong response is reducing the cost of yes: the deadline, the form, the length, and an offer to send a summary of the work you did together. Offering an easy no is counter-intuitive and it works; it signals that the relationship matters more than the reference.',
  },
  {
    slug: 'write-email-clinic-billing',
    taskType: 'writing.email',
    title: 'A bill for a service you did not receive',
    scenario:
      'A clinic has billed you $180 for a specialist consultation. You attended the appointment, but the specialist was unavailable and you were seen by an assistant for four minutes and told to rebook. You did rebook, attended, and were billed a second time. You have paid neither invoice.',
    instructions:
      'Write an email to the clinic’s billing office setting out the problem and what you believe you owe.',
    requirements: [
      'Distinguish clearly between the two appointments',
      'State what actually happened at the first one',
      'Say what you are willing to pay and why',
      'Ask for a corrected invoice',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 10,
    topic: 'health',
    modelNotes:
      'Precision is the whole task. Two appointments, two invoices, one service actually delivered — a reader who cannot follow which is which will not act. Ordinal markers and dates do that work; adjectives do not. Stating what you will pay is the move that converts a complaint into a proposal, and a proposal is far harder to file away. Note the register risk: the situation invites sarcasm about four minutes, and sarcasm in a billing dispute costs you the reader.',
  },
  {
    slug: 'write-email-school-absence',
    taskType: 'writing.email',
    title: 'Explaining a long absence',
    scenario:
      'Your child will miss eleven school days because of a family obligation overseas. The school’s policy discourages absences of more than five days and asks parents to write in advance. Your child is in a year with standardised assessments, and one assessment falls inside the absence.',
    instructions:
      'Write an email to the class teacher. Explain the absence and set out how the work will be managed.',
    requirements: [
      'Give the exact dates and the reason at the level of detail a school needs',
      'Acknowledge the policy rather than ignoring it',
      'Address the assessment that falls inside the period',
      'Propose how your child will keep up',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1620,
    register: 'formal',
    level: 9,
    topic: 'education',
    modelNotes:
      'Two failure modes sit at opposite ends: over-explaining the family circumstances, which is private and not what the school is deciding on, and under-explaining, which reads as casual about eleven days. One clear sentence on the reason is the calibration. The assessment is the part most responses forget, and it is the part the teacher cares about most — raising it before they do is what makes the email land well. A concrete plan beats a promise: naming what will be done each week is stronger than "we will make sure the work is completed".',
  },
  {
    slug: 'write-survey-library-hours',
    taskType: 'writing.survey',
    title: 'Reallocating library hours',
    scenario:
      'Your public library has funding to stay open the same total number of hours but has asked residents how to distribute them. Option A: open two evenings a week until 9 p.m., closing earlier on weekends. Option B: open both weekend days from 9 a.m., closing at 6 p.m. on weekdays.',
    instructions:
      'Write to the library board explaining which option you support and why.',
    requirements: [
      'State your choice clearly',
      'Give reasons based on who uses a library and when',
      'Acknowledge what the other option offers',
      'Say what would change your mind',
    ],
    choices: [
      'Option A: late weekday evenings, shorter weekends',
      'Option B: full weekend days, earlier weekday closing',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'formal',
    level: 10,
    topic: 'community',
    modelNotes:
      'The strongest responses reason from users rather than from preference: shift workers, students without quiet space at home, parents with young children, and job seekers using the computers all have different availability, and naming one or two of those groups grounds the argument in something checkable. Saying what would change your mind is the highest-value move here — it demonstrates that the position is held for reasons rather than by default, and almost no CLB 8 response does it.',
  },
  {
    slug: 'write-survey-remote-training',
    taskType: 'writing.survey',
    title: 'How new staff should be trained',
    scenario:
      'Your employer is redesigning training for new hires. Option A: two weeks of full-time in-person training before starting the role. Option B: a shorter orientation followed by three months of weekly sessions while doing the job.',
    instructions:
      'Write to the training team explaining which model you support.',
    requirements: [
      'Commit to one model in your first paragraph',
      'Argue from how people actually learn a job',
      'Concede a real advantage of the other model',
      'Suggest one adjustment that would improve the model you chose',
    ],
    choices: [
      'Option A: two weeks up front, then start the role',
      'Option B: short orientation, then weekly sessions on the job',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'formal',
    level: 10,
    topic: 'workplace',
    modelNotes:
      'This prompt rewards a mechanism rather than a preference: front-loaded training is forgotten because it arrives before the questions do; distributed training risks never being protected against the pressure of the actual job. A response that names one of those mechanisms is doing something a generic "flexibility is important" response is not. The suggested adjustment is where the top band shows itself — a specific, small, plausible change reads as someone who has thought past the choice they were handed.',
  },
  {
    slug: 'write-survey-transit-fare',
    taskType: 'writing.survey',
    title: 'Free transit or better frequency',
    scenario:
      'Your city can spend a transit grant in one of two ways. Option A: remove fares on all buses for two years. Option B: keep fares and increase service frequency on the ten busiest routes.',
    instructions:
      'Write to the transit authority explaining which use of the grant you support.',
    requirements: [
      'State your position without hedging',
      'Argue from who benefits and how much',
      'Deal with the strongest argument against you',
      'Distinguish between short-term and long-term effects',
    ],
    choices: ['Option A: two years of free fares', 'Option B: higher frequency on the busiest routes'],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'formal',
    level: 11,
    topic: 'community',
    modelNotes:
      'The short-term/long-term distinction is the discriminating move: free fares end after two years and the system returns to what it was, while frequency changes travel behaviour durably — or, argued the other way, fare removal reaches people for whom cost is the binding constraint, and frequency does not help someone who cannot afford to board. Either argument is strong; a response that does not notice the time horizon at all is not. Engaging the strongest counter-argument rather than a weak one is what separates CLB 11 from CLB 9 here.',
  },
  {
    slug: 'write-survey-workplace-notice',
    taskType: 'writing.survey',
    title: 'Two ways to handle sick days',
    scenario:
      'Your workplace is changing its sick-leave policy. Option A: unlimited sick days with a doctor’s note required after two consecutive days. Option B: twelve guaranteed paid sick days a year with no note required at any point.',
    instructions:
      'Write to the human resources team explaining which policy you support.',
    requirements: [
      'Choose one policy explicitly',
      'Give reasons that consider both employees and the organisation',
      'Acknowledge a genuine risk in the policy you chose',
      'Avoid arguing only from your own circumstances',
    ],
    choices: [
      'Option A: unlimited days, note required after two',
      'Option B: twelve days, no note ever required',
    ],
    minWords: 150,
    maxWords: 200,
    timeLimitSeconds: 1560,
    register: 'formal',
    level: 10,
    topic: 'workplace',
    modelNotes:
      'The interesting argument is about what each policy costs the person it is meant to protect: a note requirement puts a sick person in a waiting room and a clinic bill on top of an illness, while an unlimited allowance with no verification shifts pressure onto colleagues and onto managers who then police it informally. Naming that hidden cost — on either side — is the mark of a response that has thought rather than recited. Acknowledging a real risk in your own choice is required here, and hedging it into nothing ("of course, some may disagree") does not count.',
  },
];
