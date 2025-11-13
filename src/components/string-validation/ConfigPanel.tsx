import { motion } from 'framer-motion';
import { Settings, Play } from 'lucide-react';

interface ConfigPanelProps {
  alphabet: string;
  setAlphabet: (value: string) => void;
  rules: string;
  setRules: (value: string) => void;
  initialState: string;
  setInitialState: (value: string) => void;
  finalStates: string;
  setFinalStates: (value: string) => void;
  onGenerate: () => void;
}

const ConfigPanel = ({
  alphabet,
  setAlphabet,
  rules,
  setRules,
  initialState,
  setInitialState,
  finalStates,
  setFinalStates,
  onGenerate
}: ConfigPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-blue-400" size={24} />
        <h2 className="text-xl font-bold text-white">Configuración del AFD</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Alfabeto (separado por comas)
          </label>
          <input
            type="text"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="a,b,c"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estado inicial
          </label>
          <input
            type="text"
            value={initialState}
            onChange={(e) => setInitialState(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="q0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estados finales (separados por comas)
          </label>
          <input
            type="text"
            value={finalStates}
            onChange={(e) => setFinalStates(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="q2,q3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Reglas de transición (origen,símbolo,destino)
          </label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            rows={10}
            placeholder="q0,a,q1&#10;q1,b,q2&#10;q2,a,q0"
          />
          <p className="text-xs text-slate-500 mt-2">
            Una regla por línea en formato: estado,símbolo,estado
          </p>
        </div>

        <button
          onClick={onGenerate}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <Play size={20} />
          Generar Autómata
        </button>
      </div>
    </motion.div>
  );
};

export default ConfigPanel;