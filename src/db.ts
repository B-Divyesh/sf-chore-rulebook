import type { Chore, Completion, HouseholdState, Person } from './types';

const realDbName = 'chore-rulebook';
const demoDbName = 'demo:chore-rulebook';
const storeName = 'household';
const stateKey = 'current';
let recoveredInvalidState = false;

export const isDemoMode = (): boolean => location.pathname === '/demo';
const currentDbName = (): string => isDemoMode() ? demoDbName : realDbName;

export function emptyState(): HouseholdState {
  return {
    version: 1,
    householdName: '',
    people: [],
    chores: [],
    completions: [],
    updatedAt: new Date().toISOString(),
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(currentDbName(), 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadState(): Promise<HouseholdState> {
  const db = await openDatabase();
  return new Promise<HouseholdState>((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(stateKey);
    request.onsuccess = () => {
      if (request.result === undefined) {
        resolve(isDemoMode() ? sampleState() : emptyState());
        return;
      }
      try {
        resolve(validateImport(request.result));
      } catch {
        recoveredInvalidState = true;
        resolve(isDemoMode() ? sampleState() : emptyState());
      }
    };
    request.onerror = () => reject(request.error ?? new Error('Your rulebook could not be read.'));
  }).finally(() => db.close());
}

export function consumedRecoveryNotice(): boolean {
  const result = recoveredInvalidState;
  recoveredInvalidState = false;
  return result;
}

export async function resetDemoState(): Promise<void> {
  if (!isDemoMode()) return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(demoDbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('The demo could not be reset.'));
    request.onblocked = () => reject(new Error('Close another demo tab, then reset again.'));
  });
}

export async function saveState(state: HouseholdState): Promise<void> {
  state.updatedAt = new Date().toISOString();
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(state, stateKey);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Your change could not be saved.'));
  }).finally(() => db.close());
}

export function validateImport(value: unknown): HouseholdState {
  if (!value || typeof value !== 'object') throw new Error('That file does not contain a Chore Rulebook backup.');
  const input = value as Partial<HouseholdState>;
  if (input.version !== 1 || !Array.isArray(input.people) || !Array.isArray(input.chores) || !Array.isArray(input.completions)) {
    throw new Error('That backup format is not supported. Choose a JSON export from Chore Rulebook.');
  }
  const householdName = cleanText(input.householdName, 60);
  if (!householdName || input.people.length > 100 || input.chores.length > 500 || input.completions.length > 10_000) invalid();

  const people = input.people.map((value) => {
    if (!value || typeof value !== 'object') invalid();
    const person = value as Partial<Person>;
    const id = cleanText(person.id, 100);
    const name = cleanText(person.name, 60);
    if (!id || !name || typeof person.available !== 'boolean' || !validDate(person.createdAt)) invalid();
    return { id, name, available: person.available, createdAt: person.createdAt } as Person;
  });
  const personIds = new Set(people.map(({ id }) => id));
  if (personIds.size !== people.length) invalid();

  const chores = input.chores.map((value) => {
    if (!value || typeof value !== 'object') invalid();
    const chore = value as Partial<Chore>;
    const id = cleanText(chore.id, 100);
    const name = cleanText(chore.name, 80);
    if (!id || !name || !integerIn(chore.intervalDays, 1, 365) || !integerIn(chore.effortMinutes, 5, 600)
      || !['rotation', 'fixed'].includes(chore.rule ?? '') || !['hold', 'advance'].includes(chore.missedPolicy ?? '')
      || !validDate(chore.createdAt)) invalid();
    const fixedPersonId = chore.fixedPersonId === undefined ? undefined : cleanText(chore.fixedPersonId, 100);
    if (chore.rule === 'fixed' && (!fixedPersonId || !personIds.has(fixedPersonId))) invalid();
    return { id, name, intervalDays: chore.intervalDays, effortMinutes: chore.effortMinutes, rule: chore.rule,
      fixedPersonId: chore.rule === 'fixed' ? fixedPersonId : undefined, missedPolicy: chore.missedPolicy,
      createdAt: chore.createdAt } as Chore;
  });
  const choreIds = new Set(chores.map(({ id }) => id));
  if (choreIds.size !== chores.length) invalid();

  const completions = input.completions.map((value) => {
    if (!value || typeof value !== 'object') invalid();
    const completion = value as Partial<Completion>;
    const id = cleanText(completion.id, 100);
    const choreId = cleanText(completion.choreId, 100);
    const personId = cleanText(completion.personId, 100);
    const note = completion.note === undefined ? undefined : cleanText(completion.note, 280, true);
    if (!id || !choreId || !personId || !validDate(completion.completedAt) || !validDateOnly(completion.dueAt)
      || (completion.note !== undefined && note === undefined)) invalid();
    return { id, choreId, personId, completedAt: completion.completedAt, dueAt: completion.dueAt,
      note: note || undefined } as Completion;
  });
  if (new Set(completions.map(({ id }) => id)).size !== completions.length) invalid();

  return { version: 1, householdName, people, chores, completions, updatedAt: new Date().toISOString() };
}

