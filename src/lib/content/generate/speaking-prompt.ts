import type { SeedSpeakingTask } from '../seed/types';
import { Rng } from './rng';

/**
 * Generated speaking prompts, covering all eight task types.
 *
 * The same argument as for writing applies, with one addition. A speaking task
 * is analysed against its `successCriteria` — the communicative moves a strong
 * response performs — and `engines/speaking-eval` detects those moves in the
 * transcript regardless of where the criteria came from. Pause structure and
 * articulation rate are measured from the audio and do not involve the prompt
 * at all. So a generated prompt yields the same analysis and the same coaching
 * as an authored one.
 *
 * The demanding part is Tasks 3, 4 and 8, which need a *scene*: a paragraph
 * describable in sixty seconds, with enough located detail that a listener
 * could build a picture and enough internal relation that a describer has
 * decisions to make about order. Those are assembled from a setting, three
 * figures doing specific things, an environmental condition and a time marker —
 * the same components an author would reach for, combined rather than written.
 *
 * Task 8 additionally needs the scene to contain a *mismatch*: something that
 * does not fit, which is what makes the situation unusual and gives the speaker
 * something to interpret. Those are authored per setting rather than generated,
 * because "what would be strange here" is a judgement.
 *
 * The stated limitation is the same one as for writing: these are
 * combinatorial. They are volume for the fortieth rehearsal, not a substitute
 * for the authored set.
 */

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Setting {
  slug: string;
  topic: string;
  place: string;
  figures: string[];
  conditions: string[];
  background: string[];
  timeMarkers: string[];
  /** Something that does not belong — the hook for Task 8. */
  anomalies: string[];
  /** An unresolved situation with visible evidence — the hook for Task 4. */
  pendingSituations: string[];
}

