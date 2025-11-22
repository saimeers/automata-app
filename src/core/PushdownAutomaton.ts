import type { Transition, StepRecord, ValidateResult } from '../types/pda.types';

export abstract class PushdownAutomaton {
  protected states: Set<string> = new Set();
  protected inputAlphabet: Set<string> = new Set();
  protected stackAlphabet: Set<string> = new Set();
  protected transitions: Transition[] = [];
  protected initialState: string = 'q0';
  protected initialStackSymbols: string[] = ['Z'];
  protected acceptStates: Set<string> = new Set();
  protected numStacks: number = 1;

  constructor(numStacks = 1) {
    this.numStacks = Math.max(1, numStacks);
    this.initialStackSymbols = [];
    for (let i = 0; i < this.numStacks; i++) {
      this.initialStackSymbols.push('Z');
    }
  }

  protected addTransition(t: Transition) {
    t.id = t.id || `${t.from}_${t.read}_${t.pop.join('.')}_${t.push.join('.')}_${this.transitions.length}`;

    if (t.pop.length !== this.numStacks) {
      throw new Error('Transition.pop length !== numStacks');
    }
    if (t.push.length !== this.numStacks) {
      throw new Error('Transition.push length !== numStacks');
    }

    this.transitions.push(t);
  }

  protected matchesPops(needed: string[], tops: string[]): boolean {
    for (let i = 0; i < needed.length; i++) {
      if (needed[i] !== 'ε' && needed[i] !== tops[i]) {
        return false;
      }
    }
    return true;
  }

  simulateWithSteps(input: string): ValidateResult {
    const tokens = input.split(',').map(s => s.trim()).filter(Boolean);
    const trace: StepRecord[] = [];

    const stacks: string[][] = [];
    for (let i = 0; i < this.numStacks; i++) {
      stacks.push([this.initialStackSymbols[i]]);
    }

    let state = this.initialState;
    let idx = 0;

    const snapshot = (readSymbol: string | null, transition?: Transition): StepRecord => ({
      state,
      readSymbol,
      transition,
      stacks: stacks.map(s => [...s]),
      idx
    });

    trace.push(snapshot(null));

    while (idx <= tokens.length) {
      const currentToken = idx < tokens.length ? tokens[idx] : null;
      const topSymbols = stacks.map(s => (s.length ? s[s.length - 1] : 'ε'));

      let chosen = this.transitions.find(
        t =>
          t.from === state &&
          t.read !== 'ε' &&
          currentToken !== null &&
          t.read === currentToken &&
          this.matchesPops(t.pop, topSymbols)
      );

      if (!chosen) {
        chosen = this.transitions.find(
          t =>
            t.from === state &&
            t.read === 'ε' &&
            this.matchesPops(t.pop, topSymbols)
        );
      }

      if (!chosen) break;

      if (chosen.read !== 'ε') {
        idx++;
      }

      for (let si = 0; si < this.numStacks; si++) {
        const needed = chosen.pop[si];
        if (needed !== 'ε') {
          const top = stacks[si].pop();
          if (top !== needed) {
            trace.push(snapshot(chosen.read, chosen));
            return {
              accepted: false,
              trace,
              error: `Pop mismatch on stack ${si}: expected ${needed}, found ${top}`
            };
          }
        }
      }

      for (let si = 0; si < this.numStacks; si++) {
        const toPush = chosen.push[si];
        if (toPush !== 'ε') {
          const chars = toPush.split('');
          for (let i = chars.length - 1; i >= 0; i--) {
            stacks[si].push(chars[i]);
          }
        }
      }

      state = chosen.to;
      trace.push(snapshot(chosen.read, chosen));
    }

    return { accepted: this.acceptStates.has(state) && idx === tokens.length, trace };
  }

  getStates() { return Array.from(this.states); }
  getInitialState() { return this.initialState; }
  getAcceptStates() { return Array.from(this.acceptStates); }
  getStackAlphabet() { return Array.from(this.stackAlphabet); }
  getInputAlphabet() { return Array.from(this.inputAlphabet); }
  getTransitions() { return this.transitions; }
  getInitialStackSymbols() { return this.initialStackSymbols; }
  getNumStacks() { return this.numStacks; }
}