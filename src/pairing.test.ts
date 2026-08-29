import { expect, it } from 'vitest';
import { decodePairing, encodePairing } from './pairing';
import type { HouseholdState } from './types';

it('compresses and restores a realistic 40-completion pairing snapshot', async () => {
  const state: HouseholdState = {
    version: 1,
    householdName: 'Cedar House',
    people: Array.from({ length: 4 }, (_, index) => ({ id: `person-${index}`, name: `Person ${index}`, available: true, createdAt: '2026-06-01T00:00:00.000Z' })),
    chores: Array.from({ length: 6 }, (_, index) => ({ id: `chore-${index}`, name: `Household chore ${index}`, intervalDays: index + 1, effortMinutes: 20, rule: 'rotation' as const, missedPolicy: 'hold' as const, createdAt: '2026-06-01T00:00:00.000Z' })),
    completions: Array.from({ length: 40 }, (_, index) => ({ id: `completion-${index}`, choreId: `chore-${index % 6}`, personId: `person-${index % 4}`, completedAt: `2026-07-${String(index % 28 + 1).padStart(2, '0')}T12:00:00.000Z`, dueAt: `2026-07-${String(index % 28 + 1).padStart(2, '0')}`, note: `Checked filters and wiped shared surface ${index}.` })),
    updatedAt: '2026-08-01T00:00:00.000Z',
  };
  const encoded = await encodePairing(state);
  expect(encoded.length).toBeLessThan(2_800);
  expect(await decodePairing(encoded)).toMatchObject({ householdName: 'Cedar House', completions: state.completions });
});
