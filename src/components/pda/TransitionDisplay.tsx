import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Transition, StepRecord } from '../../types/pda.types';

interface TransitionDisplayProps {
  currentStep: StepRecord;
  previousStep?: StepRecord;
}

const TransitionDisplay: React.FC<TransitionDisplayProps> = ({ currentStep, previousStep }) => {
  if (!currentStep.transition || !previousStep) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700"
      >
        <div className="text-center text-slate-400">
          <p className="text-lg">Estado Inicial</p>
          <p className="text-sm mt-2">No hay transición aplicada</p>
        </div>
      </motion.div>
    );
  }

  const { transition } = currentStep;
  const prevTops = previousStep.stacks.map(s => s.length > 0 ? s[s.length - 1] : 'ε');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 px-6 py-4">
        <h4 className="text-yellow-300 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 flex items-center justify-center bg-yellow-500/30 rounded-lg">
            δ
          </span>
          Transición Aplicada
        </h4>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* States Transition */}
        <div className="flex items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg"
          >
            {previousStep.state}
          </motion.div>
          <ArrowRight className="text-slate-400" size={32} />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg"
          >
            {currentStep.state}
          </motion.div>
        </div>

        {/* Formal Notation */}
        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-300 font-mono text-sm text-center">
            δ(<span className="text-blue-400">{previousStep.state}</span>, 
            <span className="text-purple-400"> {transition.read}</span>, 
            <span className="text-yellow-400"> [{prevTops.join(', ')}]</span>) → 
            (<span className="text-emerald-400">{currentStep.state}</span>, 
            <span className="text-orange-400"> [{transition.push.join(', ')}]</span>)
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
            <p className="text-purple-300 text-xs font-semibold mb-1">LEER</p>
            <p className="text-white text-xl font-bold font-mono">{transition.read}</p>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
            <p className="text-yellow-300 text-xs font-semibold mb-1">POP</p>
            <p className="text-white text-lg font-bold font-mono">
              [{transition.pop.join(', ')}]
            </p>
          </div>

          <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-300 text-xs font-semibold mb-1">PUSH</p>
            <p className="text-white text-lg font-bold font-mono">
              [{transition.push.join(', ')}]
            </p>
          </div>
        </div>

        {/* Stack Operations */}
        <div>
          <h5 className="text-slate-300 font-semibold mb-3">Operaciones en Pilas:</h5>
          <div className="space-y-2">
            {transition.pop.map((popSym, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-950/50 rounded-lg p-3 border border-slate-700"
              >
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded font-mono text-sm font-semibold">
                  Pila {String.fromCharCode(88 + idx)}
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-yellow-300 font-mono">Pop: {popSym}</span>
                <span className="text-slate-400">→</span>
                <span className="text-orange-300 font-mono">Push: {transition.push[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransitionDisplay;