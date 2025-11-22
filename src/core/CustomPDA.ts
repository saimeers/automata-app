import { PushdownAutomaton } from './PushdownAutomaton';
import type { Transition } from '../types/pda.types';

export class CustomPDA extends PushdownAutomaton {
  constructor(config: {
    states: string[];
    inputAlphabet: string[];
    stackAlphabet: string[];
    numStacks: number;
    initialState: string;
    acceptStates: string[];
    transitions: Transition[];
  }) {
    super(config.numStacks);
    
    this.states = new Set(config.states);
    this.inputAlphabet = new Set(config.inputAlphabet);
    this.stackAlphabet = new Set(config.stackAlphabet);
    this.initialState = config.initialState;
    this.acceptStates = new Set(config.acceptStates);
    
    // Initialize stack symbols (all start with Z)
    this.initialStackSymbols = Array(config.numStacks).fill('Z');
    
    // Add all transitions
    config.transitions.forEach(t => {
      this.addTransition(t);
    });
  }
}