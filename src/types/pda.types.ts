export interface Transition {
  id?: string;
  from: string;
  to: string;
  read: string;
  pop: string[];
  push: string[];
}

export interface StepRecord {
  state: string;
  readSymbol: string | null;
  transition?: Transition;
  stacks: string[][];
  idx: number;
}

export interface ValidateResult {
  accepted: boolean;
  trace: StepRecord[];
  error?: string;
}

export interface ExerciseConfig {
  id: number;
  description: string;
  example: string;
  strategy: string[];
}

export interface CustomPDAConfig {
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  numStacks: number;
  initialState: string;
  acceptStates: string[];
  transitions: Transition[];
}