type State = string;
type Symbol = string;

interface DFA {
  states: State[];
  alphabet: Symbol[];
  start: State;
  accept: Set<State>;
  transition: Record<State, Record<Symbol, State>>;
}

interface MinimizedDFA extends DFA {}

export function minimizeDFA(dfa: DFA): MinimizedDFA {
  let partitions: Set<State>[] = [];

  // 1. Partición inicial
  const accept = new Set<State>();
  const reject = new Set<State>();

  dfa.states.forEach(s => {
    if (dfa.accept.has(s)) accept.add(s);
    else reject.add(s);
  });

  partitions = [accept, reject].filter(p => p.size > 0);

  let changed = true;

  while (changed) {
    changed = false;
    const newPartitions: Set<State>[] = [];

    for (const group of partitions) {
      const buckets = new Map<string, Set<State>>();

      for (const state of group) {
        // Firma basada en a qué partición va cada símbolo
        const signature = dfa.alphabet.map(symbol => {
          const target = dfa.transition[state][symbol];
          const partIndex = partitions.findIndex(p => p.has(target));
          return partIndex;
        }).join(",");

        if (!buckets.has(signature)) buckets.set(signature, new Set());
        buckets.get(signature)!.add(state);
      }

      // Si el grupo se dividió → hubo cambio
      if (buckets.size > 1) changed = true;

      newPartitions.push(...buckets.values());
    }

    partitions = newPartitions;
  }

  // Construir DFA minimizado
  const representative = new Map<State, State>();

  partitions.forEach(group => {
    const rep = [...group][0];
    group.forEach(state => representative.set(state, rep));
  });

  const newStates = [...new Set([...representative.values()])];
  const newStart = representative.get(dfa.start)!;
  const newAccept = new Set(newStates.filter(s => dfa.accept.has(s)));

  const newTransition: Record<State, Record<Symbol, State>> = {};

  for (const rep of newStates) {
    newTransition[rep] = {};
    for (const sym of dfa.alphabet) {
      const originalTarget = dfa.transition[rep][sym];
      newTransition[rep][sym] = representative.get(originalTarget)!;
    }
  }

  return {
    states: newStates,
    alphabet: dfa.alphabet,
    start: newStart,
    accept: newAccept,
    transition: newTransition
  };
}

const dfa: DFA = {
  states: ["q0", "q1", "q2", "q3", "q4", "q5", "q6"],
  alphabet: ["a", "b"],
  start: "q0",
  accept: new Set(["q2", "q4", "q6"]),
  transition: {
    q0: { a: "q1", b: "q5" },
    q1: { a: "q2", b: "q3" },
    q2: { a: "q2", b: "q3" },
    q3: { a: "q4", b: "q3" },
    q4: { a: "q4", b: "q3" },
    q5: { a: "q5", b: "q6" },
    q6: { a: "q5", b: "q6" },
  }
};

const minimized = minimizeDFA(dfa);
console.log(minimized);

export {};