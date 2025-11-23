import type { DFA, MinimizedDFA, State, Symbol, MinimizationStep } from '../types/dfa.types';
import { DFAClass } from './DFA';

export class DFAMinimizer {
  private dfa: DFAClass;
  private steps: MinimizationStep[] = [];

  constructor(dfa: DFA) {
    this.dfa = new DFAClass(dfa);
  }

  /**
   * Minimiza el DFA y retorna el resultado con los pasos
   */
  minimize(): { minimized: MinimizedDFA; steps: MinimizationStep[] } {
    this.steps = [];

    // Paso 0: Eliminar estados inalcanzables
    const reachable = this.dfa.getReachableStates();
    const unreachableStates = this.dfa.getStates().filter(s => !reachable.has(s));
    
    if (unreachableStates.length > 0) {
      this.steps.push({
        stepNumber: 0,
        description: `Eliminar estados inalcanzables: ${unreachableStates.join(', ')}`,
        partitions: [reachable]
      });
    }

    // Paso 1: Partición inicial (aceptación vs rechazo)
    const accept = new Set<State>();
    const reject = new Set<State>();

    this.dfa.getStates().forEach(s => {
      if (reachable.has(s)) {
        if (this.dfa.accept.has(s)) {
          accept.add(s);
        } else {
          reject.add(s);
        }
      }
    });

    let partitions: Set<State>[] = [accept, reject].filter(p => p.size > 0);

    this.steps.push({
      stepNumber: 1,
      description: 'Partición inicial: Estados de aceptación vs estados de rechazo',
      partitions: partitions.map(p => new Set(p))
    });

    // Paso 2+: Refinamiento iterativo
    let stepNumber = 2;
    let changed = true;

    while (changed) {
      changed = false;
      const newPartitions: Set<State>[] = [];

      for (const group of partitions) {
        const buckets = this.splitPartition(group, partitions);

        if (buckets.size > 1) {
          changed = true;
          this.steps.push({
            stepNumber: stepNumber++,
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
      stepNumber: stepNumber,
      description: 'DFA minimizado construido',
      partitions: partitions.map(p => new Set(p))
    });

    return { minimized: minimizedDFA, steps: this.steps };
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
    const newStart = representative.get(this.dfa.start)!;
    const newAccept = new Set(
      newStates.filter(s => this.dfa.accept.has(s))
    );

    const newTransition: Record<string, Record<string, State>> = {};

    for (const rep of newStates) {
      newTransition[rep] = {};
      
      for (const symbol of this.dfa.getAlphabet()) {
        const originalTarget = this.dfa.transition[rep]?.[symbol];
        if (originalTarget) {
          newTransition[rep][symbol] = representative.get(originalTarget)!;
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