import { useState, useCallback } from 'react';
import type { Automaton } from '../types/automaton';
import { AutomatonModel } from '../models/AutomatonModel';
import { StringValidator } from '../algorithms/stringValidation';

export const useAutomaton = (initialAutomaton?: Automaton) => {
  const [automaton, setAutomaton] = useState<Automaton | null>(initialAutomaton || null);
  const [validator, setValidator] = useState<StringValidator | null>(null);

  const loadAutomaton = useCallback((newAutomaton: Automaton) => {
    setAutomaton(newAutomaton);
    const model = new AutomatonModel(newAutomaton);
    setValidator(new StringValidator(model));
  }, []);

  const validateString = useCallback((input: string) => {
    if (!validator) return null;
    return validator.validate(input);
  }, [validator]);

  const getStepByStep = useCallback((input: string, stepIndex: number) => {
    if (!validator) return null;
    return validator.validateStepByStep(input, stepIndex);
  }, [validator]);

  return {
    automaton,
    loadAutomaton,
    validateString,
    getStepByStep
  };
};