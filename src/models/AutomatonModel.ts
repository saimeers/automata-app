import type { Automaton, State, Transition } from '../types/automaton';

export class AutomatonModel {
  private states: Map<string, State>;
  private transitions: Map<string, Transition[]>;
  private alphabet: Set<string>;

  constructor(automaton: Automaton) {
    this.states = new Map(automaton.states.map(s => [s.id, s]));
    this.alphabet = new Set(automaton.alphabet);
    
    // Organizar transiciones por estado origen
    this.transitions = new Map();
    automaton.transitions.forEach(t => {
      if (!this.transitions.has(t.from)) {
        this.transitions.set(t.from, []);
      }
      this.transitions.get(t.from)!.push(t);
    });
  }

  getInitialState(): State | undefined {
    return Array.from(this.states.values()).find(s => s.isInitial);
  }

  getState(id: string): State | undefined {
    return this.states.get(id);
  }

  getTransitionsFrom(stateId: string): Transition[] {
    return this.transitions.get(stateId) || [];
  }

  getTransition(fromState: string, symbol: string): Transition | undefined {
    const transitions = this.getTransitionsFrom(fromState);
    return transitions.find(t => t.symbol === symbol);
  }

  isFinalState(stateId: string): boolean {
    return this.states.get(stateId)?.isFinal || false;
  }

  getAllStates(): State[] {
    return Array.from(this.states.values());
  }

  getAllTransitions(): Transition[] {
    const allTransitions: Transition[] = [];
    this.transitions.forEach(transitions => {
      allTransitions.push(...transitions);
    });
    return allTransitions;
  }
}