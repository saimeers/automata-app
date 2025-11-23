import type { DFA, MinimizedDFA, State, Symbol, MinimizationStep } from '../types/dfa.types';
import { DFAClass } from './DFA';
import { NFAToDFAConverter, type ConversionStep } from './NFAToDFAConverter';

export interface MinimizationResult {
  minimized: MinimizedDFA;
  steps: MinimizationStep[];
  conversionSteps?: ConversionStep[];
  wasNFA: boolean;
  convertedDFA?: DFA;
}

export class DFAMinimizer {
  private dfa: DFAClass;
  private steps: MinimizationStep[] = [];

  constructor(dfa: DFA) {
    this.dfa = new DFAClass(dfa);
  }

  /**
   * Obtiene los estados desde los cuales se puede llegar a un estado de aceptación
   */
  private getUsefulStates(dfa: DFAClass): Set<State> {
    const useful = new Set<State>();
    
    // Primero, todos los estados de aceptación son útiles
    for (const state of dfa.accept) {
      useful.add(state);
    }
    
    // Iterativamente agregar estados que pueden llegar a estados útiles
    let changed = true;
    while (changed) {
      changed = false;
      
      for (const state of dfa.getStates()) {
        if (!useful.has(state)) {
          // Verificar si este estado puede llegar a un estado útil
          for (const symbol of dfa.getAlphabet()) {
            const target = dfa.transition[state]?.[symbol];
            if (target && useful.has(target)) {
              useful.add(state);
              changed = true;
              break;
            }
          }
        }
      }
    }
    
    return useful;
  }

  /**
   * Completa el DFA agregando un estado trampa si es necesario
   */
  private completeDFA(): DFA {
    const deadStateName = '∅';
    const needsDeadState = this.dfa.getStates().some(state => {
      return this.dfa.getAlphabet().some(symbol => {
        return !this.dfa.transition[state]?.[symbol];
      });
    });

    if (!needsDeadState) {
      // El DFA ya está completo
      return {
        states: this.dfa.getStates(),
        alphabet: this.dfa.getAlphabet(),
        start: this.dfa.start,
        accept: this.dfa.accept,
        transition: this.dfa.transition
      };
    }

    // Crear DFA completo con estado trampa
    const newStates = [...this.dfa.getStates(), deadStateName];
    const newTransitions = { ...this.dfa.transition };

    // Completar transiciones faltantes
    for (const state of this.dfa.getStates()) {
      if (!newTransitions[state]) {
        newTransitions[state] = {};
      }
      for (const symbol of this.dfa.getAlphabet()) {
        if (!newTransitions[state][symbol]) {
          newTransitions[state][symbol] = deadStateName;
        }
      }
    }

    // Agregar transiciones del estado trampa a sí mismo
    newTransitions[deadStateName] = {};
    for (const symbol of this.dfa.getAlphabet()) {
      newTransitions[deadStateName][symbol] = deadStateName;
    }

    this.steps.push({
      stepNumber: 0,
      description: `Estado trampa "${deadStateName}" agregado para completar el DFA`,
      partitions: [new Set(newStates)]
    });

    return {
      states: newStates,
      alphabet: this.dfa.getAlphabet(),
      start: this.dfa.start,
      accept: this.dfa.accept,
      transition: newTransitions
    };
  }

