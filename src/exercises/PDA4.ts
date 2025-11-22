import { PushdownAutomaton } from '../core/PushdownAutomaton';

export class PDA4 extends PushdownAutomaton {
  constructor() {
    super(2);
    this.setup();
  }

  private setup() {
    this.states = new Set(['q0', 'q1', 'q2', 'qf']);
    this.initialState = 'q0';
    this.initialStackSymbols = ['Z', 'Z'];
    this.stackAlphabet = new Set(['Z', 'X', 'Y']);
    this.inputAlphabet = new Set(['0', '1', '2']);
    this.acceptStates = new Set(['qf']);

    // Pila X: cuenta n (0s)
    // Pila Y: cuenta m+n (1s y después verifica 2s)

    // Leer 0s: push X en pila1, push Y en pila2
    this.addTransition({ from: 'q0', to: 'q0', read: '0', pop: ['Z', 'Z'], push: ['XZ', 'YZ'] });
    this.addTransition({ from: 'q0', to: 'q0', read: '0', pop: ['X', 'Y'], push: ['XX', 'YY'] });

    // Leer 1s: pop X (verifica m=n), push Y en pila2
    this.addTransition({ from: 'q0', to: 'q1', read: '1', pop: ['X', 'Y'], push: ['ε', 'YY'] });
    this.addTransition({ from: 'q1', to: 'q1', read: '1', pop: ['X', 'Y'], push: ['ε', 'YY'] });

    // Leer 2s: pop Y (verifica k=m+n)
    this.addTransition({ from: 'q1', to: 'q2', read: '2', pop: ['Z', 'Y'], push: ['Z', 'ε'] });
    this.addTransition({ from: 'q1', to: 'q2', read: '2', pop: ['X', 'Y'], push: ['X', 'ε'] });
    this.addTransition({ from: 'q2', to: 'q2', read: '2', pop: ['Z', 'Y'], push: ['Z', 'ε'] });
    this.addTransition({ from: 'q2', to: 'q2', read: '2', pop: ['X', 'Y'], push: ['X', 'ε'] });

    // Aceptar cuando ambas pilas están en Z
    this.addTransition({ from: 'q2', to: 'qf', read: 'ε', pop: ['Z', 'Z'], push: ['Z', 'Z'] });
  }
}