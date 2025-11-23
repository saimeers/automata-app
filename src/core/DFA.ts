import type { DFA, State, Symbol, ValidationResult } from '../types/dfa.types';

export class DFAClass implements DFA {
  states: State[];
  alphabet: Symbol[];
  start: State;
  accept: Set<State>;
  transition: Record<string, Record<string, State>>;

  constructor(config: DFA) {
    this.states = config.states;
    this.alphabet = config.alphabet;
    this.start = config.start;
    this.accept = new Set(config.accept);
    this.transition = config.transition;
  }

  /**
   * Valida una cadena de entrada
   */
  validate(input: string): ValidationResult {
    const symbols = input.split(',').map(s => s.trim()).filter(Boolean);
    const path: State[] = [this.start];
    let currentState = this.start;

    for (const symbol of symbols) {
      if (!this.alphabet.includes(symbol)) {
        throw new Error(`Símbolo '${symbol}' no está en el alfabeto`);
      }

      const nextState = this.transition[currentState]?.[symbol];
      
      if (!nextState) {
        return {
          accepted: false,
          path,
          finalState: currentState
        };
      }

      currentState = nextState;
      path.push(currentState);
    }

    return {
      accepted: this.accept.has(currentState),
      path,
      finalState: currentState
    };
  }

  /**
   * Verifica si el DFA es determinista (completo)
   */
  isDeterministic(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const state of this.states) {
      for (const symbol of this.alphabet) {
        const transitions = this.transition[state]?.[symbol];
        
        if (!transitions) {
          errors.push(`Falta transición: δ(${state}, ${symbol})`);
        }
      }
    }

    // Verificar que no hay múltiples transiciones (no debería pasar en DFA)
    for (const state of this.states) {
      const symbolCounts = new Map<Symbol, number>();
      
      for (const symbol of this.alphabet) {
        const current = symbolCounts.get(symbol) || 0;
        symbolCounts.set(symbol, current + 1);
        
        if (symbolCounts.get(symbol)! > 1) {
          errors.push(`Estado ${state} tiene múltiples transiciones con '${symbol}'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene estados alcanzables desde el inicial
   */
  getReachableStates(): Set<State> {
    const reachable = new Set<State>();
    const queue: State[] = [this.start];
    reachable.add(this.start);

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const symbol of this.alphabet) {
        const next = this.transition[current]?.[symbol];
        if (next && !reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }

    return reachable;
  }

  /**
   * Clona el DFA
   */
  clone(): DFAClass {
    return new DFAClass({
      states: [...this.states],
      alphabet: [...this.alphabet],
      start: this.start,
      accept: new Set(this.accept),
      transition: JSON.parse(JSON.stringify(this.transition))
    });
  }

  // Getters
  getStates(): State[] { return this.states; }
  getAlphabet(): Symbol[] { return this.alphabet; }
  getStart(): State { return this.start; }
  getAcceptStates(): State[] { return Array.from(this.accept); }
  getTransitions(): Record<string, Record<string, State>> { return this.transition; }
}