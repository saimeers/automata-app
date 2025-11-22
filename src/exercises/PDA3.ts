import { PushdownAutomaton } from '../core/PushdownAutomaton';

export class PDA3 extends PushdownAutomaton {
  constructor() {
    super(4);
    this.setup();
  }

  private setup() {
    this.states = new Set(['q0', 'q1', 'q2', 'q3', 'q4', 'qf']);
    this.initialState = 'q0';
    this.initialStackSymbols = ['Z', 'Z', 'Z', 'Z'];
    this.stackAlphabet = new Set(['Z', 'X', 'Y', 'B', 'C']);
    this.inputAlphabet = new Set(['1', '2']);
    this.acceptStates = new Set(['qf']);

    // ===== PRIMER GRUPO =====
    // Primer 1: push B
    this.addTransition({ from: 'q0', to: 'q1', read: '1', pop: ['Z', 'Z', 'Z', 'Z'], push: ['Z', 'Z', 'BZ', 'Z'] });

    // Segundo 1 del par: push 2X, push Y, push B
    this.addTransition({ from: 'q1', to: 'q0', read: '1', pop: ['Z', 'Z', 'B', 'Z'], push: ['XXZ', 'YZ', 'BB', 'Z'] });

    // Más pares: push 2X, push Y, push BB
    this.addTransition({ from: 'q0', to: 'q1', read: '1', pop: ['X', 'Y', 'B', 'Z'], push: ['X', 'Y', 'BB', 'Z'] });
    this.addTransition({ from: 'q1', to: 'q0', read: '1', pop: ['X', 'Y', 'B', 'Z'], push: ['XXX', 'YY', 'BB', 'Z'] });

    // Leer 2s: pop Y
    this.addTransition({ from: 'q0', to: 'q2', read: '2', pop: ['X', 'Y', 'B', 'Z'], push: ['X', 'ε', 'B', 'Z'] });
    this.addTransition({ from: 'q2', to: 'q2', read: '2', pop: ['X', 'Y', 'B', 'Z'], push: ['X', 'ε', 'B', 'Z'] });

    
    // ACEPTAR si X=Z y Y=Z (no quedan grupos ni 2s)
    this.addTransition({ from: 'q2', to: 'qf', read: 'ε', pop: ['X', 'Z', 'Z', 'C'], push: ['X', 'Z', 'Z', 'C'] });

    // ===== SIGUIENTE GRUPO: al leer '1' consumir X, pop B, push C =====
    this.addTransition({ from: 'q2', to: 'q3', read: '1', pop: ['X', 'Z', 'B', 'Z'], push: ['ε', 'Z', 'ε', 'CZ'] });

    // Segundo 1: pop B, push Y, push C
    this.addTransition({ from: 'q3', to: 'q2', read: '1', pop: ['X', 'Z', 'B', 'C'], push: ['X', 'YZ', 'ε', 'CC'] });
    this.addTransition({ from: 'q3', to: 'q2', read: '1', pop: ['Z', 'Z', 'B', 'C'], push: ['Z', 'YZ', 'ε', 'CC'] });

    // Más pares: pop BB, push Y, push CC
    this.addTransition({ from: 'q2', to: 'q3', read: '1', pop: ['X', 'Y', 'B', 'C'], push: ['X', 'Y', 'ε', 'CC'] });
    this.addTransition({ from: 'q3', to: 'q2', read: '1', pop: ['X', 'Y', 'B', 'C'], push: ['X', 'YY', 'ε', 'CC'] });
    this.addTransition({ from: 'q2', to: 'q3', read: '1', pop: ['Z', 'Y', 'B', 'C'], push: ['Z', 'Y', 'ε', 'CC'] });
    this.addTransition({ from: 'q3', to: 'q2', read: '1', pop: ['Z', 'Y', 'B', 'C'], push: ['Z', 'YY', 'ε', 'CC'] });

    // Leer 2s: pop Y
    this.addTransition({ from: 'q2', to: 'q4', read: '2', pop: ['X', 'Y', 'Z', 'C'], push: ['X', 'ε', 'Z', 'C'] });
    this.addTransition({ from: 'q4', to: 'q4', read: '2', pop: ['X', 'Y', 'Z', 'C'], push: ['X', 'ε', 'Z', 'C'] });
    this.addTransition({ from: 'q2', to: 'q4', read: '2', pop: ['Z', 'Y', 'Z', 'C'], push: ['Z', 'ε', 'Z', 'C'] });
    this.addTransition({ from: 'q4', to: 'q4', read: '2', pop: ['Z', 'Y', 'Z', 'C'], push: ['Z', 'ε', 'Z', 'C'] });

    // ACEPTAR si X=Z y Y=Z
    this.addTransition({ from: 'q4', to: 'qf', read: 'ε', pop: ['X', 'Z', 'Z', 'C'], push: ['X', 'Z', 'Z', 'C'] });

    // ===== SIGUIENTE GRUPO: al leer '1' consumir X, pop C, push B =====
    this.addTransition({ from: 'q4', to: 'q1', read: '1', pop: ['X', 'Z', 'Z', 'C'], push: ['ε', 'Z', 'BZ', 'ε'] });

    // Segundo 1: pop C, push Y, push B
    this.addTransition({ from: 'q1', to: 'q4', read: '1', pop: ['X', 'Z', 'B', 'C'], push: ['X', 'YZ', 'BB', 'ε'] });
    this.addTransition({ from: 'q1', to: 'q4', read: '1', pop: ['Z', 'Z', 'B', 'C'], push: ['Z', 'YZ', 'BB', 'ε'] });

    // Más pares: pop CC, push Y, push BB
    this.addTransition({ from: 'q4', to: 'q1', read: '1', pop: ['X', 'Y', 'B', 'C'], push: ['X', 'Y', 'BB', 'ε'] });
    this.addTransition({ from: 'q1', to: 'q4', read: '1', pop: ['X', 'Y', 'B', 'C'], push: ['X', 'YY', 'BB', 'ε'] });
    this.addTransition({ from: 'q4', to: 'q1', read: '1', pop: ['Z', 'Y', 'B', 'C'], push: ['Z', 'Y', 'BB', 'ε'] });
    this.addTransition({ from: 'q1', to: 'q4', read: '1', pop: ['Z', 'Y', 'B', 'C'], push: ['Z', 'YY', 'BB', 'ε'] });

    // Leer 2s: pop Y (vuelve a q2 con B)
    this.addTransition({ from: 'q4', to: 'q2', read: '2', pop: ['X', 'Y', 'B', 'Z'], push: ['X', 'ε', 'B', 'Z'] });
    this.addTransition({ from: 'q4', to: 'q2', read: '2', pop: ['Z', 'Y', 'B', 'Z'], push: ['Z', 'ε', 'B', 'Z'] });
  }
}