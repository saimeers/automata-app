import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Binary, 
  GitBranch, 
  Layers, 
  Zap,
  BookOpen,
  Code2,
  PlayCircle
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import AlgorithmCard from '../components/home/AlgorithmCard';
import FeatureCard from '../components/home/FeatureCard';
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate();

  const algorithms = [
    {
      id: 1,
      title: "Conversión AFND → AFD",
      description: "Transforma autómatas finitos no deterministas en deterministas usando construcción de subconjuntos",
      icon: GitBranch,
      color: "from-blue-500 to-cyan-500",
      status: "Disponible" as const,
      onClick: () => navigate('/afnd-afd')
    },
    {
      id: 2,
      title: "Minimización de AFD",
      description: "Reduce estados equivalentes usando el algoritmo de partición por subgrupos",
      icon: Layers,
      color: "from-purple-500 to-pink-500",
      status: "Disponible" as const,
      onClick: () => navigate('/minimizacion'),
    },
    {
      id: 3,
      title: "Autómatas de Pila (PDA)",
      description: "Simula lenguajes libres de contexto con memoria de pila",
      icon: Binary,
      color: "from-orange-500 to-red-500",
      status: "Disponible" as const,
      onClick: () => navigate('/pda'),
    },
    {
      id: 4,
      title: "Verificación de Cadenas",
      description: "Valida si una cadena es aceptada por un AFD con animación paso a paso",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      status: "Disponible" as const,
      onClick: () => navigate('/string-validation')
    }
  ];

  const features = [
    {
      icon: PlayCircle,
      title: "Visualización Interactiva",
      description: "Observa el proceso de ejecución paso a paso con animaciones fluidas"
    },
    {
      icon: Code2,
      title: "Código TypeScript",
      description: "Implementaciones limpias y bien documentadas de cada algoritmo"
    },
    {
      icon: BookOpen,
      title: "Explicaciones Detalladas",
      description: "Aprende la teoría detrás de cada algoritmo mientras lo ejecutas"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <HeroSection onStartDemo={() => navigate('/string-validation')} />

      {/* Algorithms Grid */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Algoritmos Implementados
            </h3>
            <p className="text-slate-400 text-lg">
              Explora diferentes técnicas de manipulación de autómatas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {algorithms.map((algo, index) => (
              <AlgorithmCard key={algo.id} {...algo} index={index} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h3>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Prueba el algoritmo de verificación de cadenas y observa cómo un autómata procesa símbolos paso a paso
            </p>
            <button 
               onClick={() => navigate('/string-validation')}
              className="px-10 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-slate-100 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-xl"
            >
              <Zap size={20} />
              Probar Verificación de Cadenas
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;