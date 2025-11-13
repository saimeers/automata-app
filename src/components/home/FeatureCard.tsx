import { motion } from 'framer-motion';
import type { ComponentType } from 'react';

interface FeatureCardProps {
  icon: ComponentType<{ size?: number; className?: string }>; 
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-600">
        <Icon className="text-blue-400" size={28} />
      </div>
      <h4 className="text-xl font-bold text-white mb-2">
        {title}
      </h4>
      <p className="text-slate-400">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;