const SETTINGS: Setting[] = [
  {
    slug: 'market',
    topic: 'daily life',
    place: 'An outdoor market on a weekday morning',
    figures: [
      'a vendor lifting a crate onto a table that is already half arranged',
      'a woman in a long coat holding a paper cup and studying a handwritten price sign',
      'a man counting float into a tin without looking up',
      'a child sitting on an upturned box with a bag of apples between their feet',
      'two people folding a tarpaulin between them, out of step with each other',
    ],
    conditions: [
      'The ground is wet, though it is not raining now',
      'A low sun is coming in flat along the row of stalls',
      'Wind is lifting the corners of the awnings and someone has weighted one with a brick',
      'It is cold enough that everyone is standing with their hands in their sleeves',
    ],
    background: [
      'a row of low brick buildings',
      'a delivery van with its rear doors open',
      'two stalls still covered and unattended',
      'a council notice board with three overlapping posters',
    ],
    timeMarkers: [
      'a clock on one of the buildings reading ten past seven',
      'the shutters on the shop behind still down',
      'a bell somewhere out of sight striking the hour',
    ],
    anomalies: [
      'every stall is set up and stocked, but there is not a single customer anywhere in the picture',
      'one stall is entirely empty except for a chair and a hand-lettered sign facing away from the street',
      'all of the price signs have been changed to the same figure, whatever the goods',
    ],
    pendingSituations: [
      'a stall is being packed away at what is clearly the start of the day, and the vendor beside it is watching',
      'a delivery has been left on the pavement with no one attending it and the van is gone',
    ],
  },
  {
    slug: 'waiting-area',
    topic: 'public services',
    place: 'A waiting area in a public building',
    figures: [
      'a man in work clothes asleep upright with a folder on his knees',
      'a woman explaining something to a staff member while holding a form at arm’s length',
      'a teenager translating for an older relative, one hand on the counter',
      'a parent rocking a pushchair with one foot while reading a leaflet',
      'someone photographing a notice on the wall',
    ],
    conditions: [
      'Half the overhead lights are off, leaving one end of the room darker',
      'A radiator is audible and the room is noticeably too warm',
      'The floor by the entrance is wet and a yellow sign has been put out',
      'Rain is running down the full-height window along one side',
    ],
    background: [
      'a numbered ticket display showing a number well behind the one being called',
      'a row of chairs bolted together with one seat missing',
      'a vending machine with an out-of-order note taped over the coin slot',
      'a corridor with a closed door marked "Interviews"',
    ],
    timeMarkers: [
      'a wall clock reading twenty to four',
      'a printed sign giving closing time as four o’clock',
      'the last name on the appointment board timed at three fifteen',
    ],
    anomalies: [
      'the ticket display is calling a number that nobody in the room is holding, and it has not changed in some time',
      'the room is full but every counter is shuttered, and no staff member is visible anywhere',
      'a queue has formed at a door marked "No entry", and nobody is questioning it',
    ],
    pendingSituations: [
      'the display is stuck, the queue has stopped moving, and one person has just stood up',
      'a staff member has appeared with a printed sheet and is taping it to the counter',
    ],
  },
  {
    slug: 'worksite',
    topic: 'workplace',
    place: 'A section of street that has been dug up',
    figures: [
      'two workers sitting in a parked van with the engine off',
      'a resident photographing the barriers from the pavement',
      'a delivery driver reversing slowly with the door open, looking back',
      'a woman lifting a pushchair over a temporary ramp',
      'someone in a high-visibility jacket writing on a clipboard without looking at the trench',
    ],
    conditions: [
      'Metal plates cover the trench and one of them rocks when it is stepped on',
      'A generator is running somewhere out of sight',
      'The barriers have been moved aside at one end and left that way',
      'Dust has settled over the parked cars along one side',
    ],
    background: [
      'a hand-lettered sign asking people not to block a driveway',
      'residents’ cars parked up on the grass verge',
      'a city notice on a lamp post with a phone number and a project name',
      'a skip half full of broken paving',
    ],
    timeMarkers: [
      'a temporary sign giving a reopening date that has already passed',
      'a permit taped inside the van window, expired at the end of last month',
      'the light suggesting the middle of the afternoon',
    ],
    anomalies: [
      'the site is fully barriered and signed but the trench is filled in and the surface is finished',
      'the reopening date on the sign has passed by more than a week and nothing has been dismantled',
      'the equipment is all still there but there is no one on site and no vehicle other than the van',
    ],
    pendingSituations: [
      'the date on the sign has passed, the workers are idle in the van, and a resident is walking toward them',
      'a second van has pulled up and someone is unloading barriers rather than removing them',
    ],
  },
  {
    slug: 'shopfront',
    topic: 'community',
    place: 'A row of shops on a neighbourhood street',
    figures: [
      'two people reading a notice taped inside a door',
      'a shopkeeper carrying stacked trays out to a car',
      'a man sweeping the same section of pavement twice',
      'a courier checking a phone against the numbers above the doors',
      'someone taking a photograph of a handwritten sign',
    ],
    conditions: [
      'Half the shelves visible through the window are bare',
      'The refrigerated units are switched off and standing open',
      'Every item in the window has a handwritten discount sign',
      'The awning next door has partly collapsed under standing water',
    ],
    background: [
      'a vacant unit with a new "For Lease" board',
      'delivery vans using the parking area behind for a different business',
      'a bus stop with three people who are not looking at the shops',
      'a bicycle chained to a post with its saddle removed',
    ],
    timeMarkers: [
      'a printed notice thanking customers for twenty-two years',
      'opening hours in the door listing today as a trading day',
      'the light of late afternoon along the shopfronts',
    ],
    anomalies: [
      'the shop is fully stocked and lit, the door is open, and there is no one inside or at the till',
      'the closing notice is dated for a day that has already passed and the shop is still trading',
      'every shop in the row has the same notice in the window, in the same handwriting',
    ],
    pendingSituations: [
      'the stock is being discounted, the units are off, and the unit next door is newly vacant',
      'the shopkeeper is loading a car while customers are still browsing',
    ],
  },
  {
    slug: 'transit',
    topic: 'daily life',
    place: 'A covered stop on a wide street',
    figures: [
      'an older man holding a folded newspaper over a small dog',
      'a teenager watching a phone with headphones on, standing slightly apart',
      'a woman in a uniform checking her watch and then the road',
      'two people comparing something on a printed timetable',
      'someone helping another passenger fold a wheeled bag',
    ],
    conditions: [
      'Rain is running off the edge of the shelter in a continuous sheet',
      'The shelter’s lighting is out and the only light is from the road',
      'It is cold and the glass has fogged on the inside',
      'Wind is driving rain in at one end, so everyone is bunched at the other',
    ],
    background: [
      'a bicycle chained to a post with a soaked saddle',
      'a shop awning across the street sagging under water',
      'a service alteration notice cable-tied to the pole',
      'a taxi idling further along with its light off',
    ],
    timeMarkers: [
      'a departure display showing a time several minutes in the past',
      'a bus visible two blocks away with its indicator flashing',
      'the timetable in the case showing the last service of the afternoon',
    ],
    anomalies: [
      'the display is listing services that are all marked as departed, and nobody at the stop has moved',
      'a full bus has stopped, opened its doors, closed them and driven off with no one boarding or alighting',
      'the stop has been fully renovated but the pole carries no route number at all',
    ],
    pendingSituations: [
      'the display has stopped updating, a replacement notice has appeared, and people are beginning to look at each other',
      'the bus two blocks away is not moving and its hazard lights have come on',
    ],
  },
  {
    slug: 'kitchen',
    topic: 'workplace',
    place: 'A commercial kitchen between shifts',
    figures: [
      'a cook scraping a flat grill while talking over their shoulder',
      'a younger worker tying an apron and reading a clipboard at the same time',
      'someone labelling containers with a marker held in their teeth between writes',
      'a supervisor counting stock on a shelf and starting again',
      'a porter wheeling a rack toward a doorway that is partly blocked',
    ],
    conditions: [
      'One overhead light is out, leaving that corner darker than the rest',
      'Extraction is running loudly enough that people are speaking over it',
      'The floor has just been mopped and one section is coned off',
      'Two of the labelled containers are still uncovered',
    ],
    background: [
      'a tall rack of clean trays pushed against a door marked "Dry Store"',
      'a rota on the wall with two names crossed out',
      'a delivery of boxes stacked just inside the entrance',
      'a whiteboard with three items written and one rubbed out',
    ],
    timeMarkers: [
      'a wall clock reading five to three',
      'a clipboard sheet half filled in, stopping mid-column',
      'a handover note dated for today with no signature',
    ],
    anomalies: [
      'the kitchen is fully prepared for service, but every surface is spotless and no food is out at all',
      'the handover sheet has been filled in for a shift that has not started yet',
      'every container on the counter is labelled with the same date and time',
    ],
    pendingSituations: [
      'the handover is half done, the outgoing cook is already changing, and the incoming worker has just arrived',
      'a delivery has arrived during the changeover and nobody has claimed it',
    ],
  },
];

