import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import type { ValidationResult } from '../../types/automaton';

interface ValidationPanelProps {
  inputString: string;
  setInputString: (value: string) => void;
  onValidate: () => void;
  validationResult: ValidationResult | null;
}

const ValidationPanel = ({
  inputString,
  setInputString,
  onValidate,
  validationResult
}: ValidationPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4">Validar Cadena</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cadena de entrada
          </label>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onValidate()}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-lg"
            placeholder="Ej: aabba"
          />
        </div>

        <button
          onClick={onValidate}
          disabled={!inputString}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Validar Cadena
        </button>

        {validationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`
              p-4 rounded-xl border-2 flex items-center gap-3
              ${validationResult.accepted 
                ? 'bg-green-500/10 border-green-500/50' 
                : 'bg-red-500/10 border-red-500/50'
              }
            `}
          >
            {validationResult.accepted ? (
              <>
                <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <p className="text-green-400 font-bold">¡Cadena Aceptada!</p>
                  <p className="text-green-300 text-sm">
                    Estado final: {validationResult.finalState}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="text-red-400 flex-shrink-0" size={24} />
                <div>
                  <p className="text-red-400 font-bold">Cadena Rechazada</p>
                  <p className="text-red-300 text-sm">
                    {validationResult.finalState === 'ERROR' 
                      ? 'No hay transición válida'
                      : `Estado final no aceptador: ${validationResult.finalState}`
                    }
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ValidationPanel;