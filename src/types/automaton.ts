export interface State {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbol: string;
}

export interface Automaton {
  states: State[];
  transitions: Transition[];
  alphabet: string[];
}

export interface ValidationStep {
  currentState: string;
  symbol: string;
  nextState: string;
  remainingInput: string;
  stepNumber: number;
}

export interface ValidationResult {
  accepted: boolean;
  steps: ValidationStep[];
  finalState: string;
}