  /**
   * Minimiza el DFA (o convierte NFA → DFA → minimizar)
   */
  minimize(config?: {
    states: State[];
    alphabet: Symbol[];
    start: State;
    acceptStates: State[];
    transitions: Array<{ from: State; symbol: Symbol; to: State | State[] }>;
  }): MinimizationResult {
    this.steps = [];
    
    let convertedDFA: DFA | undefined;
    let conversionSteps: ConversionStep[] | undefined;
    let wasNFA = false;

    // Si se proporciona config, verificar si es NFA
    if (config) {
      const converter = new NFAToDFAConverter(config);
      const detection = converter.isNonDeterministic();
      
      if (detection.isNFA) {
        wasNFA = true;
        const result = converter.convert();
        convertedDFA = result.dfa;
        conversionSteps = result.steps;
        
        // Actualizar el DFA a minimizar
        this.dfa = new DFAClass(convertedDFA);
      }
    }

    // Completar el DFA antes de minimizar
    const completedDFA = this.completeDFA();
    this.dfa = new DFAClass(completedDFA);

    // Paso 1: Eliminar estados inalcanzables
    const reachable = this.dfa.getReachableStates();
    const unreachableStates = this.dfa.getStates().filter(s => !reachable.has(s));
    
    if (unreachableStates.length > 0) {
      this.steps.push({
        stepNumber: this.steps.length + 1,
        description: `Eliminar estados inalcanzables: ${unreachableStates.join(', ')}`,
        partitions: [reachable]
      });
      
      // Reconstruir DFA sin estados inalcanzables
      const reachableTransitions: Record<string, Record<string, State>> = {};
      for (const state of reachable) {
        reachableTransitions[state] = {};
        for (const symbol of this.dfa.getAlphabet()) {
          const target = this.dfa.transition[state]?.[symbol];
          if (target && reachable.has(target)) {
            reachableTransitions[state][symbol] = target;
          }
        }
      }
      
      this.dfa = new DFAClass({
        states: Array.from(reachable),
        alphabet: this.dfa.getAlphabet(),
        start: this.dfa.start,
        accept: new Set([...this.dfa.accept].filter(s => reachable.has(s))),
        transition: reachableTransitions
      });
    }

    // Paso 2: Eliminar estados muertos (no llevan a aceptación)
    const useful = this.getUsefulStates(this.dfa);
    const deadStates = this.dfa.getStates().filter(s => !useful.has(s));
    
    // IMPORTANTE: No eliminar estados muertos si eso incluiría el estado inicial
    // o todos los estados de aceptación
    const canRemoveDeadStates = useful.has(this.dfa.start) && useful.size > 0;
    
    if (deadStates.length > 0 && canRemoveDeadStates) {
      this.steps.push({
        stepNumber: this.steps.length + 1,
        description: `Eliminar estados muertos (no llevan a aceptación): ${deadStates.join(', ')}`,
        partitions: [useful]
      });
      
      // Reconstruir DFA sin estados muertos
      const usefulTransitions: Record<string, Record<string, State>> = {};
      for (const state of useful) {
        usefulTransitions[state] = {};
        for (const symbol of this.dfa.getAlphabet()) {
          const target = this.dfa.transition[state]?.[symbol];
          if (target && useful.has(target)) {
            usefulTransitions[state][symbol] = target;
          }
        }
      }
      
      this.dfa = new DFAClass({
        states: Array.from(useful),
        alphabet: this.dfa.getAlphabet(),
        start: this.dfa.start,
        accept: new Set([...this.dfa.accept].filter(s => useful.has(s))),
        transition: usefulTransitions
      });
    } else if (deadStates.length > 0 && !canRemoveDeadStates) {
      this.steps.push({
        stepNumber: this.steps.length + 1,
        description: `⚠️ Advertencia: El autómata no acepta ninguna cadena (todos los estados son muertos o el inicial no lleva a aceptación)`,
        partitions: [new Set(this.dfa.getStates())]
      });
    }

    // Paso 3: Partición inicial (aceptación vs rechazo)
    const accept = new Set<State>();
    const reject = new Set<State>();

    this.dfa.getStates().forEach(s => {
      if (this.dfa.accept.has(s)) {
        accept.add(s);
      } else {
        reject.add(s);
      }
    });

    let partitions: Set<State>[] = [accept, reject].filter(p => p.size > 0);

    this.steps.push({
      stepNumber: this.steps.length + 1,
      description: 'Partición inicial: Estados de aceptación vs estados de rechazo',
      partitions: partitions.map(p => new Set(p))
    });

    // Paso 4+: Refinamiento iterativo
    let changed = true;

    while (changed) {
      changed = false;
      const newPartitions: Set<State>[] = [];

      for (const group of partitions) {
        const buckets = this.splitPartition(group, partitions);

        if (buckets.size > 1) {
          changed = true;
          this.steps.push({
            stepNumber: this.steps.length + 1,
            description: `Refinando partición {${[...group].join(', ')}}`,
            partitions: partitions.map(p => new Set(p)),
            changedPartitions: Array.from(buckets.values())
          });
        }

        newPartitions.push(...buckets.values());
      }

      partitions = newPartitions;
    }

    // Paso final: Construir DFA minimizado
    const minimizedDFA = this.buildMinimizedDFA(partitions);

    this.steps.push({
      stepNumber: this.steps.length + 1,
      description: 'DFA minimizado construido',
      partitions: partitions.map(p => new Set(p))
    });

    return { 
      minimized: minimizedDFA, 
      steps: this.steps,
      conversionSteps,
      wasNFA,
      convertedDFA
    };
  }

  /**
   * Divide una partición basándose en las transiciones
   */
  private splitPartition(
    group: Set<State>,
    partitions: Set<State>[]
  ): Map<string, Set<State>> {
    const buckets = new Map<string, Set<State>>();

    for (const state of group) {
      const signature = this.getStateSignature(state, partitions);

      if (!buckets.has(signature)) {
        buckets.set(signature, new Set());
      }
      buckets.get(signature)!.add(state);
    }

    return buckets;
  }

  /**
   * Obtiene la firma de un estado (a qué partición va con cada símbolo)
   */
  private getStateSignature(state: State, partitions: Set<State>[]): string {
    return this.dfa.getAlphabet().map(symbol => {
      const target = this.dfa.transition[state]?.[symbol];
      if (!target) return '-1';
      
      const partIndex = partitions.findIndex(p => p.has(target));
      return partIndex.toString();
    }).join(',');
  }

  /**
   * Construye el DFA minimizado a partir de las particiones finales
   */
  private buildMinimizedDFA(partitions: Set<State>[]): MinimizedDFA {
    const representative = new Map<State, State>();
    
    partitions.forEach(group => {
      const rep = [...group][0]; // Primer estado como representante
      group.forEach(state => representative.set(state, rep));
    });

    const newStates = [...new Set([...representative.values()])];
    const newStart = representative.get(this.dfa.start);
    
    // Verificar que el estado inicial existe
    if (!newStart) {
      throw new Error('El estado inicial fue eliminado durante la minimización');
    }
    
    const newAccept = new Set(
      newStates.filter(s => this.dfa.accept.has(s))
    );

    const newTransition: Record<string, Record<string, State>> = {};

    for (const rep of newStates) {
      newTransition[rep] = {};
      
      for (const symbol of this.dfa.getAlphabet()) {
        const originalTarget = this.dfa.transition[rep]?.[symbol];
        if (originalTarget) {
          const newTarget = representative.get(originalTarget);
          // Solo agregar la transición si el destino todavía existe
          if (newTarget && newStates.includes(newTarget)) {
            newTransition[rep][symbol] = newTarget;
          }
        }
      }
    }

    return {
      states: newStates,
      alphabet: this.dfa.getAlphabet(),
      start: newStart,
      accept: newAccept,
      transition: newTransition,
      stateMapping: representative
    };
  }

  /**
   * Obtiene los pasos de minimización
   */
  getSteps(): MinimizationStep[] {
    return this.steps;
  }
}