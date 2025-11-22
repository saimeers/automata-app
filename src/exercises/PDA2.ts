import { PushdownAutomaton } from '../core/PushdownAutomaton';

export class PDA2 extends PushdownAutomaton {
  constructor() {
    super(1);
    this.states = new Set(['q0', 'q1', 'q2', 'qf']);
    this.initialState = 'q0';
    this.inputAlphabet = new Set(['0', '1']);
    this.stackAlphabet = new Set(['Z', 'X']);
    this.acceptStates = new Set(['qf']);
    this.addTransition({ from: 'q0', to: 'q0', read: '0', pop: ['Z'], push: ['XZ'] });
    this.addTransition({ from: 'q0', to: 'q0', read: '0', pop: ['X'], push: ['XX'] });
    this.addTransition({ from: 'q0', to: 'q1', read: '1', pop: ['Z'], push: ['Z'] });
    this.addTransition({ from: 'q0', to: 'q1', read: '1', pop: ['X'], push: ['X'] });
    this.addTransition({ from: 'q1', to: 'q1', read: '1', pop: ['Z'], push: ['Z'] });
    this.addTransition({ from: 'q1', to: 'q1', read: '1', pop: ['X'], push: ['X'] });
    this.addTransition({ from: 'q1', to: 'q2', read: '0', pop: ['X'], push: ['ε'] });
    this.addTransition({ from: 'q2', to: 'q2', read: '0', pop: ['X'], push: ['ε'] });
    this.addTransition({ from: 'q2', to: 'qf', read: 'ε', pop: ['Z'], push: ['Z'] });
  }
}