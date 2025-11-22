import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';

interface AlgorithmCardProps {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>; 
  color: string;
  status: 'Disponible' | 'Próximamente';
  index: number;
  onClick?: () => void;
}

const AlgorithmCard = ({ 
  id, 
  title, 
  description, 
  icon: Icon, 
  color, 
  status, 
  index,
  onClick 
}: AlgorithmCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isAvailable = status === 'Disponible';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isAvailable ? onClick : undefined}
      className="relative group"
    >
      <div className={`
        h-full p-6 rounded-xl border transition-all duration-300
        ${isAvailable 
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer hover:scale-105' 
          : 'bg-slate-900/30 border-slate-800 cursor-not-allowed opacity-60'
        }
        backdrop-blur-sm
      `}>
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center mb-4
          bg-gradient-to-br ${color}
          ${isHovered ? 'scale-110' : 'scale-100'}
          transition-transform duration-300
        `}>
          <Icon className="text-white" size={24} />
        </div>

        {/* Status Badge */}
        <span className={`
          inline-block px-3 py-1 rounded-full text-xs font-medium mb-3
          ${isAvailable 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
          }
        `}>
          {status}
        </span>

        {/* Content */}
        <h4 className="text-xl font-bold text-white mb-2">
          {title}
        </h4>
        <p className="text-slate-400 text-sm leading-relaxed">
          {description}
        </p>

        {/* Arrow indicator */}
        {isAvailable && (
          <div className={`
            absolute bottom-6 right-6 transition-transform duration-300
            ${isHovered ? 'translate-x-1' : 'translate-x-0'}
          `}>
            <ArrowRight className="text-slate-500" size={20} />
          </div>
        )}
      </div>

      {/* Glow effect */}
      {isAvailable && isHovered && (
        <div className={`
          absolute inset-0 rounded-2xl opacity-20 blur-xl -z-10
          bg-gradient-to-br ${color}
        `} />
      )}
    </motion.div>
  );
};

export default AlgorithmCard;