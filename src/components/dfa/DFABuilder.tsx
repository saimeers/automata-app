import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { State, Symbol, DFABuilderConfig } from '../../types/dfa.types';

interface DFABuilderProps {
  onDFACreated: (config: DFABuilderConfig) => void;
}

const DFABuilder: React.FC<DFABuilderProps> = ({ onDFACreated }) => {
  const [states, setStates] = useState<State[]>(['q0', 'q1']);
  const [alphabet, setAlphabet] = useState<Symbol[]>(['a', 'b']);
  const [start, setStart] = useState<State>('q0');
  const [acceptStates, setAcceptStates] = useState<State[]>(['q1']);
  const [transitions, setTransitions] = useState<Array<{ from: State; symbol: Symbol; to: State }>>([]);

  const [newTransition, setNewTransition] = useState({
    from: 'q0',
    symbol: 'a',
    to: 'q0'
  });

  // Validar que no exista ya una transición para el mismo estado y símbolo
  const transitionExists = (from: State, symbol: Symbol): boolean => {
    return transitions.some(t => t.from === from && t.symbol === symbol);
  };

  const handleAddTransition = () => {
    if (transitionExists(newTransition.from, newTransition.symbol)) {
      toast.error(
        `Ya existe una transición desde ${newTransition.from} con el símbolo '${newTransition.symbol}'. ` +
        `Esto haría el autómata no determinista.`,
        { duration: 5000 }
      );
      return;
    }

    setTransitions([...transitions, { ...newTransition }]);
    toast.success('Transición agregada');
  };

  const handleDeleteTransition = (index: number) => {
    setTransitions(transitions.filter((_, i) => i !== index));
    toast.success('Transición eliminada');
  };

  const validateDFA = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (states.length === 0) errors.push('Debe haber al menos un estado');
    if (!states.includes(start)) errors.push('El estado inicial no está en la lista de estados');
    if (acceptStates.length === 0) errors.push('Debe haber al menos un estado de aceptación');
    if (acceptStates.some(s => !states.includes(s))) {
      errors.push('Algunos estados de aceptación no están en la lista de estados');
    }
    if (alphabet.length === 0) errors.push('El alfabeto no puede estar vacío');

    // Verificar que todas las transiciones estén definidas (DFA completo)
    for (const state of states) {
      for (const symbol of alphabet) {
        const hasTransition = transitions.some(t => t.from === state && t.symbol === symbol);
        if (!hasTransition) {
          errors.push(`Falta transición: δ(${state}, ${symbol})`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleCreate = () => {
    const validation = validateDFA();

    if (!validation.valid) {
      validation.errors.forEach(error => {
        toast.error(error, { duration: 5000 });
      });
      return;
    }

    onDFACreated({
      states,
      alphabet,
      start,
      acceptStates,
      transitions
    });

    toast.success('¡DFA creado exitosamente!');
  };

  const handleAddState = () => {
    const newState = `q${states.length}`;
    setStates([...states, newState]);
    toast.success(`Estado ${newState} agregado`);
  };

  const handleDeleteState = (state: State) => {
    if (state === start) {
      toast.error('No puedes eliminar el estado inicial');
      return;
    }

    setStates(states.filter(s => s !== state));
    setAcceptStates(acceptStates.filter(s => s !== state));
    setTransitions(transitions.filter(t => t.from !== state && t.to !== state));
    toast.success(`Estado ${state} eliminado`);
  };

  const addSymbol = () => {
    const symbol = prompt('Ingresa un nuevo símbolo (un solo carácter):');
    if (!symbol || symbol.length !== 1) {
      toast.error('El símbolo debe ser un solo carácter');
      return;
    }
    if (alphabet.includes(symbol)) {
      toast.error(`El símbolo '${symbol}' ya existe`);
      return;
    }
    setAlphabet([...alphabet, symbol]);
    toast.success(`Símbolo '${symbol}' agregado`);
  };

  const removeSymbol = (symbol: Symbol) => {
    setAlphabet(alphabet.filter(s => s !== symbol));
    setTransitions(transitions.filter(t => t.symbol !== symbol));
    toast.success(`Símbolo '${symbol}' eliminado`);
  };

  return (
    <div className="space-y-6">
      {/* Estados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-white font-semibold">Estados (Q)</label>
          <button
            onClick={handleAddState}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {states.map(state => (
            <motion.div
              key={state}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700"
            >
              <span className="text-white font-mono">{state}</span>
              {state !== start && (
                <button
                  onClick={() => handleDeleteState(state)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Alfabeto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-white font-semibold">Alfabeto (Σ)</label>
          <button
            onClick={addSymbol}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {alphabet.map(symbol => (
            <div
              key={symbol}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg"
            >
              <span className="text-purple-300 font-mono font-bold">{symbol}</span>
              <button
                onClick={() => removeSymbol(symbol)}
                className="text-purple-400 hover:text-purple-300"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Estado Inicial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Estado Inicial (q₀)</label>
        <select
          value={start}
          onChange={e => setStart(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </motion.div>

      {/* Estados de Aceptación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Estados de Aceptación (F)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {states.map(state => (
            <label
              key={state}
              className="flex items-center gap-2 text-white bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition-all"
            >
              <input
                type="checkbox"
                checked={acceptStates.includes(state)}
                onChange={e => {
                  if (e.target.checked) {
                    setAcceptStates([...acceptStates, state]);
                  } else {
                    setAcceptStates(acceptStates.filter(s => s !== state));
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="font-mono">{state}</span>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Transiciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <h3 className="text-white font-semibold mb-4">Función de Transición (δ)</h3>

        {/* Advertencia de determinismo */}
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
          <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-yellow-200 text-sm">
            Solo se permite <strong>una transición</strong> por estado y símbolo. Múltiples transiciones harían el autómata no determinista.
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Estado Origen</label>
              <select
                value={newTransition.from}
                onChange={e => setNewTransition({ ...newTransition, from: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Símbolo</label>
              <select
                value={newTransition.symbol}
                onChange={e => setNewTransition({ ...newTransition, symbol: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono"
              >
                {alphabet.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Estado Destino</label>
              <select
                value={newTransition.to}
                onChange={e => setNewTransition({ ...newTransition, to: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddTransition}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Plus size={18} />
            Agregar Transición
          </button>
        </div>

        {/* Lista de Transiciones */}
        <div className="space-y-2">
          <AnimatePresence>
            {transitions.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
              >
                <span className="text-slate-300 font-mono text-sm">
                  δ(<span className="text-blue-400">{t.from}</span>, 
                  <span className="text-purple-400"> {t.symbol}</span>) = 
                  <span className="text-emerald-400"> {t.to}</span>
                </span>
                <button
                  onClick={() => handleDeleteTransition(i)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {transitions.length === 0 && (
            <p className="text-slate-400 text-center py-4 text-sm">No hay transiciones agregadas</p>
          )}
        </div>
      </motion.div>

      {/* Botón Crear */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleCreate}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle size={20} />
        Crear DFA y Minimizar
      </motion.button>
    </div>
  );
};

export default DFABuilder;