import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

interface StateNodeProps {
  data: {
    label: string;
    isInitial: boolean;
    isFinal: boolean;
    isActive: boolean;
  };
}

const StateNode = memo(({ data }: StateNodeProps) => {
  const { label, isInitial, isFinal, isActive } = data;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      
      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
          boxShadow: isActive ? '0 0 30px rgba(59, 130, 246, 0.6)' : 'none'
        }}
        transition={{ duration: 0.3 }}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          border-4 transition-all
          ${isActive 
            ? 'bg-blue-500 border-blue-400' 
            : 'bg-slate-800 border-slate-600'
          }
          ${isFinal ? 'shadow-lg' : ''}
        `}
      >
        {/* Doble círculo para estados finales */}
        {isFinal && (
          <div className="absolute inset-2 rounded-full border-4 border-current" />
        )}

        {/* Flecha de estado inicial */}
        {isInitial && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2">
            <div className="w-8 h-0.5 bg-green-500 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-green-500" />
            </div>
          </div>
        )}

        {/* Label del estado */}
        <span className={`
          text-xl font-bold z-10
          ${isActive ? 'text-white' : 'text-slate-200'}
        `}>
          {label}
        </span>

        {/* Efecto de pulso cuando está activo */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
  );
});

StateNode.displayName = 'StateNode';

export default StateNode;