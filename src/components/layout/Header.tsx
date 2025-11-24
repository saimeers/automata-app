import { GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl"
    >
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GitBranch className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AutomataLab</h1>
              <p className="text-xs text-slate-400">Teoría de la Computación</p>
            </div>
          </button>
          <div className="flex gap-3">
            <button 
            onClick={() =>
              window.open("https://docs.google.com/document/d/1A6ZYRbuSjGtntfSBmNwId3UEGsII2ro4IP_T3ZHIEFo/edit?usp=sharing", "_blank")
            }
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Documentación
            </button>
            <button 
            onClick={() =>
              window.open("https://github.com/saimeers/automata-app", "_blank")
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;