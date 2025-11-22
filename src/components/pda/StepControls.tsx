import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlay: () => void;
  onReset: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
}

const StepControls: React.FC<StepControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onPlay,
  onReset,
  onSkipToStart,
  onSkipToEnd
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Controles de Ejecución</h3>
          <span className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-mono text-sm">
            Paso {currentStep + 1} / {totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onSkipToStart}
            disabled={currentStep === 0}
            className="p-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ir al inicio"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={onPrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <button
            onClick={onPlay}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2 font-semibold"
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                Pausar
              </>
            ) : (
              <>
                <Play size={20} />
                Reproducir
              </>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={currentStep === totalSteps - 1}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Siguiente
            <ChevronRight size={20} />
          </button>

          <button
            onClick={onSkipToEnd}
            disabled={currentStep === totalSteps - 1}
            className="p-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ir al final"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={onReset}
            className="p-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all"
            title="Reiniciar"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StepControls;