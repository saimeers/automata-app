import { DFAClass } from '../core/DFA';
import { DFAMinimizer } from '../core/DFAMinimizer';
import type { DFA, MinimizedDFA, MinimizationStep } from '../types/dfa.types';

export function minimizeDFA(dfa: DFA): {
  minimized: MinimizedDFA;
  steps: MinimizationStep[];
} {
  const minimizer = new DFAMinimizer(dfa);
  return minimizer.minimize();
}

export { DFAClass, DFAMinimizer };
export * from '../types/dfa.types';