import { describe, expect, it } from 'vitest';
import { assignmentFor, weeklyEffort } from './rules';
import type { Chore, Completion, Person } from './types';

const people: Person[] = [
  { id: 'a', name: 'Alex', available: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'b', name: 'Bo', available: true, createdAt: '2026-01-02T00:00:00Z' },
  { id: 'c', name: 'Casey', available: false, createdAt: '2026-01-03T00:00:00Z' },
];
const chore: Chore = { id: 'dishes', name: 'Dishes', intervalDays: 2, effortMinutes: 20, rule: 'rotation', missedPolicy: 'hold', createdAt: '2026-08-25T00:00:00Z' };

describe('assignment rules', () => {
  it('advances from the last person and skips unavailable people', () => {
    const history: Completion[] = [{ id: '1', choreId: 'dishes', personId: 'b', completedAt: '2026-08-25T12:00:00Z', dueAt: '2026-08-25' }];
    const result = assignmentFor(chore, people, history, new Date('2026-08-28T12:00:00Z'));
    expect(result.person?.name).toBe('Alex');
    expect(result.dueAt).toBe('2026-08-27');
    expect(result.overdueDays).toBe(1);
    expect(result.explanation).toContain('away person was skipped');
  });

  it('keeps a fixed owner and reports away status', () => {
    const result = assignmentFor({ ...chore, rule: 'fixed', fixedPersonId: 'c' }, people, [], new Date('2026-08-28T12:00:00Z'));
    expect(result.person?.name).toBe('Casey');
    expect(result.unavailable).toBe(true);
  });

  it('passes full missed intervals when that recovery rule is selected', () => {
    const daily = { ...chore, intervalDays: 1, missedPolicy: 'advance' as const };
    const history: Completion[] = [{ id: '1', choreId: 'dishes', personId: 'a', completedAt: '2026-08-25T12:00:00Z', dueAt: '2026-08-25' }];
    const result = assignmentFor(daily, people, history, new Date('2026-08-28T12:00:00Z'));
    expect(result.person?.name).toBe('Alex');
    expect(result.explanation).toContain('2 missed turns have passed');
  });

  it('totals recorded effort over the last seven days', () => {
    const history: Completion[] = [{ id: '1', choreId: 'dishes', personId: 'a', completedAt: '2026-08-27T12:00:00Z', dueAt: '2026-08-27' }];
    expect(weeklyEffort(people, [chore], history, new Date('2026-08-28T12:00:00Z')).get('a')).toBe(20);
  });
});
