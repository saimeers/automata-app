import type { Automaton, State, Transition } from '../types/automaton';

export class AutomatonParser {
  static parseFromRules(
    alphabet: string,
    rules: string,
    initialState: string,
    finalStates: string
  ): Automaton {
    const alphabetArray = alphabet.split(',').map(s => s.trim()).filter(Boolean);
    const rulesArray = rules.split('\n').filter(r => r.trim());
    
    const statesSet = new Set<string>();
    const transitionsList: Transition[] = [];

    // Parsear reglas
    rulesArray.forEach((rule, idx) => {
      const parts = rule.split(',').map(p => p.trim());
      if (parts.length === 3) {
        const [from, symbol, to] = parts;
        statesSet.add(from);
        statesSet.add(to);
        transitionsList.push({
          id: `t${idx}`,
          from,
          to,
          symbol
        });
      }
    });

    // Agregar estado inicial si no existe
    statesSet.add(initialState.trim());

    // Crear estados
    const finalStatesSet = new Set(finalStates.split(',').map(s => s.trim()).filter(Boolean));
    const states: State[] = Array.from(statesSet).map(stateId => ({
      id: stateId,
      label: stateId,
      isInitial: stateId === initialState.trim(),
      isFinal: finalStatesSet.has(stateId)
    }));

    return {
      states,
      transitions: transitionsList,
      alphabet: alphabetArray
    };
  }

  static validateAutomaton(automaton: Automaton): string[] {
    const errors: string[] = [];

    // Verificar que existe al menos un estado inicial
    const initialStates = automaton.states.filter(s => s.isInitial);
    if (initialStates.length === 0) {
      errors.push('Debe existir al menos un estado inicial');
    }
    if (initialStates.length > 1) {
      errors.push('Solo puede existir un estado inicial');
    }

    // Verificar que todos los símbolos en transiciones están en el alfabeto
    const alphabetSet = new Set(automaton.alphabet);
    automaton.transitions.forEach(t => {
      if (!alphabetSet.has(t.symbol)) {
        errors.push(`El símbolo '${t.symbol}' no está en el alfabeto`);
      }
    });

    return errors;
  }
}