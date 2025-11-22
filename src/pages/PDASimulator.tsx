import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPDA, EXERCISES } from '../exercises';
import type { ValidateResult } from '../types/pda.types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StackVisualizer from '../components/pda/StackVisualizer';
import StepControls from '../components/pda/StepControls';
import TransitionDisplay from '../components/pda/TransitionDisplay';
import GraphVisualizer from '../components/pda/GraphVisualization';
import CustomPDABuilder from '../components/pda/CustomPDABuilder';
import { CustomPDA } from '../core/CustomPDA';

const PDASimulator: React.FC = () => {
  const [mode, setMode] = useState<'exercises' | 'custom' | 'custom-test'>('exercises');
  const [exercise, setExercise] = useState(2);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidateResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customPDA, setCustomPDA] = useState<CustomPDA | null>(null);

  const stackNames = ['X', 'Y', 'B', 'C', 'P', 'R'];

  useEffect(() => {
    if (isPlaying && result && currentStep < result.trace.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, result]);

  const handleValidate = () => {
    if (!input.trim()) {
      toast.error('Por favor ingresa una cadena de entrada');
      return;
    }

    const pda = mode === 'exercises' || mode === 'custom-test' && !customPDA 
      ? createPDA(exercise) 
      : customPDA;
    
    if (!pda) {
      toast.error('No hay PDA configurado');
      return;
    }
    
    try {
      const res = pda.simulateWithSteps(input);
      setResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
      
      if (res.accepted) {
        toast.success('¡Cadena aceptada!', {
          icon: '✓',
          duration: 3000,
        });
      } else {
        toast.error('Cadena rechazada', {
          icon: '✗',
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('Error al validar la cadena');
      console.error(error);
    }
  };

  const loadExample = () => {
    if (mode === 'exercises') {
      setInput(EXERCISES[exercise as keyof typeof EXERCISES].example);
      setResult(null);
      toast.success('Ejemplo cargado');
    }
  };

  const handlePDACreated = (config: any) => {
    try {
      const pda = new CustomPDA(config);
      setCustomPDA(pda);
      setMode('custom-test');
      setResult(null);
      setInput('');
      toast.success('¡PDA personalizado creado! Ahora puedes validar cadenas.', {
        duration: 5000,
      });
    } catch (error) {
      toast.error('Error al crear el PDA');
      console.error(error);
    }
  };

  const handleBackToBuilder = () => {
    setMode('custom');
    setResult(null);
    setInput('');
    toast('Regresando al constructor', { icon: '🔧' });
  };

  const currentPDA = mode === 'exercises' 
    ? createPDA(exercise) 
    : customPDA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />

      {/* Mode Selector */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('exercises');
                setResult(null);
                setCustomPDA(null);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                mode === 'exercises'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <BookOpen size={18} />
              Ejercicios
            </button>
            <button
              onClick={() => {
                setMode('custom');
                setResult(null);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                mode === 'custom' || mode === 'custom-test'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Plus size={18} />
              Crear PDA Personalizado
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-6">
        {mode === 'exercises' ? (
          <>
            {/* Exercise Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
            >
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Seleccionar Ejercicio
              </label>
              <select
                value={exercise}
                onChange={e => {
                  setExercise(Number(e.target.value));
                  setResult(null);
                  setInput('');
                }}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.entries(EXERCISES).map(([key, ex]) => (
                  <option key={key} value={key}>
                    Ejercicio {key}: {ex.description}
                  </option>
                ))}
              </select>

              <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h3 className="text-blue-400 font-semibold mb-2">Descripción:</h3>
                <p className="text-slate-300 mb-3">
                  {EXERCISES[exercise as keyof typeof EXERCISES].description}
                </p>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">Estrategia:</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {EXERCISES[exercise as keyof typeof EXERCISES].strategy.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cadena de entrada (separada por comas)
                </label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ej: 0,0,1,1,1,0,0"
                  rows={2}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleValidate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Validar
                </button>
                <button
                  onClick={loadExample}
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all"
                >
                  Cargar Ejemplo
                </button>
              </div>
            </motion.div>
          </>
        ) : mode === 'custom' ? (
          <CustomPDABuilder onPDACreated={handlePDACreated} />
        ) : mode === 'custom-test' && customPDA ? (
          <>
            {/* Custom PDA Test Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-emerald-400" />
                  PDA Personalizado Creado
                </h2>
                <button
                  onClick={handleBackToBuilder}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Volver al Constructor
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                  <p className="text-blue-400 text-xs font-semibold mb-1">ESTADOS</p>
                  <p className="text-white font-mono text-sm">{customPDA.getStates().length}</p>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/30">
                  <p className="text-purple-400 text-xs font-semibold mb-1">PILAS</p>
                  <p className="text-white font-mono text-sm">{customPDA.getNumStacks()}</p>
                </div>
                <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">TRANSICIONES</p>
                  <p className="text-white font-mono text-sm">{customPDA.getTransitions().length}</p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30">
                  <p className="text-emerald-400 text-xs font-semibold mb-1">ALFABETO</p>
                  <p className="text-white font-mono text-sm">{customPDA.getInputAlphabet().length} símbolos</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                <h4 className="text-slate-300 font-semibold mb-2">Definición Formal:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                  <div>
                    <span className="text-blue-400">Q:</span>{' '}
                    <span className="text-slate-300">{`{${customPDA.getStates().join(', ')}}`}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Σ:</span>{' '}
                    <span className="text-slate-300">{`{${customPDA.getInputAlphabet().join(', ')}}`}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Γ:</span>{' '}
                    <span className="text-slate-300">{`{${customPDA.getStackAlphabet().join(', ')}}`}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">q₀:</span>{' '}
                    <span className="text-slate-300">{customPDA.getInitialState()}</span>
                  </div>
                  <div>
                    <span className="text-orange-400">F:</span>{' '}
                    <span className="text-slate-300">{`{${customPDA.getAcceptStates().join(', ')}}`}</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Pilas:</span>{' '}
                    <span className="text-slate-300">{customPDA.getNumStacks()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cadena de entrada (separada por comas)
                </label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Ej: ${customPDA.getInputAlphabet().slice(0, 3).join(',')}`}
                  rows={2}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-slate-400 text-xs mt-1">
                  Alfabeto disponible: {customPDA.getInputAlphabet().join(', ')}
                </p>
              </div>

              <button
                onClick={handleValidate}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Validar Cadena
              </button>
            </motion.div>
          </>
        ) : null}

        {/* Results Section */}
        {result && currentPDA && (
          <AnimatePresence>
            {/* Acceptance Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-6 border-2 ${
                result.accepted
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}
            >
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                result.accepted ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {result.accepted ? '✓ CADENA ACEPTADA' : '✗ CADENA RECHAZADA'}
              </h2>
              {result.error && (
                <p className="text-red-300 mt-2">{result.error}</p>
              )}
            </motion.div>

            {/* Step Controls */}
            <StepControls
              currentStep={currentStep}
              totalSteps={result.trace.length}
              isPlaying={isPlaying}
              onPrevious={() => setCurrentStep(Math.max(0, currentStep - 1))}
              onNext={() => setCurrentStep(Math.min(result.trace.length - 1, currentStep + 1))}
              onPlay={() => setIsPlaying(!isPlaying)}
              onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
              onSkipToStart={() => setCurrentStep(0)}
              onSkipToEnd={() => setCurrentStep(result.trace.length - 1)}
            />

            {/* Current State Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-xl border border-indigo-500/30"
              >
                <h4 className="text-indigo-300 font-semibold mb-2">Estado Actual</h4>
                <p className="text-4xl font-bold text-white">
                  {result.trace[currentStep].state}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30"
              >
                <h4 className="text-purple-300 font-semibold mb-2">Símbolo Leído</h4>
                <p className="text-4xl font-bold text-white">
                  {result.trace[currentStep].readSymbol || 'ε'}
                </p>
              </motion.div>
            </div>

            {/* Transition Display */}
            <TransitionDisplay
              currentStep={result.trace[currentStep]}
              previousStep={result.trace[currentStep - 1]}
            />

            {/* Stack Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
            >
              <h3 className="text-xl font-bold text-white mb-4">Estado de las Pilas</h3>
              <StackVisualizer
                stacks={result.trace[currentStep].stacks}
                stackNames={stackNames}
              />
            </motion.div>

            {/* Graph Visualizer */}
            <GraphVisualizer pda={currentPDA} />
          </AnimatePresence>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PDASimulator;