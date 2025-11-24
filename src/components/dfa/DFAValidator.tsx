import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DFA, ValidationResult } from '../../types/dfa.types';
import { DFAClass } from '../../core/DFA';

interface DFAValidatorProps {
  dfa: DFA;
  title?: string;
}

const DFAValidator: React.FC<DFAValidatorProps> = ({ dfa, title = 'Validador de Cadenas' }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const dfaInstance = new DFAClass(dfa);

  const handleValidate = () => {
    if (!input.trim()) {
      toast.error('Por favor ingresa una cadena');
      return;
    }

    try {
      const validationResult = dfaInstance.validate(input);
      setResult(validationResult);

      if (validationResult.accepted) {
        toast.success('¡Cadena aceptada!');
      } else {
        toast.error('Cadena rechazada');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loadExample = () => {
    // Generar ejemplo basado en el alfabeto
    const exampleSymbols = dfa.alphabet.slice(0, 3);
    setInput(exampleSymbols.join(','));
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800"
    >
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cadena de entrada (separada por comas)
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ej: ${dfa.alphabet.slice(0, 2).join(',')}`}
          rows={2}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-slate-400 text-xs mt-1">
          Alfabeto disponible: {dfa.alphabet.join(', ')}
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleValidate}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
        >
          <Play size={18} />
          Validar
        </button>
        <button
          onClick={loadExample}
          className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all"
        >
          Cargar Ejemplo
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-6 rounded-xl p-4 border-2 ${
            result.accepted
              ? 'bg-emerald-500/10 border-emerald-500/50'
              : 'bg-red-500/10 border-red-500/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.accepted ? (
              <CheckCircle className="text-emerald-400" size={24} />
            ) : (
              <XCircle className="text-red-400" size={24} />
            )}
            <h4 className={`text-lg font-bold ${
              result.accepted ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {result.accepted ? 'Cadena Aceptada' : 'Cadena Rechazada'}
            </h4>
          </div>

          {/* Camino */}
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-300 text-sm font-semibold mb-2">Camino de ejecución:</p>
            <div className="flex flex-wrap gap-2">
              {result.path.map((state, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`px-3 py-1 rounded-lg font-mono text-sm ${
                      idx === result.path.length - 1
                        ? result.accepted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                        : idx === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {state}
                  </div>
                  {idx < result.path.length - 1 && (
                    <span className="text-slate-400 self-center">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Estado final */}
          <div className="mt-3 text-sm text-slate-300">
            Estado final: <span className="font-mono font-bold text-white">{result.finalState}</span>
            {result.accepted && dfa.accept.has(result.finalState) && (
              <span className="ml-2 text-emerald-400">(Estado de aceptación ✓)</span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DFAValidator;