import type { State, Symbol, DFA, DFATransitions } from '../types/dfa.types';

interface NFATransitions {
  [state: string]: {
    [symbol: string]: State | State[]; // Puede ser un estado o múltiples
  };
}

export interface ConversionStep {
  stepNumber: number;
  description: string;
  newState: string;
  stateSet: Set<State>;
  transitions?: Array<{ symbol: Symbol; to: string }>;
}

export class NFAToDFAConverter {
  private nfaStates: State[];
  private alphabet: Symbol[];
  private nfaStart: State;
  private nfaAccept: Set<State>;
  private nfaTransitions: NFATransitions;
  private steps: ConversionStep[] = [];

  constructor(config: {
    states: State[];
    alphabet: Symbol[];
    start: State;
    acceptStates: State[];
    transitions: Array<{ from: State; symbol: Symbol; to: State | State[] }>;
  }) {
    this.nfaStates = config.states;
    this.alphabet = config.alphabet;
    this.nfaStart = config.start;
    this.nfaAccept = new Set(config.acceptStates);
    
    // Convertir transiciones a formato NFA (agrupar múltiples transiciones)
    this.nfaTransitions = {};
    
    // Primero agrupar todas las transiciones por estado-símbolo
    const grouped = new Map<string, State[]>();
    
    for (const t of config.transitions) {
      const key = `${t.from}-${t.symbol}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(t.to);
    }
    
    // Luego construir el objeto de transiciones
    for (const [key, targets] of grouped) {
      const [from, symbol] = key.split('-');
      
      if (!this.nfaTransitions[from]) {
        this.nfaTransitions[from] = {};
      }
      
      // Si hay múltiples destinos, usar array; si solo uno, usar el estado directamente
      this.nfaTransitions[from][symbol] = targets.length > 1 ? targets : targets[0];
    }
  }

  /**
   * Detecta si el autómata es no determinista
   */
  isNonDeterministic(): { isNFA: boolean; reasons: string[] } {
    const reasons: string[] = [];

    for (const state of this.nfaStates) {
      for (const symbol of this.alphabet) {
        const target = this.nfaTransitions[state]?.[symbol];
        
        if (target && Array.isArray(target)) {
          reasons.push(
            `Estado ${state} con símbolo '${symbol}' tiene múltiples transiciones: [${target.join(', ')}]`
          );
        }
      }

      // Verificar transiciones faltantes
      const definedSymbols = Object.keys(this.nfaTransitions[state] || {});
      const missingSymbols = this.alphabet.filter(s => !definedSymbols.includes(s));
      
      if (missingSymbols.length > 0) {
        reasons.push(
          `Estado ${state} no tiene transiciones definidas para: [${missingSymbols.join(', ')}]`
        );
      }
    }

    return {
      isNFA: reasons.length > 0,
      reasons
    };
  }

  /**
   * Convierte NFA a DFA usando construcción de subconjuntos
   */
  convert(): { dfa: DFA; steps: ConversionStep[]; isNFA: boolean } {
    const detection = this.isNonDeterministic();
    
    if (!detection.isNFA) {
      // Ya es un DFA, solo normalizar formato
      return {
        dfa: this.normalizeToDFA(),
        steps: [],
        isNFA: false
      };
    }

    this.steps = [];
    
    // Paso 1: Estado inicial es {q0}
    const startSet = new Set([this.nfaStart]);
    const startName = this.setToStateName(startSet);
    
    this.steps.push({
      stepNumber: 1,
      description: `Estado inicial del DFA: {${this.nfaStart}}`,
      newState: startName,
      stateSet: new Set(startSet)
    });

    // Construcción de subconjuntos
    const dfaStates = new Map<string, Set<State>>();
    const dfaTransitions: DFATransitions = {};
    const pending: Set<State>[] = [startSet];
    const processed = new Set<string>();

    dfaStates.set(startName, startSet);

    let stepNumber = 2;

    while (pending.length > 0) {
      const currentSet = pending.shift()!;
      const currentName = this.setToStateName(currentSet);

      if (processed.has(currentName)) continue;
      processed.add(currentName);

      dfaTransitions[currentName] = {};
      const transitions: Array<{ symbol: Symbol; to: string }> = [];

      for (const symbol of this.alphabet) {
        const targetSet = this.move(currentSet, symbol);
        
        if (targetSet.size > 0) {
          const targetName = this.setToStateName(targetSet);
          dfaTransitions[currentName][symbol] = targetName;
          transitions.push({ symbol, to: targetName });

          if (!dfaStates.has(targetName)) {
            dfaStates.set(targetName, targetSet);
            pending.push(targetSet);
            
            this.steps.push({
              stepNumber: stepNumber++,
              description: `Nuevo estado descubierto: δ({${[...currentSet].join(', ')}}, ${symbol}) = {${[...targetSet].join(', ')}}`,
              newState: targetName,
              stateSet: new Set(targetSet)
            });
          }
        }
        // Si targetSet.size === 0, simplemente no crear la transición
        // El DFA no será completo, pero el minimizador manejará esto
      }

      if (transitions.length > 0) {
        this.steps.push({
          stepNumber: stepNumber++,
          description: `Transiciones desde {${[...currentSet].join(', ')}}`,
          newState: currentName,
          stateSet: new Set(currentSet),
          transitions
        });
      }
    }

    // Determinar estados de aceptación
    const dfaAcceptStates = new Set<State>();
    for (const [stateName, stateSet] of dfaStates) {
      if ([...stateSet].some(s => this.nfaAccept.has(s))) {
        dfaAcceptStates.add(stateName);
      }
    }

    this.steps.push({
      stepNumber: stepNumber,
      description: `DFA construido con ${dfaStates.size} estados. Estados de aceptación: {${[...dfaAcceptStates].join(', ')}}`,
      newState: '',
      stateSet: new Set()
    });

    return {
      dfa: {
        states: Array.from(dfaStates.keys()),
        alphabet: this.alphabet,
        start: startName,
        accept: dfaAcceptStates,
        transition: dfaTransitions
      },
      steps: this.steps,
      isNFA: true
    };
  }

  /**
   * Calcula el conjunto de estados alcanzables con un símbolo
   */
  private move(states: Set<State>, symbol: Symbol): Set<State> {
    const result = new Set<State>();

    for (const state of states) {
      const targets = this.nfaTransitions[state]?.[symbol];
      
      if (targets) {
        if (Array.isArray(targets)) {
          targets.forEach(t => result.add(t));
        } else {
          result.add(targets);
        }
      }
    }

    return result;
  }

  /**
   * Convierte un conjunto de estados a un nombre de estado
   */
  private setToStateName(states: Set<State>): string {
    if (states.size === 0) return '∅';
    return `{${[...states].sort().join(',')}}`;
  }

  /**
   * Normaliza un DFA ya válido al formato correcto
   */
  private normalizeToDFA(): DFA {
    const transitions: DFATransitions = {};

    for (const state of this.nfaStates) {
      transitions[state] = {};
      for (const symbol of this.alphabet) {
        const target = this.nfaTransitions[state]?.[symbol];
        if (target) {
          transitions[state][symbol] = Array.isArray(target) ? target[0] : target;
        }
      }
    }

    return {
      states: this.nfaStates,
      alphabet: this.alphabet,
      start: this.nfaStart,
      accept: this.nfaAccept,
      transition: transitions
    };
  }

  getSteps(): ConversionStep[] {
    return this.steps;
  }
}