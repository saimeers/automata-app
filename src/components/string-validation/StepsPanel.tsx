import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight 
} from 'lucide-react';
import type { ValidationResult } from '../../types/automaton';
import { useEffect } from 'react';

interface StepsPanelProps {
  validationResult: ValidationResult;
  currentStep: number;
  isPlaying: boolean;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onPlayPause: () => void;
}

const StepsPanel = ({
  validationResult,
  currentStep,
  isPlaying,
  onStepForward,
  onStepBackward,
  onReset,
  onPlayPause
}: StepsPanelProps) => {
  
  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (currentStep < validationResult.steps.length) {
        onStepForward();
      } else {
        onPlayPause(); // Stop when finished
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, validationResult.steps.length, onStepForward, onPlayPause]);

  const currentStepData = currentStep > 0 ? validationResult.steps[currentStep - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden"
    >
      {/* Controls */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Ejecución Paso a Paso</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="text-slate-300" size={18} />
            </button>
            <button
              onClick={onStepBackward}
              disabled={currentStep === 0}
              className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Paso anterior"
            >
              <ChevronLeft className="text-slate-300" size={18} />
            </button>
            <button
              onClick={onPlayPause}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="text-white" size={18} />
              ) : (
                <Play className="text-white" size={18} />
              )}
            </button>
            <button
              onClick={onStepForward}
              disabled={currentStep >= validationResult.steps.length}
              className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Siguiente paso"
            >
              <ChevronRight className="text-slate-300" size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${(currentStep / validationResult.steps.length) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2 text-center">
          Paso {currentStep} de {validationResult.steps.length}
        </p>
      </div>

      {/* Current Step Display */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentStepData ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">Estado Actual</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {currentStepData.currentState}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">Símbolo Leído</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {currentStepData.symbol}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600">
                  <p className="text-xs text-slate-400 mb-1">Siguiente Estado</p>
                  <p className="text-2xl font-bold text-green-400">
                    {currentStepData.nextState}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600">
                <p className="text-xs text-slate-400 mb-2">Entrada Restante</p>
                <p className="text-lg font-mono text-slate-300">
                  {currentStepData.remainingInput || <span className="text-slate-500 italic">vacío</span>}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <ArrowRight className="text-blue-400" size={20} />
                <p>
                  <span className="text-blue-300 font-semibold">Transición:</span> {' '}
                  δ({currentStepData.currentState}, {currentStepData.symbol}) = {currentStepData.nextState}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-slate-400">
                Presiona Play para iniciar la simulación
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Steps History */}
      <div className="border-t border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Historial de Pasos</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {validationResult.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-3 rounded-lg border text-sm
                ${index + 1 === currentStep
                  ? 'bg-blue-500/20 border-blue-500/50' 
                  : 'bg-slate-900/30 border-slate-700'
                }
              `}
            >
              <span className="text-slate-400">Paso {index + 1}:</span>{' '}
              <span className="text-slate-300 font-mono">
                {step.currentState} → {step.symbol} → {step.nextState}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StepsPanel;