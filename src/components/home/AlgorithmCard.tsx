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

  // Extraer los colores del gradiente para el efecto hover
  const getColorClass = () => {
    const colorMap: { [key: string]: string } = {
      'from-blue-500 to-cyan-500': 'bg-blue-500/10',
      'from-purple-500 to-pink-500': 'bg-purple-500/10',
      'from-orange-500 to-red-500': 'bg-orange-500/10',
      'from-blue-500 to-blue-600': 'bg-blue-500/10',
      'from-purple-500 to-purple-600': 'bg-purple-500/10',
      'from-emerald-500 to-emerald-600': 'bg-emerald-500/10',
      'from-orange-500 to-orange-600': 'bg-orange-500/10',
      'from-pink-500 to-pink-600': 'bg-pink-500/10',
      'from-cyan-500 to-cyan-600': 'bg-cyan-500/10',
      'from-red-500 to-red-600': 'bg-red-500/10',
      'from-indigo-500 to-indigo-600': 'bg-indigo-500/10',
      'from-teal-500 to-teal-600': 'bg-teal-500/10',
      'from-yellow-500 to-yellow-600': 'bg-yellow-500/10',
    };
    return colorMap[color] || 'bg-slate-500/10';
  };

  return (
    <div className="relative">
      {/* Glow effect - debe estar fuera del motion.div */}
      {isAvailable && isHovered && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
          className={`
            absolute inset-0 rounded-2xl blur-2xl
            bg-gradient-to-br ${color}
          `} 
        />
      )}

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
          h-full p-6 rounded-xl border transition-all duration-300 relative z-10
          ${isAvailable 
            ? `bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer hover:scale-105 ${isHovered ? getColorClass() : ''}` 
            : 'bg-slate-900/30 border-slate-800 cursor-not-allowed opacity-60'
          }
          backdrop-blur-sm
        `}>
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center mb-4
          bg-gradient-to-br ${color}
          ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
          transition-all duration-300
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
        <h4 className="text-xl font-bold text-white mb-2 transition-colors duration-300">
          {title}
        </h4>
        <p className="text-slate-400 text-sm leading-relaxed transition-colors duration-300">
          {description}
        </p>

        {/* Arrow indicator */}
        {isAvailable && (
          <div className={`
            absolute bottom-6 right-6 transition-all duration-300
            ${isHovered ? 'translate-x-1 text-white' : 'translate-x-0 text-slate-500'}
          `}>
            <ArrowRight size={20} />
          </div>
        )}
      </div>
    </motion.div>
    </div>
  );
};

export default AlgorithmCard;