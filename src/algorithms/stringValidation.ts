import { AutomatonModel } from '@/models/AutomatonModel';
import type { ValidationStep, ValidationResult } from '../types/automaton';

export class StringValidator {
  private automaton: AutomatonModel;

  constructor(automaton: AutomatonModel) {
    this.automaton = automaton;
  }

  validate(input: string): ValidationResult {
    const steps: ValidationStep[] = [];
    const initialState = this.automaton.getInitialState();

    if (!initialState) {
      return {
        accepted: false,
        steps: [],
        finalState: ''
      };
    }

    let currentState = initialState.id;
    const symbols = input.split('');

    // Procesar cada símbolo
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const transition = this.automaton.getTransition(currentState, symbol);

      if (!transition) {
        // No hay transición válida - rechazar
        steps.push({
          currentState,
          symbol,
          nextState: 'ERROR',
          remainingInput: symbols.slice(i).join(''),
          stepNumber: i + 1
        });

        return {
          accepted: false,
          steps,
          finalState: 'ERROR'
        };
      }

      // Transición válida
      steps.push({
        currentState,
        symbol,
        nextState: transition.to,
        remainingInput: symbols.slice(i + 1).join(''),
        stepNumber: i + 1
      });

      currentState = transition.to;
    }

    // Verificar si terminamos en un estado final
    const accepted = this.automaton.isFinalState(currentState);

    return {
      accepted,
      steps,
      finalState: currentState
    };
  }

  validateStepByStep(input: string, stepIndex: number): ValidationStep | null {
    const result = this.validate(input);
    return result.steps[stepIndex] || null;
  }
}