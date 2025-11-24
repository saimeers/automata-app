export type State = string;
export type Symbol = string;

export interface DFATransitions {
  [state: string]: {
    [symbol: string]: State;
  };
}

export interface DFA {
  states: State[];
  alphabet: Symbol[];
  start: State;
  accept: Set<State>;
  transition: DFATransitions;
}

export interface MinimizedDFA extends DFA {
  stateMapping?: Map<State, State>; // Estado original -> representante
}

export interface MinimizationStep {
  stepNumber: number;
  description: string;
  partitions: Set<State>[];
  changedPartitions?: Set<State>[];
}

export interface ValidationResult {
  accepted: boolean;
  path: State[];
  finalState: State;
}

export interface DFABuilderConfig {
  states: State[];
  alphabet: Symbol[];
  start: State;
  acceptStates: State[];
  transitions: Array<{
    from: State;
    symbol: Symbol;
    to: State;
  }>;
}