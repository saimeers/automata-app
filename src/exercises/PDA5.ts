import { PushdownAutomaton } from '../core/PushdownAutomaton';

export class PDA5 extends PushdownAutomaton {
  constructor() {
    super(2);
    this.setup();
  }

  private setup() {
    this.states = new Set(['q0', 'q1', 'q2', 'qf']);
    this.initialState = 'q0';
    this.initialStackSymbols = ['Z', 'Z', 'Z'];
    this.stackAlphabet = new Set(['Z', 'X', 'Y']);
    this.inputAlphabet = new Set(['a', 'b', 'c']);
    this.acceptStates = new Set(['qf']);

    // Pila Y: cuenta n (a's)
    // Pila X: cuenta m (debe ser 2n) 
    // Pila Y: cuenta k (debe ser n+m = 3n)

    // Leer a's: push Y, push XX (para m=2n), push YYY (para k=3n: n+2n)
    this.addTransition({ from: 'q0', to: 'q0', read: 'a', pop: ['Z', 'Z'], push: ['XXZ', 'YYYZ'] });
    this.addTransition({ from: 'q0', to: 'q0', read: 'a', pop: ['X', 'Y'], push: ['XXX', 'YYYY'] });

    // Transición a leer b's: pop X
    this.addTransition({ from: 'q0', to: 'q1', read: 'b', pop: ['X', 'Y'], push: ['ε', 'Y'] });

    // Leer más b's: pop X (verifica m=2n)
    this.addTransition({ from: 'q1', to: 'q1', read: 'b', pop: ['X', 'Y'], push: ['ε', 'Y'] });

    // Cuando X se agota (pila X = Z), transición a leer c's
    this.addTransition({ from: 'q1', to: 'q2', read: 'c', pop: ['Z', 'Y'], push: ['Z', 'ε'] });

    // Leer c's: pop Y (verifica k=3n)
    this.addTransition({ from: 'q2', to: 'q2', read: 'c', pop: ['Z', 'Y'], push: ['Z', 'ε'] });
    this.addTransition({ from: 'q2', to: 'q2', read: 'c', pop: ['Z', 'Y'], push: ['Z', 'ε'] });

    // Aceptar cuando todas las pilas están en Z
    this.addTransition({ from: 'q2', to: 'qf', read: 'ε', pop: ['Z', 'Z'], push: ['Z', 'Z'] });
  }
}