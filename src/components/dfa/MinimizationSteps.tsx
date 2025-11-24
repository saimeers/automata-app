import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import type { MinimizationStep } from '../../types/dfa.types';

interface MinimizationStepsProps {
  steps: MinimizationStep[];
}

const MinimizationSteps: React.FC<MinimizationStepsProps> = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (steps.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
        <p className="text-slate-400 text-center">No hay pasos de minimización disponibles</p>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Proceso de Minimización</h3>
          <span className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-mono text-sm">
            Paso {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Descripción */}
        <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <p className="text-blue-400 font-semibold mb-1">Paso {step.stepNumber}:</p>
          <p className="text-slate-300">{step.description}</p>
        </div>

        {/* Particiones */}
        <div>
          <h4 className="text-white font-semibold mb-3">Particiones actuales:</h4>
          <div className="space-y-3">
            {step.partitions.map((partition, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${
                  step.changedPartitions?.some(cp => 
                    [...cp].every(s => partition.has(s)) && 
                    [...partition].every(s => cp.has(s))
                  )
                    ? 'bg-yellow-500/10 border-yellow-500/50'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                    π{idx + 1}
                  </span>
                  <span className="text-slate-400 text-sm">
                    ({partition.size} estado{partition.size !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...partition].map(state => (
                    <span
                      key={state}
                      className="px-3 py-1 bg-slate-700 text-white rounded-lg font-mono text-sm"
                    >
                      {state}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Particiones modificadas */}
        {step.changedPartitions && step.changedPartitions.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-300 text-sm font-semibold mb-2">
              ⚠ Particiones refinadas en este paso
            </p>
            <p className="text-slate-300 text-sm">
              Se detectaron diferencias y la partición se dividió en {step.changedPartitions.length} grupos.
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => setCurrentStep(0)}
            disabled={currentStep === 0}
            className="p-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ir al inicio"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Siguiente
            <ChevronRight size={20} />
          </button>

          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            disabled={currentStep === steps.length - 1}
            className="p-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ir al final"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MinimizationSteps;