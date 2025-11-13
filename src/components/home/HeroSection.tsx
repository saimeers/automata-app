import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartDemo: () => void;
}

const HeroSection = ({ onStartDemo }: HeroSectionProps) => {
  return (
    <section className="container mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-block mb-6"
        >
          <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
            Teoría de Autómatas y Lenguajes Formales
          </span>
        </motion.div>

        <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
          Visualiza y aprende
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Autómatas Finitos
          </span>
        </h2>

        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
          Plataforma interactiva para explorar algoritmos fundamentales de la teoría de la computación.
          Visualiza conversiones, minimizaciones y simulaciones en tiempo real.
        </p>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={onStartDemo}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            <PlayCircle size={20} />
            Probar Demo
            <ArrowRight size={18} />
          </button>
          <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all hover:scale-105">
            Ver Documentación
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;