function invalid(): never { throw new Error('That backup has invalid fields and was not imported.'); }
function cleanText(value: unknown, max: number, allowEmpty = false): string | undefined {
  if (typeof value !== 'string' || value.length > max) return undefined;
  const result = value.trim();
  return result || allowEmpty ? result : undefined;
}
function validDate(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
}
function validDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(`${value}T12:00:00.000Z`).toISOString().slice(0, 10) === value;
}
function integerIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function sampleState(): HouseholdState {
  const today = new Date();
  const iso = (days: number) => {
    const date = new Date(today); date.setUTCDate(date.getUTCDate() + days); return date.toISOString();
  };
  const people: Person[] = [
    { id: 'demo-alex', name: 'Alex', available: true, createdAt: iso(-60) },
    { id: 'demo-bo', name: 'Bo', available: true, createdAt: iso(-59) },
    { id: 'demo-casey', name: 'Casey', available: false, createdAt: iso(-58) },
  ];
  const chores: Chore[] = [
    { id: 'demo-kitchen', name: 'Kitchen reset', intervalDays: 1, effortMinutes: 25, rule: 'rotation', missedPolicy: 'hold', createdAt: iso(-40) },
    { id: 'demo-bathroom', name: 'Clean the bathroom', intervalDays: 7, effortMinutes: 40, rule: 'rotation', missedPolicy: 'advance', createdAt: iso(-38) },
    { id: 'demo-plants', name: 'Water the plants', intervalDays: 4, effortMinutes: 10, rule: 'fixed', fixedPersonId: 'demo-bo', missedPolicy: 'hold', createdAt: iso(-36) },
    { id: 'demo-laundry', name: 'Wash household towels', intervalDays: 5, effortMinutes: 30, rule: 'rotation', missedPolicy: 'hold', createdAt: iso(-35) },
  ];
  const completions: Completion[] = [
    { id: 'demo-done-1', choreId: 'demo-kitchen', personId: 'demo-alex', completedAt: iso(-1), dueAt: iso(-1).slice(0, 10), note: 'Wiped the cooker controls.' },
    { id: 'demo-done-2', choreId: 'demo-bathroom', personId: 'demo-bo', completedAt: iso(-8), dueAt: iso(-8).slice(0, 10) },
    { id: 'demo-done-3', choreId: 'demo-plants', personId: 'demo-bo', completedAt: iso(-3), dueAt: iso(-3).slice(0, 10), note: 'Fern soil was still damp.' },
    { id: 'demo-done-4', choreId: 'demo-laundry', personId: 'demo-casey', completedAt: iso(-6), dueAt: iso(-6).slice(0, 10) },
  ];
  return { version: 1, householdName: 'Cedar House', people, chores, completions, updatedAt: today.toISOString() };
}
