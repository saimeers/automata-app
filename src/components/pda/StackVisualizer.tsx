import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackVisualizerProps {
  stacks: string[][];
  stackNames: string[];
}

const StackVisualizer: React.FC<StackVisualizerProps> = ({ stacks, stackNames }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stacks.map((stack, stackIndex) => (
        <motion.div
          key={stackIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stackIndex * 0.1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg text-blue-400 font-mono">
                {stackNames[stackIndex]}
              </span>
              Pila {stackNames[stackIndex]}
            </h4>
            <span className="text-sm text-slate-400">↑ tope</span>
          </div>

          <div className="relative min-h-[200px] flex flex-col-reverse gap-2">
            <AnimatePresence mode="popLayout">
              {stack.map((symbol, symbolIndex) => (
                <motion.div
                  key={`${stackIndex}-${symbolIndex}-${symbol}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className={`px-4 py-3 rounded-lg font-mono text-center font-bold text-lg
                    ${symbolIndex === stack.length - 1
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-400'
                      : symbolIndex === 0
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                    }
                  `}
                >
                  <motion.span
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                  >
                    {symbol}
                  </motion.span>
                  {symbolIndex === 0 && (
                    <span className="block text-xs mt-1 opacity-70">(fondo)</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 text-xs text-slate-400 text-center">
            {stack.length} elemento{stack.length !== 1 ? 's' : ''}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StackVisualizer;