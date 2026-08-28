export type RuleType = 'rotation' | 'fixed';
export type MissedPolicy = 'hold' | 'advance';

export interface Person {
  id: string;
  name: string;
  available: boolean;
  createdAt: string;
}

export interface Chore {
  id: string;
  name: string;
  intervalDays: number;
  effortMinutes: number;
  rule: RuleType;
  fixedPersonId?: string;
  missedPolicy: MissedPolicy;
  createdAt: string;
}

export interface Completion {
  id: string;
  choreId: string;
  personId: string;
  completedAt: string;
  dueAt: string;
  note?: string;
}

export interface HouseholdState {
  version: 1;
  householdName: string;
  people: Person[];
  chores: Chore[];
  completions: Completion[];
  updatedAt: string;
}

export interface Assignment {
  person?: Person;
  dueAt: string;
  overdueDays: number;
  explanation: string;
  unavailable: boolean;
}
