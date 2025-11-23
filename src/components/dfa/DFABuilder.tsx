import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, X, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
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

  // Verificar si es no determinista
  const isNonDeterministic = (): boolean => {
    const transitionMap = new Map<string, number>();
    
    for (const t of transitions) {
      const key = `${t.from}-${t.symbol}`;
      transitionMap.set(key, (transitionMap.get(key) || 0) + 1);
    }
    
    return Array.from(transitionMap.values()).some(count => count > 1);
  };

  // Validar que no exista ya una transición para el mismo estado y símbolo
  const transitionExists = (from: State, symbol: Symbol): boolean => {
    return transitions.some(t => t.from === from && t.symbol === symbol);
  };

  // Obtener transiciones faltantes para un estado
  const getMissingTransitions = (state: State): Symbol[] => {
    const definedSymbols = transitions
      .filter(t => t.from === state)
      .map(t => t.symbol);
    
    return alphabet.filter(symbol => !definedSymbols.includes(symbol));
  };

  // Verificar si el DFA está completo
  const isCompleteDFA = (): boolean => {
    for (const state of states) {
      if (getMissingTransitions(state).length > 0) {
        return false;
      }
    }
    return true;
  };

  // Obtener todas las transiciones faltantes
  const getAllMissingTransitions = (): Array<{ state: State; symbols: Symbol[] }> => {
    return states
      .map(state => ({
        state,
        symbols: getMissingTransitions(state)
      }))
      .filter(item => item.symbols.length > 0);
  };

  const handleAddTransition = () => {
    // Permitir múltiples transiciones (NFA)
    setTransitions([...transitions, { ...newTransition }]);
    
    if (transitionExists(newTransition.from, newTransition.symbol)) {
      toast.success('Transición agregada (autómata no determinista)', {
        icon: '⚠️',
        duration: 4000
      });
    } else {
      toast.success('Transición agregada');
    }
  };

  const handleDeleteTransition = (index: number) => {
    setTransitions(transitions.filter((_, i) => i !== index));
    toast.success('Transición eliminada');
  };

  const validateDFA = (): { valid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (states.length === 0) errors.push('Debe haber al menos un estado');
    if (!states.includes(start)) errors.push('El estado inicial no está en la lista de estados');
    if (acceptStates.length === 0) errors.push('Debe haber al menos un estado de aceptación');
    if (acceptStates.some(s => !states.includes(s))) {
      errors.push('Algunos estados de aceptación no están en la lista de estados');
    }
    if (alphabet.length === 0) errors.push('El alfabeto no puede estar vacío');

    // Verificar si es no determinista
    if (isNonDeterministic()) {
      warnings.push('⚠️ Autómata No Determinista (AFND) detectado. Se convertirá automáticamente a AFD antes de minimizar.');
    }

    // Verificar completitud solo si es determinista
    if (!isNonDeterministic()) {
      const missingTransitions = getAllMissingTransitions();
      if (missingTransitions.length > 0) {
        errors.push('El AFD no está completo. Faltan las siguientes transiciones:');
        missingTransitions.forEach(({ state, symbols }) => {
          errors.push(`  • Estado ${state}: símbolos [${symbols.join(', ')}]`);
        });
      }
    }

    // Verificar estados inalcanzables (advertencia, no error)
    const reachableStates = getReachableStates();
    const unreachableStates = states.filter(s => !reachableStates.has(s));
    if (unreachableStates.length > 0) {
      warnings.push(`Estados inalcanzables (se eliminarán automáticamente): ${unreachableStates.join(', ')}`);
    }

    return { valid: errors.length === 0, errors, warnings };
  };

  // Obtener estados alcanzables desde el inicial
  const getReachableStates = (): Set<State> => {
    const reachable = new Set<State>();
    const queue: State[] = [start];
    reachable.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const symbol of alphabet) {
        const transition = transitions.find(t => t.from === current && t.symbol === symbol);
        if (transition && !reachable.has(transition.to)) {
          reachable.add(transition.to);
          queue.push(transition.to);
        }
      }
    }

    return reachable;
  };

  const handleCreate = async () => {
    const validation = validateDFA();

    if (validation.warnings.length > 0) {
      // Mostrar advertencias
      const warningHtml = validation.warnings.map(w => `<li class="text-left">${w}</li>`).join('');
      
      await Swal.fire({
        icon: 'warning',
        title: 'Advertencias',
        html: `<ul class="text-sm">${warningHtml}</ul>`,
        confirmButtonText: 'Entendido',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    }

    if (!validation.valid) {
      // Mostrar errores con SweetAlert2
      const errorHtml = validation.errors.map(e => `<li class="text-left">${e}</li>`).join('');
      
      await Swal.fire({
        icon: 'error',
        title: 'Errores de Validación',
        html: `<ul class="text-sm text-red-300">${errorHtml}</ul>`,
        confirmButtonText: 'Corregir',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#ef4444'
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

    if (isNonDeterministic()) {
      toast.success('¡AFND creado! Se convertirá a AFD y minimizará automáticamente.', {
        duration: 4000
      });
    } else {
      toast.success('¡AFD creado exitosamente!');
    }
  };

  const handleAddState = async () => {
    const { value: stateName } = await Swal.fire({
      title: 'Agregar Estado',
      input: 'text',
      inputLabel: 'Nombre del estado',
      inputValue: `q${states.length}`,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'El nombre del estado no puede estar vacío';
        }
        if (states.includes(value)) {
          return `El estado "${value}" ya existe`;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'Solo se permiten letras, números y guiones bajos';
        }
        return null;
      }
    });

    if (stateName) {
      setStates([...states, stateName]);
      toast.success(`Estado ${stateName} agregado`);
    }
  };

  const handleDeleteState = async (state: State) => {
    if (state === start) {
      toast.error('No puedes eliminar el estado inicial');
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el estado "${state}" y todas sus transiciones`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      setStates(states.filter(s => s !== state));
      setAcceptStates(acceptStates.filter(s => s !== state));
      setTransitions(transitions.filter(t => t.from !== state && t.to !== state));
      toast.success(`Estado ${state} eliminado`);
    }
  };

  const addSymbol = async () => {
    const { value: symbol } = await Swal.fire({
      title: 'Agregar Símbolo al Alfabeto',
      input: 'text',
      inputLabel: 'Ingresa un símbolo (un solo carácter)',
      inputPlaceholder: 'Ej: a, 0, #',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#64748b',
      inputAttributes: {
        maxlength: '1',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'El símbolo no puede estar vacío';
        }
        if (value.length !== 1) {
          return 'El símbolo debe ser un solo carácter';
        }
        if (alphabet.includes(value)) {
          return `El símbolo "${value}" ya existe en el alfabeto`;
        }
        if (value === ' ') {
          return 'No se permiten espacios';
        }
        return null;
      }
    });

    if (symbol) {
      setAlphabet([...alphabet, symbol]);
      toast.success(`Símbolo "${symbol}" agregado al alfabeto`);
    }
  };

  const removeSymbol = async (symbol: Symbol) => {
    const transitionsWithSymbol = transitions.filter(t => t.symbol === symbol);
    
    if (transitionsWithSymbol.length > 0) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Se eliminará el símbolo "<strong>${symbol}</strong>" y <strong>${transitionsWithSymbol.length}</strong> transición(es) asociada(s)`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        background: '#1e293b',
        color: '#fff'
      });

      if (!result.isConfirmed) return;
    }

    setAlphabet(alphabet.filter(s => s !== symbol));
    setTransitions(transitions.filter(t => t.symbol !== symbol));
    toast.success(`Símbolo "${symbol}" eliminado`);
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
        {alphabet.length === 0 && (
          <p className="text-slate-400 text-sm mt-2 text-center">
            No hay símbolos en el alfabeto. Agrega al menos uno.
          </p>
        )}
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
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
          isNonDeterministic() 
            ? 'bg-orange-500/10 border border-orange-500/30' 
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          {isNonDeterministic() ? (
            <>
              <AlertCircle className="text-orange-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-orange-200 text-sm">
                <p className="font-semibold mb-1">Autómata No Determinista (AFND)</p>
                <p>Se permiten <strong>múltiples transiciones</strong> por estado y símbolo. El sistema convertirá automáticamente a AFD antes de minimizar.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-blue-200 text-sm">
                Autómata Determinista (AFD). Solo se permite <strong>una transición</strong> por estado y símbolo.
              </p>
            </>
          )}
        </div>

        {/* Formulario */}
        {states.length > 0 && alphabet.length > 0 ? (
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
        ) : (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center text-slate-400">
            Agrega estados y símbolos al alfabeto para definir transiciones
          </div>
        )}

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

        {/* Progreso de Transiciones */}
        {states.length > 0 && alphabet.length > 0 && !isNonDeterministic() && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Progreso de Transiciones (AFD)</span>
              <span className="text-slate-400 text-sm font-mono">
                {transitions.length} / {states.length * alphabet.length}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(transitions.length / (states.length * alphabet.length)) * 100}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Botón Crear */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleCreate}
        disabled={states.length === 0 || alphabet.length === 0}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        <CheckCircle size={20} />
        {isNonDeterministic() ? 'Convertir AFND → AFD y Minimizar' : 'Crear AFD y Minimizar'}
      </motion.button>
    </div>
  );
};

export default DFABuilder;