function buildScene(setting: Setting, rng: Rng, extra?: string): string {
  const [first, second, third] = rng.sample(setting.figures, 3);
  const parts = [
    `${setting.place}.`,
    `In the foreground, ${first}.`,
    `To one side, ${second}.`,
    `Behind them, ${third}.`,
    `${rng.pick(setting.conditions)}.`,
    `In the background, ${rng.pick(setting.background)}, and ${rng.pick(setting.timeMarkers)}.`,
  ];
  if (extra) parts.push(extra);
  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/* Non-scene frames                                                    */
/* ------------------------------------------------------------------ */

const ADVICE = [
  {
    topic: 'personal finance',
    prompt: 'Someone close to you is deciding between a cheaper option with no protection if it goes wrong, and a more expensive one that is covered but commits them for longer. They have asked what you would do.',
    lines: ['They have not made a decision of this size before.', 'They would find an unexpected bill difficult this year.'],
  },
  {
    topic: 'education',
    prompt: 'A friend is part way through a long programme and is finding it much harder than they expected. They are considering withdrawing, which would cost them the fees but return their evenings. They want your advice.',
    lines: ['They work full time alongside it.', 'The qualification is required for the job they want.'],
  },
  {
    topic: 'workplace',
    prompt: 'A colleague has been passed over for something they expected and is deciding whether to raise it with someone senior. They have asked what you would do in their position.',
    lines: ['They are new enough that the relationship has little credit in it.', 'The person they would be raising it about writes their review.'],
  },
  {
    topic: 'community',
    prompt: 'A neighbour is about to do something on their property that your friend disagrees with and believes may not be theirs to do. Work has already been booked. Your friend has asked what they should do.',
    lines: ['The two households have got on well for years.', 'Neither has checked who is actually responsible.'],
  },
  {
    topic: 'housing',
    prompt: 'Someone is deciding whether to accept a place that is cheaper but much further from where they work, or stay somewhere convenient that costs more than they can comfortably afford. They want your view.',
    lines: ['Their commute would roughly double.', 'They have said they are tired of thinking about money every week.'],
  },
  {
    topic: 'workplace',
    prompt: 'Someone has been offered a role that pays better but is on a fixed term, while their current job is secure and going nowhere. They have asked what you would do.',
    lines: ['They have been in the current role for four years.', 'They have said they are bored rather than unhappy.'],
  },
  {
    topic: 'health',
    prompt: 'A relative has been told they should make a change that they find genuinely difficult, and has asked whether it is worth the effort. They want your honest view.',
    lines: ['They have tried once before and stopped after a month.', 'They respond badly to being told what to do.'],
  },
  {
    topic: 'daily life',
    prompt: 'A friend is deciding whether to repair something expensive that has failed twice, or replace it. They have asked what you would do.',
    lines: ['The repair costs about a third of a replacement.', 'They have said they hate throwing things away.'],
  },
  {
    topic: 'community',
    prompt: 'Someone has been asked to take on a voluntary role that would take more time than they have, but nobody else has come forward. They want your advice.',
    lines: ['They already do one commitment a week.', 'The activity stops if nobody takes it on.'],
  },
  {
    topic: 'education',
    prompt: 'A friend is choosing whether to study something they are interested in or something with a clearer route to work. They have asked what you would choose.',
    lines: ['They are funding it themselves.', 'They have changed direction once already.'],
  },
];

const EXPERIENCE = [
  { topic: 'daily life', prompt: 'Talk about a time you lost something that mattered. Say what happened, what you did about it, and how it turned out.' },
  { topic: 'personal', prompt: 'Talk about a time you changed your mind about something important. Explain what you thought before, what changed it, and what you think now.' },
  { topic: 'workplace', prompt: 'Talk about a time you had to learn something quickly. Describe the situation, how you went about it, and what happened.' },
  { topic: 'personal', prompt: 'Talk about a decision you made that other people disagreed with. Explain the decision, their objection, and how it worked out.' },
  { topic: 'daily life', prompt: 'Talk about a time when something you had planned carefully went wrong. Say what you had planned, what happened, and what you did.' },
  { topic: 'community', prompt: 'Talk about a time someone helped you when they did not have to. Describe the situation and what it meant.' },
  { topic: 'workplace', prompt: 'Talk about a time you had to give someone news they did not want. Say what the situation was, how you handled it, and what happened afterwards.' },
  { topic: 'daily life', prompt: 'Talk about a time you were somewhere unfamiliar and had to work something out for yourself. Explain the situation and what you did.' },
  { topic: 'personal', prompt: 'Talk about a habit you changed. Say what it was, what made you change it, and whether it lasted.' },
  { topic: 'workplace', prompt: 'Talk about a time you disagreed with a decision but had to carry it out anyway. Explain the decision and how you handled it.' },
  { topic: 'community', prompt: 'Talk about a time you were part of a group that had to reach an agreement. Say what the disagreement was and how it was resolved.' },
  { topic: 'personal', prompt: 'Talk about something you owned or used for a long time. Say why you kept it and what eventually happened to it.' },
  { topic: 'daily life', prompt: 'Talk about a time you had to wait much longer than expected for something. Describe the situation and how you dealt with it.' },
  { topic: 'workplace', prompt: 'Talk about a time you asked for help. Say what you needed, who you asked, and how it went.' },
];

const PERSUADE = [
  {
    topic: 'travel',
    a: 'Somewhere quiet and cheaper, two hours away, with no connectivity and every meal to cook',
    b: 'Somewhere walkable and more expensive, four hours away, with restaurants nearby and a late arrival',
    line: 'The person you are persuading has said they want to "not think for two days".',
  },
  {
    topic: 'education',
    a: 'An intensive course over four weeks that requires unpaid leave and finishes before the hiring season',
    b: 'A part-time course over six months that keeps their income and finishes after it',
    line: 'They have said they are tired of starting things and not finishing them.',
  },
  {
    topic: 'housing',
    a: 'Use the spare room as a study for two people who work from home',
    b: 'Rent it out, bringing in a steady monthly amount toward a goal',
    line: 'One of them has said working at the kitchen table is exhausting.',
  },
  {
    topic: 'workplace',
    a: 'Take the role with more responsibility and no increase in pay for a year',
    b: 'Stay where they are, with the pay rise already agreed and no change in scope',
    line: 'They have said they want to be doing something different in two years.',
  },
  {
    topic: 'daily life',
    a: 'Buy the item once at a price that hurts, and keep it for a decade',
    b: 'Buy the cheaper version now and replace it when it fails',
    line: 'They have limited space and have said they dislike owning things they do not use.',
  },
  {
    topic: 'community',
    a: 'Hold the event indoors, where it is certain but smaller and costs more',
    b: 'Hold it outdoors, where it is free and larger but depends entirely on the weather',
    line: 'The person deciding has said the last one felt cramped.',
  },
  {
    topic: 'workplace',
    a: 'Fix the immediate problem now and live with the underlying cause',
    b: 'Stop and deal with the cause, accepting that the problem recurs meanwhile',
    line: 'They have said they are judged on this quarter.',
  },
  {
    topic: 'daily life',
    a: 'Book the direct route that costs more and arrives in the evening',
    b: 'Book the cheaper route with a long change and arrive after midnight',
    line: 'They are travelling with someone who tires easily.',
  },
  {
    topic: 'housing',
    a: 'Take the place available now that needs work doing to it',
    b: 'Wait two months for one that is ready, paying to store everything meanwhile',
    line: 'They have said the last move exhausted them.',
  },
  {
    topic: 'education',
    a: 'Sit the test now while the material is fresh but the preparation is incomplete',
    b: 'Delay three months, prepare fully, and pay the fee twice',
    line: 'They have said they lose momentum when things are postponed.',
  },
];

const DIFFICULT = [
  {
    topic: 'community',
    prompt: 'Something you lent to a neighbour has come back damaged, and they said nothing about it. You need to decide how to handle it.',
    a: 'Raise the damage with them directly and propose how to settle it',
    b: 'Say nothing about it and decline the next request with a reason',
    lines: ['You may need their help with something shared soon.', 'The repair would cost a noticeable amount.'],
  },
  {
    topic: 'workplace',
    prompt: 'You covered for a colleague twice when they needed it. You have now asked them once and been refused without explanation. You still work with them daily.',
    a: 'Ask again and explain why you are asking',
    b: 'Arrange it another way and say nothing about the refusal',
    lines: ['You do not know why they said no.', 'Others on the team would notice either choice.'],
  },
  {
    topic: 'personal',
    prompt: 'You accepted an invitation months ago. Something you have worked toward has now been scheduled on the same day and cannot be moved. You have to decide.',
    a: 'Withdraw from the invitation and attend the other commitment',
    b: 'Ask to be accommodated another way and keep the invitation',
    lines: ['You were asked to take a specific part in the day.', 'You are one of a small number being considered for the other thing.'],
  },
  {
    topic: 'personal',
    prompt: 'Someone did work for you and charged far less than it was worth. They have since said, half-jokingly, that they should have charged properly.',
    a: 'Raise it directly, name a figure, and settle the difference now',
    b: 'Say nothing about this one and agree a proper rate before the next',
    lines: ['You would like to use them again and to recommend them.', 'They have never raised money with you directly before.'],
  },
  {
    topic: 'workplace',
    prompt: 'You have discovered a mistake in work that has already gone out under someone else’s name. It is not yours, and it will be noticed.',
    a: 'Tell the person privately first and let them raise it',
    b: 'Raise it directly with whoever needs to know and tell them afterwards',
    lines: ['The mistake is small but visible.', 'You have a good relationship with the person concerned.'],
  },
  {
    topic: 'community',
    prompt: 'You agreed to share the cost of something with a neighbour. The work has been done and they have not paid their share, and it has been two months.',
    a: 'Ask directly for the amount and propose a way to pay it',
    b: 'Write it off and avoid arrangements like it in future',
    lines: ['You see each other most days.', 'The amount matters to you more than it seems to matter to them.'],
  },
  {
    topic: 'personal',
    prompt: 'You have been told something in confidence that affects someone else you are close to. Not telling them feels dishonest; telling them breaks a confidence.',
    a: 'Go back to the person who told you and ask them to tell it themselves',
    b: 'Say nothing and let it come out the way it would have anyway',
    lines: ['Both people would find out you knew.', 'The thing will surface within a few weeks either way.'],
  },
  {
    topic: 'workplace',
    prompt: 'You committed to something and have realised you cannot deliver it to the standard expected in the time left.',
    a: 'Say so now, propose a reduced version, and deliver that well',
    b: 'Deliver what you can by the date and flag the shortfall when you hand it over',
    lines: ['Nobody has asked how it is going.', 'The date matters more to them than the scope does.'],
  },
];

const OPINION = [
  { topic: 'community', prompt: 'Some organisations have begun paying people a small amount for work that was previously voluntary. Do you think that work should be paid? Explain your position.' },
  { topic: 'education', prompt: 'Some argue that time spent teaching a second language in school would be better spent elsewhere, since translation tools are now widely available. What is your view?' },
  { topic: 'workplace', prompt: 'Some employers now publish the pay range for every role they advertise. Others argue this makes negotiation harder for the candidate. What do you think?' },
  { topic: 'community', prompt: 'Some cities have made public transport free at certain times rather than improving how often it runs. Which approach do you think is better, and why?' },
  { topic: 'daily life', prompt: 'Some people argue that being reachable at all times has changed what we consider rude rather than making us ruder. Do you agree?' },
  { topic: 'workplace', prompt: 'Some organisations have replaced annual performance reviews with continuous informal feedback. Do you think that is an improvement? Explain.' },
  { topic: 'education', prompt: 'Some argue that learning facts matters less now that information is always available, and that schools should teach judgement instead. What is your view?' },
  { topic: 'community', prompt: 'Some places have removed parking from central streets to widen pavements. Others argue this pushes activity out to places only drivers can reach. What do you think?' },
  { topic: 'daily life', prompt: 'Some people argue that it is better to be very good at one thing than reasonably good at several. Do you agree?' },
  { topic: 'workplace', prompt: 'Some employers now recruit without asking for formal qualifications at all, testing candidates directly instead. Is that a better approach? Explain your position.' },
  { topic: 'community', prompt: 'Some argue that a service used by a small number of people intensively deserves funding as much as one used by many people occasionally. What is your view?' },
  { topic: 'education', prompt: 'Some institutions publish how their graduates actually fare afterwards. Others say this reduces education to earnings. What do you think?' },
  { topic: 'daily life', prompt: 'Some people say that having fewer choices makes decisions easier and outcomes better. Do you agree?' },
  { topic: 'personal', prompt: 'Some argue that it is better to tell someone an uncomfortable truth than to protect them from it. Where do you stand?' },
];

/* ------------------------------------------------------------------ */

const TIMINGS: Record<number, [number, number]> = {
  1: [30, 90], 2: [30, 60], 3: [30, 60], 4: [30, 60],
  5: [60, 60], 6: [60, 60], 7: [30, 90], 8: [30, 60],
};

const TASK_TYPES: Record<number, string> = {
  1: 'speaking.t1_advice',
  2: 'speaking.t2_experience',
  3: 'speaking.t3_scene',
  4: 'speaking.t4_predictions',
  5: 'speaking.t5_persuade',
  6: 'speaking.t6_difficult',
  7: 'speaking.t7_opinion',
  8: 'speaking.t8_unusual',
};

/**
 * Build one generated speaking task for the given task number.
 *
 * `taskNumber` is required rather than random so a caller can top up a specific
 * task type — the eight are not interchangeable, and a learner who is weak on
 * Task 5 needs Task 5.
 */
export function generateSpeakingTask(taskNumber: number, seed: string): SeedSpeakingTask {
  const rng = new Rng(seed);
  const [prepSeconds, speakSeconds] = TIMINGS[taskNumber];
  const base = {
    slug: `gen-speak-t${taskNumber}-${seed}`,
    taskType: TASK_TYPES[taskNumber],
    taskNumber,
    prepSeconds,
    speakSeconds,
  };

  switch (taskNumber) {
    case 1: {
      const frame = rng.pick(ADVICE);
      return {
        ...base,
        title: 'Generated task: giving advice',
        prompt: frame.prompt,
        context: { lines: frame.lines },
        level: 10,
        topic: frame.topic,
        successCriteria: [
          'Commits to one recommendation in the first two sentences',
          'Gives at least two reasons tied to this person’s specific situation',
          'Names a risk or drawback of the option recommended',
          'Ends with a concrete next step they can take',
        ],
        modelNotes:
          'Advice tasks fail when they present both options evenly and never choose. Commit early — the remaining time is for defending the choice, not for reaching it. The detail that lifts a response is using the context you were given rather than reciting general advice: the two lines under the prompt are there because they should change what you recommend. Naming a drawback of your own recommendation is counter-intuitive and it reads as judgement rather than weakness.',
      };
    }

    case 2: {
      const frame = rng.pick(EXPERIENCE);
      return {
        ...base,
        title: 'Generated task: a personal experience',
        prompt: frame.prompt,
        level: 9,
        topic: frame.topic,
        successCriteria: [
          'Establishes when and where in the first sentence',
          'Keeps one clear sequence of events rather than doubling back',
          'Includes what you were thinking or feeling at one specific moment',
          'Closes with the outcome rather than trailing off',
        ],
        modelNotes:
          'Sixty seconds is roughly four sentences of setup and four of consequence, and the commonest failure is spending fifty of them on background. Anchor time and place immediately, then move. One interior moment — the second you realised, the thing you checked first — does more for the band than three more facts, because it is the part that sounds like a person rather than a report. Past narrative also has to hold its tenses: a slip into the present is the single most frequent grammar loss on this task.',
      };
    }

    case 3: {
      const setting = rng.pick(SETTINGS);
      return {
        ...base,
        title: 'Generated task: describe the scene',
        prompt: 'Describe this scene to someone who cannot see it. Include enough detail that they could picture it clearly.',
        context: { scene: buildScene(setting, rng) },
        level: 9,
        topic: setting.topic,
        successCriteria: [
          'Uses a consistent spatial order rather than jumping around the scene',
          'Describes people by what they are doing, not only by appearance',
          'Conveys the conditions through their effects rather than by naming them repeatedly',
          'Locates things relative to each other with varied prepositions',
        ],
        modelNotes:
          'Description is scored on organisation as much as on vocabulary. Pick an order — foreground, then the side, then the background — and hold it; a listener building a picture cannot cope with jumping. An opening sentence that frames the whole scene costs three seconds and gives the listener somewhere to put everything that follows. Naming everyone by clothing is the flattening that keeps responses at CLB 7; what they are doing is what individuates them.',
      };
    }

    case 4: {
      const setting = rng.pick(SETTINGS);
      const pending = rng.pick(setting.pendingSituations);
      return {
        ...base,
        title: 'Generated task: predict what happens next',
        prompt: 'Look at the situation described and say what you think will happen next. Explain your reasoning.',
        context: { scene: buildScene(setting, rng, `Right now, ${pending}.`) },
        level: 10,
        topic: setting.topic,
        successCriteria: [
          'Makes at least two distinct predictions rather than one elaborated guess',
          'Grounds each prediction in something visible in the situation',
          'Marks predictions as predictions with appropriate hedging',
          'Distinguishes what is likely from what is merely possible',
        ],
        modelNotes:
          'The task is reasoning, not fortune-telling, and the reasoning has to be traceable to the detail you were given. Two predictions with visible grounds beat five plausible-sounding ones. Modality is what the analyser hears and what the descriptors reward — "is likely to", "I would expect", "there is a chance that" — and flattening everything into "will" is the most common single loss here. Predicting for more than one party is what separates reasoning from describing.',
      };
    }

    case 5: {
      const frame = rng.pick(PERSUADE);
      return {
        ...base,
        title: 'Generated task: compare and persuade',
        prompt: 'Choose ONE of the two options and persuade the other person that it is the better choice for them.',
        context: { options: [frame.a, frame.b], lines: [frame.line] },
        level: 10,
        topic: frame.topic,
        successCriteria: [
          'Chooses one option explicitly at the start',
          'Argues from the listener’s stated priority, not your own',
          'Acknowledges the strongest point for the other option',
          'Closes with a direct call to act',
        ],
        modelNotes:
          'The line under the options tells you what the listener actually cares about, and the persuasive move is to use that rather than the consideration you would weigh most. Persuasion is not balanced comparison — an even-handed minute fails this task even when every sentence is well formed. Finishing with a proposal rather than a summary converts a speech into a decision, which is what persuasion is for.',
      };
    }

    case 6: {
      const frame = rng.pick(DIFFICULT);
      return {
        ...base,
        title: 'Generated task: a difficult situation',
        prompt: `${frame.prompt} Choose what you will do and explain the choice.`,
        context: { options: [frame.a, frame.b], lines: frame.lines },
        level: 11,
        topic: frame.topic,
        successCriteria: [
          'Commits to one course of action rather than describing the dilemma',
          'Says how it will be handled, not only what will be done',
          'Acknowledges what is lost by the choice made',
          'Protects the ongoing relationship explicitly',
        ],
        modelNotes:
          'These tasks are scored on the handling, not on being right. A response that spends most of its time weighing an unresolvable conflict has not done what was asked. Because both options cost something, how the message is delivered carries most of the marks: saying a difficult thing in person and early is a different act from saying it late, and stating that difference is what demonstrates the judgement being assessed. Naming the loss honestly is stronger than minimising it.',
      };
    }

    case 7: {
      const frame = rng.pick(OPINION);
      return {
        ...base,
        title: 'Generated task: expressing an opinion',
        prompt: frame.prompt,
        level: 11,
        topic: frame.topic,
        successCriteria: [
          'States a position in the first fifteen seconds',
          'Supports it with a reason that goes beyond restating the position',
          'Engages seriously with the opposing view',
          'Ends somewhere different from where it began',
        ],
        modelNotes:
          'Ninety seconds is long enough that a thesis-and-three-reasons shape starts to sag; better is one argument developed properly with a real objection answered inside it. The opposing case has to be given its best form rather than a straw version — answering a weak objection tells a listener you could not find a strong one. Watch the scope of the claim you were actually given: answering a broader question than the one asked is the commonest way to lose marks while sounding fluent.',
      };
    }

    default: {
      const setting = rng.pick(SETTINGS);
      const anomaly = rng.pick(setting.anomalies);
      return {
        ...base,
        title: 'Generated task: an unusual situation',
        prompt: 'Describe this unusual situation to someone who cannot see it, and say what you think is going on.',
        context: { scene: buildScene(setting, rng, `What is strange is that ${anomaly}.`) },
        level: 11,
        topic: setting.topic,
        successCriteria: [
          'Describes the scene before interpreting it',
          'Names precisely what makes the situation unusual',
          'Marks interpretation as interpretation',
          'Offers more than one possible explanation',
        ],
        modelNotes:
          'The unusual element is a mismatch, and naming it explicitly gives the listener the frame for everything else. Description first, then interpretation, then hedged speculation — collapsing those into one stream is what makes weaker responses hard to follow. Two competing explanations, each tied to a specific detail, demonstrate exactly the control the top band looks for; one confident explanation does not, however plausible it is.',
      };
    }
  }
}

/** Every task number, so a caller can top up the whole section at once. */
export const SPEAKING_TASK_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
