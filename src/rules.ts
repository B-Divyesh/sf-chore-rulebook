import type { Assignment, Chore, Completion, Person } from './types';

const dayMs = 86_400_000;

export function dateOnly(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${dateOnly(iso)}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
}

export function choreHistory(chore: Chore, completions: Completion[]): Completion[] {
  return completions
    .filter((item) => item.choreId === chore.id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function assignmentFor(
  chore: Chore,
  people: Person[],
  completions: Completion[],
  now = new Date(),
): Assignment {
  const history = choreHistory(chore, completions);
  const last = history[0];
  const dueAt = last ? addDays(last.completedAt, chore.intervalDays) : dateOnly(chore.createdAt);
  const today = new Date(`${dateOnly(now)}T12:00:00.000Z`).getTime();
  const due = new Date(`${dueAt}T12:00:00.000Z`).getTime();
  const overdueDays = Math.max(0, Math.floor((today - due) / dayMs));

  if (chore.rule === 'fixed') {
    const person = people.find((item) => item.id === chore.fixedPersonId);
    return {
      person,
      dueAt,
      overdueDays,
      unavailable: Boolean(person && !person.available),
      explanation: person
        ? `${person.name} owns this chore under its fixed-owner rule. The owner does not change after completion${person.available ? '.' : ', and is currently marked away.'}`
        : 'This fixed-owner rule needs an owner. Edit the chore and choose a person.',
    };
  }

  const available = people.filter((person) => person.available);
  if (!available.length) {
    return {
      dueAt,
      overdueDays,
      unavailable: true,
      explanation: 'Nobody is marked available. Mark at least one person as home to resume this rotation.',
    };
  }

  let person: Person;
  let skipped = 0;
  if (!last) {
    const start = stableIndex(chore.id, people.length);
    person = people[start] ?? available[0];
    while (!person.available && skipped < people.length) {
      skipped += 1;
      person = people[(start + skipped) % people.length];
    }
  } else {
    const previousIndex = Math.max(0, people.findIndex((item) => item.id === last.personId));
    let offset = 1;
    person = people[(previousIndex + offset) % people.length] ?? available[0];
    while (!person.available && offset <= people.length) {
      skipped += 1;
      offset += 1;
      person = people[(previousIndex + offset) % people.length] ?? available[0];
    }
  }

  const turn = last
    ? `${person.name} follows ${people.find((item) => item.id === last.personId)?.name ?? 'the previous turn'} in household order.`
    : `${person.name} starts this rotation from its stable place in household order.`;
  const absence = skipped ? ` ${skipped} away ${skipped === 1 ? 'person was' : 'people were'} skipped.` : '';
  const recovery = overdueDays
    ? chore.missedPolicy === 'hold'
      ? ` It is ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} late, so the turn stays here until it is recorded.`
      : ` It is late; completing it advances the next turn normally.`
    : '';

  return { person, dueAt, overdueDays, unavailable: false, explanation: `${turn}${absence}${recovery}` };
}

function stableIndex(value: string, length: number): number {
  if (!length) return 0;
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % length;
}

export function weeklyEffort(people: Person[], chores: Chore[], completions: Completion[], now = new Date()): Map<string, number> {
  const cutoff = now.getTime() - 7 * dayMs;
  const effort = new Map(people.map((person) => [person.id, 0]));
  for (const completion of completions) {
    if (new Date(completion.completedAt).getTime() < cutoff) continue;
    const minutes = chores.find((chore) => chore.id === completion.choreId)?.effortMinutes ?? 0;
    effort.set(completion.personId, (effort.get(completion.personId) ?? 0) + minutes);
  }
  return effort;
}
