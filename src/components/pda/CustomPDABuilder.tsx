import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import type { Transition, CustomPDAConfig } from '../../types/pda.types';

interface CustomPDABuilderProps {
  onPDACreated: (config: CustomPDAConfig) => void;
}

const CustomPDABuilder: React.FC<CustomPDABuilderProps> = ({ onPDACreated }) => {
  const [numStacks, setNumStacks] = useState(1);
  const [states, setStates] = useState(['q0', 'qf']);
  const [initialState, setInitialState] = useState('q0');
  const [acceptStates, setAcceptStates] = useState(['qf']);
  const [inputAlphabet, setInputAlphabet] = useState(['0', '1']);
  const [stackAlphabet, setStackAlphabet] = useState(['Z', 'X', 'Y']);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  
  // New transition form
  const [newTransition, setNewTransition] = useState({
    from: 'q0',
    to: 'q0',
    read: '',
    pop: ['Z'],
    push: ['Z']
  });

  const stackNames = ['X', 'Y', 'B', 'C', 'P', 'R'];
  const availableStackNames = stackNames.slice(0, numStacks);

  const validateConfig = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (states.length === 0) errors.push('Debe haber al menos un estado');
    if (!states.includes(initialState)) errors.push('El estado inicial debe estar en la lista de estados');
    if (acceptStates.length === 0) errors.push('Debe haber al menos un estado de aceptación');
    if (acceptStates.some(s => !states.includes(s))) errors.push('Los estados de aceptación deben estar en la lista de estados');
    if (inputAlphabet.length === 0) errors.push('El alfabeto de entrada no puede estar vacío');
    if (stackAlphabet.length === 0) errors.push('El alfabeto de pila no puede estar vacío');
    if (!stackAlphabet.includes('Z')) errors.push('El alfabeto de pila debe incluir Z (símbolo inicial)');
    if (transitions.length === 0) errors.push('Debe haber al menos una transición');
    
    // Validate transitions
    transitions.forEach((t, i) => {
      if (!states.includes(t.from)) errors.push(`Transición ${i + 1}: Estado origen "${t.from}" no válido`);
      if (!states.includes(t.to)) errors.push(`Transición ${i + 1}: Estado destino "${t.to}" no válido`);
      if (t.read !== 'ε' && !inputAlphabet.includes(t.read)) {
        errors.push(`Transición ${i + 1}: Símbolo "${t.read}" no está en el alfabeto de entrada`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  };

  const handleAddTransition = () => {
    if (newTransition.read === '') {
      toast.error('El símbolo de lectura no puede estar vacío (usa ε para epsilon)');
      return;
    }

    // Validar que los símbolos estén en el alfabeto
    if (newTransition.read !== 'ε' && !inputAlphabet.includes(newTransition.read)) {
      toast.error(`El símbolo "${newTransition.read}" no está en el alfabeto de entrada`);
      return;
    }

    for (let i = 0; i < newTransition.pop.length; i++) {
      if (newTransition.pop[i] !== 'ε' && !stackAlphabet.includes(newTransition.pop[i])) {
        toast.error(`Pop "${newTransition.pop[i]}" no está en el alfabeto de pila`);
        return;
      }
    }

    for (let i = 0; i < newTransition.push.length; i++) {
      const pushSymbols = newTransition.push[i].split('');
      for (const sym of pushSymbols) {
        if (sym !== 'ε' && !stackAlphabet.includes(sym)) {
          toast.error(`Push "${sym}" no está en el alfabeto de pila`);
          return;
        }
      }
    }
    
    const transition: Transition = {
      ...newTransition,
      pop: [...newTransition.pop],
      push: [...newTransition.push]
    };
    
    setTransitions([...transitions, transition]);
    toast.success('Transición agregada exitosamente');
    
    // Reset form
    setNewTransition({
      from: states[0],
      to: states[0],
      read: inputAlphabet[0] || '',
      pop: Array(numStacks).fill('Z'),
      push: Array(numStacks).fill('Z')
    });
  };

  const handleDeleteTransition = (index: number) => {
    setTransitions(transitions.filter((_, i) => i !== index));
    toast.success('Transición eliminada');
  };

  const handleCreate = () => {
    const validation = validateConfig();
    
    if (!validation.valid) {
      validation.errors.forEach(error => {
        toast.error(error, { duration: 5000 });
      });
      return;
    }

    toast.success('¡PDA creado exitosamente! Ahora puedes validar cadenas.');
    onPDACreated({
      states,
      inputAlphabet,
      stackAlphabet,
      numStacks,
      initialState,
      acceptStates,
      transitions
    });
  };

  const handleAddState = () => {
    const newState = `q${states.length}`;
    setStates([...states, newState]);
    toast.success(`Estado ${newState} agregado`);
  };

  const handleDeleteState = (state: string) => {
    if (state === initialState) {
      toast.error('No puedes eliminar el estado inicial');
      return;
    }
    setStates(states.filter(s => s !== state));
    setAcceptStates(acceptStates.filter(s => s !== state));
    setTransitions(transitions.filter(t => t.from !== state && t.to !== state));
    toast.success(`Estado ${state} eliminado`);
  };

  const handleStacksChange = (n: number) => {
    setNumStacks(n);
    setNewTransition({
      ...newTransition,
      pop: Array(n).fill('Z'),
      push: Array(n).fill('Z')
    });
  };

  const addToAlphabet = async (type: 'input' | 'stack') => {
    const { value: symbol } = await Swal.fire({
      title: type === 'input' ? 'Agregar Símbolo al Alfabeto de Entrada' : 'Agregar Símbolo al Alfabeto de Pila',
      input: 'text',
      inputLabel: 'Ingresa un símbolo (un solo carácter)',
      inputPlaceholder: 'Ej: a, 0, #',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: type === 'input' ? '#9333ea' : '#10b981',
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
        if (value === ' ') {
          return 'No se permiten espacios';
        }
        if (type === 'input' && inputAlphabet.includes(value)) {
          return `El símbolo "${value}" ya existe en el alfabeto de entrada`;
        }
        if (type === 'stack' && stackAlphabet.includes(value)) {
          return `El símbolo "${value}" ya existe en el alfabeto de pila`;
        }
        return null;
      }
    });

    if (symbol) {
      if (type === 'input') {
        setInputAlphabet([...inputAlphabet, symbol]);
        toast.success(`Símbolo "${symbol}" agregado al alfabeto de entrada`);
      } else {
        setStackAlphabet([...stackAlphabet, symbol]);
        toast.success(`Símbolo "${symbol}" agregado al alfabeto de pila`);
      }
    }
  };

  const removeFromAlphabet = (type: 'input' | 'stack', symbol: string) => {
    if (type === 'stack' && symbol === 'Z') {
      toast.error('No puedes eliminar el símbolo inicial Z');
      return;
    }

    if (type === 'input') {
      setInputAlphabet(inputAlphabet.filter(s => s !== symbol));
      toast.success(`Símbolo "${symbol}" eliminado`);
    } else {
      setStackAlphabet(stackAlphabet.filter(s => s !== symbol));
      toast.success(`Símbolo "${symbol}" eliminado`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Number of Stacks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Número de Pilas</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => handleStacksChange(n)}
              className={`p-3 rounded-lg font-bold transition-all ${
                numStacks === n
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-slate-400 text-sm mt-3">
          Pilas disponibles: <span className="text-blue-400 font-mono">{availableStackNames.join(', ')}</span>
        </p>
      </motion.div>

      {/* States */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
              {state !== initialState && (
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

      {/* Initial State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Estado Inicial (q₀)</label>
        <select
          value={initialState}
          onChange={e => setInitialState(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </motion.div>

      {/* Accept States */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Estados de Aceptación (F)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {states.map(state => (
            <label key={state} className="flex items-center gap-2 text-white bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition-all">
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

      {/* Input Alphabet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Alfabeto de Entrada (Σ)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {inputAlphabet.map(symbol => (
            <div
              key={symbol}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg"
            >
              <span className="text-purple-300 font-mono font-bold">{symbol}</span>
              <button
                onClick={() => removeFromAlphabet('input', symbol)}
                className="text-purple-400 hover:text-purple-300"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => addToAlphabet('input')}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        <p className="text-slate-400 text-xs">Incluye ε automáticamente para transiciones épsilon</p>
      </motion.div>

      {/* Stack Alphabet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <label className="block text-white font-semibold mb-3">Alfabeto de Pila (Γ)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {stackAlphabet.map(symbol => (
            <div
              key={symbol}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                symbol === 'Z'
                  ? 'bg-blue-600/20 border border-blue-500/50'
                  : 'bg-emerald-600/20 border border-emerald-500/50'
              }`}
            >
              <span className={`font-mono font-bold ${
                symbol === 'Z' ? 'text-blue-300' : 'text-emerald-300'
              }`}>
                {symbol}
              </span>
              {symbol !== 'Z' && (
                <button
                  onClick={() => removeFromAlphabet('stack', symbol)}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addToAlphabet('stack')}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        <p className="text-slate-400 text-xs">Z es el símbolo inicial obligatorio. Incluye ε automáticamente.</p>
      </motion.div>

      {/* Transitions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
      >
        <h3 className="text-white font-semibold mb-4">Transiciones (δ)</h3>
        
        {/* Add Transition Form */}
        <div className="space-y-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Estado Origen</label>
              <select
                value={newTransition.from}
                onChange={e => setNewTransition({...newTransition, from: e.target.value})}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Leer Símbolo</label>
              <select
                value={newTransition.read}
                onChange={e => setNewTransition({...newTransition, read: e.target.value})}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono"
              >
                <option value="">Seleccionar...</option>
                <option value="ε">ε (epsilon)</option>
                {inputAlphabet.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Estado Destino</label>
              <select
                value={newTransition.to}
                onChange={e => setNewTransition({...newTransition, to: e.target.value})}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              >
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className={`grid gap-4 ${numStacks <= 2 ? 'grid-cols-2' : numStacks <= 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {Array(numStacks).fill(0).map((_, i) => (
              <div key={`pop-${i}`}>
                <label className="block text-slate-300 text-sm mb-2">
                  {availableStackNames[i]} - Pop
                </label>
                <select
                  value={newTransition.pop[i]}
                  onChange={e => {
                    const newPop = [...newTransition.pop];
                    newPop[i] = e.target.value;
                    setNewTransition({...newTransition, pop: newPop});
                  }}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
                >
                  <option value="ε">ε</option>
                  {stackAlphabet.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className={`grid gap-4 ${numStacks <= 2 ? 'grid-cols-2' : numStacks <= 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {Array(numStacks).fill(0).map((_, i) => (
              <div key={`push-${i}`}>
                <label className="block text-slate-300 text-sm mb-2">
                  {availableStackNames[i]} - Push
                </label>
                <input
                  type="text"
                  value={newTransition.push[i]}
                  onChange={e => {
                    const newPush = [...newTransition.push];
                    newPush[i] = e.target.value;
                    setNewTransition({...newTransition, push: newPush});
                  }}
                  placeholder="XZ, XX, ε"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Ej: XZ, XX, ε</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTransition}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Plus size={18} />
            Agregar Transición
          </button>
        </div>

        {/* Transitions List */}
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
                  δ(<span className="text-blue-400">{t.from}</span>, <span className="text-purple-400">{t.read}</span>, <span className="text-yellow-400">[{t.pop.join(', ')}]</span>) → 
                  (<span className="text-emerald-400">{t.to}</span>, <span className="text-orange-400">[{t.push.join(', ')}]</span>)
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

      {/* Create Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={handleCreate}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle size={20} />
        Crear PDA y Validar Cadenas
      </motion.button>
    </div>
  );
};

export default CustomPDABuilder;