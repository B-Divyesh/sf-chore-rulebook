import type { HouseholdState } from './types';

const dbName = 'chore-rulebook';
const storeName = 'household';
const stateKey = 'current';

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
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadState(): Promise<HouseholdState> {
  const db = await openDatabase();
  return new Promise<HouseholdState>((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(stateKey);
    request.onsuccess = () => resolve((request.result as HouseholdState | undefined) ?? emptyState());
    request.onerror = () => reject(request.error ?? new Error('Your rulebook could not be read.'));
  }).finally(() => db.close());
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
  if (input.people.some((person) => !person.id || !person.name) || input.chores.some((chore) => !chore.id || !chore.name)) {
    throw new Error('That backup is incomplete and was not imported.');
  }
  return { ...input, householdName: input.householdName ?? '', updatedAt: new Date().toISOString() } as HouseholdState;
}
