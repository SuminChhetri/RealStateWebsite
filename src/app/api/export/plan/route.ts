import { checkFeature, requireSessionApi } from '@/lib/auth/guard';
import { getProfile } from '@/lib/learner/profile';
import { generatePlan } from '@/lib/engines/plan';
import { tryMicroSkill } from '@/lib/content/taxonomy';

export const dynamic = 'force-dynamic';

/**
 * The study plan as an `.ics` calendar.
 *
 * A plan that lives on a page has to be remembered; a plan on a calendar
 * competes with the rest of a working adult's week, which is the actual
 * problem. iCalendar is a plain-text format, so this needs no dependency and
 * no service.
 *
 * Gated — but the gate is `checkFeature` on the server, not a hidden link.
 */

/** Escape per RFC 5545: commas, semicolons, backslashes and newlines. */
function ics(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** RFC 5545 caps a content line at 75 octets; longer lines fold onto a space. */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [line.slice(0, 73)];
  let rest = line.slice(73);
  while (rest.length > 72) {
    parts.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  if (rest) parts.push(` ${rest}`);
  return parts.join('\r\n');
}

function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function dayStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

export async function GET() {
  const session = await requireSessionApi();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const gate = await checkFeature(session, 'calendar_export');
  if (!gate.allowed) {
    return new Response(
      `Calendar export is part of ${gate.required?.name ?? 'a paid plan'}. Your account is on ${gate.plan.name}.`,
      { status: 402, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const profile = await getProfile(session.userId, session.orgId);

  // The same inputs the plan page uses, so the calendar and the page cannot
  // disagree about what the plan is.
  const weakMicroSkills = profile.skills
    .flatMap((estimate) =>
      estimate.weakest.map((weak) => ({
        microSkill: weak.microSkill,
        skill: estimate.skill,
        theta: weak.theta,
        label: tryMicroSkill(weak.microSkill)?.label ?? weak.microSkill,
      })),
    )
    .sort((a, b) => a.theta - b.theta);

  const plan = generatePlan({
    horizonDays: profile.daysToExam !== null ? Math.max(1, Math.min(60, profile.daysToExam)) : 28,
    startDate: new Date(),
    targetLevel: profile.targetLevel,
    minutesPerDay: profile.minutesPerDay,
    daysPerWeek: profile.daysPerWeek,
    skills: profile.skills,
    weakMicroSkills,
    examDate: profile.examDate,
  });

  const now = new Date();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meridian//CELPIP study plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${ics('Meridian study plan')}`,
  ];

  plan.days.forEach((day, index) => {
    // A rest day is part of the plan, but it is not an appointment.
    if (day.rest || day.blocks.length === 0) return;

    const date = new Date(now.getTime() + index * 86400000);
    const next = new Date(date.getTime() + 86400000);
    const summary = `${day.blocks.reduce((total, block) => total + block.minutes, 0)} min — ${
      day.blocks[0]?.title ?? 'Study'
    }`;
    const description = day.blocks
      .map((block) => `${block.minutes} min · ${block.title}: ${block.note}`)
      .join('\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${dayStamp(date)}-${index}@meridian.local`,
      `DTSTAMP:${stamp(now)}`,
      // All-day events, because the plan says what to do that day, not at what
      // hour — inventing a time would be a claim about someone's schedule.
      `DTSTART;VALUE=DATE:${dayStamp(date)}`,
      `DTEND;VALUE=DATE:${dayStamp(next)}`,
      fold(`SUMMARY:${ics(summary)}`),
      fold(`DESCRIPTION:${ics(description)}`),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');

  return new Response(`${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="meridian-study-plan.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
