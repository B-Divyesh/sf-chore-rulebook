import { describe, expect, it } from 'vitest';
import { validateImport } from './db';

const valid = {
  version: 1,
  householdName: 'Cedar House',
  people: [{ id: 'p1', name: 'Alex', available: true, createdAt: '2026-08-01T00:00:00.000Z' }],
  chores: [{ id: 'c1', name: 'Kitchen reset', intervalDays: 1, effortMinutes: 20, rule: 'rotation', missedPolicy: 'hold', createdAt: '2026-08-01T00:00:00.000Z' }],
  completions: [{ id: 'x1', choreId: 'c1', personId: 'p1', completedAt: '2026-08-02T12:00:00.000Z', dueAt: '2026-08-02', note: 'Done' }],
  updatedAt: '2026-08-02T12:00:00.000Z',
};

describe('backup validation', () => {
  it('accepts a complete version-1 backup and trims names', () => {
    expect(validateImport({ ...valid, householdName: ' Cedar House ' }).householdName).toBe('Cedar House');
  });

  it('rejects string intervals before they can be persisted', () => {
    const malformed = structuredClone(valid);
    (malformed.chores[0] as { intervalDays: unknown }).intervalDays = '7';
    expect(() => validateImport(malformed)).toThrow('invalid fields');
  });

  it('rejects impossible dates before they can brick date rendering', () => {
    const malformed = structuredClone(valid);
    malformed.chores[0].createdAt = 'not-a-date';
    expect(() => validateImport(malformed)).toThrow('invalid fields');
  });
});
