/**
 * Structured self-review: what happens when there is no teacher.
 *
 * This product is self-serve. Most workspaces have exactly one person in them,
 * and that person is the learner — so "ask a teacher to read this" is a button
 * that leads nowhere, and showing it would be a promise the software cannot
 * keep.
 *
 * The honest alternative is not a simulated teacher. It is the thing a good
 * teacher would make the learner do anyway, written down and made specific.
 * Self-explanation against a stated standard is one of the better-evidenced
 * study techniques there is; what makes it fail in practice is vagueness.
 * "Check your work" produces nothing. "Quote the sentence that satisfies this
 * requirement, and if you cannot quote one it is not there" produces a rewrite.
 *
 * So every pass below is built from something already measured — a requirement
 * the analyser could not find evidence of, the dimension that scored lowest,
 * the priority it already named — and every question can be answered by looking
 * at the learner's own text. Nothing here judges the response. The passes are
 * questions, and the learner answers them.
 *
 * What this is not, stated on the page as well as here: it is not a person's
 * judgement, and it is not a language model reading the work. There is no model
 * in this path and no score comes out of it. If that distinction ever blurs,
 * this file has gone wrong.
 */

export interface SelfReviewInput {
  kind: 'writing' | 'speaking';
  /** Requirements or success criteria, and whether evidence was found. */
  coverage: { requirement: string; covered: boolean }[];
  /** Dimensions with their measured level, lowest first is computed here. */
  dimensions: { label: string; level: number; note: string }[];
  /** The priorities the analyser already named, in its own order. */
  priorities: { title: string; how: string }[];
  /** What a strong response to this task does — the task's own notes. */
  modelNotes: string | null;
  /** The estimate, used only to set the standard the learner reads against. */
  estimatedLevel: number;
  targetLevel: number;
}

export interface SelfReviewPass {
  key: string;
  /** One narrow job, in the order a trained marker would do them. */
  title: string;
  /** Why this pass exists — the reasoning, not an instruction. */
  rationale: string;
  /** Questions the learner answers by looking at their own response. */
  questions: string[];
}

export interface SelfReview {
  passes: SelfReviewPass[];
  /** The single action the protocol is aiming at. */
  close: string;
}

export function buildSelfReview(input: SelfReviewInput): SelfReview {
  const passes: SelfReviewPass[] = [];
  const isWriting = input.kind === 'writing';
  const text = isWriting ? 'text' : 'transcript';
  const wrote = isWriting ? 'wrote' : 'said';

  /* --- 1. Requirements. The cheapest marks on the paper. --- */
  const uncovered = input.coverage.filter((item) => !item.covered);
  if (uncovered.length) {
    passes.push({
      key: 'requirements',
      title: `Find the evidence for ${uncovered.length} requirement${uncovered.length === 1 ? '' : 's'}`,
      rationale:
        'The analyser could not find these in what you ' +
        wrote +
        '. It matches wording, so it can miss a point you made in very different words — which is exactly why you are the one who should check. A requirement you meant to cover but did not state is the most common way a strong response loses marks.',
      questions: uncovered.map(
        (item) =>
          `Quote the sentence that satisfies: “${item.requirement}”. If you cannot quote one, it is not there — write it now.`,
      ),
    });
  } else if (input.coverage.length) {
    passes.push({
      key: 'requirements',
      title: 'Check the requirements are answered, not just mentioned',
      rationale:
        'Every requirement was found in what you ' +
        wrote +
        '. Being present and being answered are different things, and the second is what is marked.',
      questions: input.coverage.map(
        (item) =>
          `For “${item.requirement}” — does your ${text} settle it, or only raise it? Point at the sentence that settles it.`,
      ),
    });
  }

  /* --- 2. The weakest dimension, with its own evidence. --- */
  const weakest = [...input.dimensions].sort((a, b) => a.level - b.level)[0];
  if (weakest) {
    passes.push({
      key: 'weakest',
      title: `Read once for ${weakest.label.toLowerCase()} alone`,
      rationale: `This scored lowest of everything measured, at CLB ${weakest.level.toFixed(
        1,
      )}. ${weakest.note} Reading for one thing at a time is how a marker reads; reading for everything at once is how a writer reads their own work, and it is why the same fault survives three rereads.`,
      questions: [
        `Ignore every other quality. Where in your ${text} is ${weakest.label.toLowerCase()} weakest — which specific sentence?`,
        'What would you change in that one sentence? Make the change before moving on.',
      ],
    });
  }

  /* --- 3. The named priority, turned back into a question. --- */
  const priority = input.priorities[0];
  if (priority) {
    passes.push({
      key: 'priority',
      title: priority.title,
      rationale:
        'The analysis already named this as the first thing to change. Doing it is worth more than reading it, which is the whole difference between feedback and practice.',
      questions: [
        priority.how,
        `Having done that, is the change visible in your ${text}, or only in your intention?`,
      ],
    });
  }

  /* --- 4. The reader pass. Nothing measured; only noticing. --- */
  passes.push({
    key: 'reader',
    title: isWriting ? 'Read it aloud, once, without stopping' : 'Listen back to the whole recording',
    rationale: isWriting
      ? 'Reading aloud catches what silent reading repairs automatically — a clause that runs too long, a connector that does not connect, a sentence you can only get through by knowing what it meant to say. Your reader will not have that advantage.'
      : 'You know what you meant, which is why the gaps are invisible from the inside. Listening back is the only way to hear it approximately as an examiner would.',
    questions: isWriting
      ? [
          'Mark every place you stumbled or had to go back. Those are where a reader will.',
          'Fix the stumbles before you fix anything else — they cost more than the errors you are worried about.',
        ]
      : [
          'Mark every pause longer than about two seconds. Was each one thinking, or searching for a word?',
          'A thinking pause is fine and often reads as control. A searching pause is a vocabulary problem wearing a fluency costume — note which kind yours were.',
        ],
  });

  /* --- 5. The standard. --- */
  if (input.modelNotes) {
    passes.push({
      key: 'standard',
      title: 'Read the task’s notes again, against your own response',
      rationale:
        'These are the moves this task rewards. They were written before you responded, so they are a standard rather than a reaction — and comparing your own work against a standard is a different act from remembering what you were aiming at.',
      questions: [
        input.modelNotes,
        `Which of those moves does your ${text} make? Which does it not?`,
      ],
    });
  }

  const gap = input.targetLevel - input.estimatedLevel;
  const close =
    gap > 0.5
      ? `Now write it again with your answers in front of you. The estimate sits about ${gap.toFixed(
          1,
        )} below your target, and a second attempt at the same task — with the faults named — moves an estimate faster than a first attempt at a new one.`
      : 'Now write it again with your answers in front of you. A second attempt at the same task, with the faults named, is worth more than a first attempt at a new one.';

  return { passes, close };
}
