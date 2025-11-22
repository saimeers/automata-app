import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { PushdownAutomaton } from '../../core/PushdownAutomaton';
import { generateDOT, downloadDOT, downloadSVG } from '../../utils/graphGenerator';

interface GraphVisualizerProps {
  pda: PushdownAutomaton;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ pda }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [dotCode, setDotCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const code = generateDOT(pda);
    setDotCode(code);

    if (containerRef.current && isVisible) {
      setIsLoading(true);
      setError(null);

      // Importar dinámicamente con manejo de errores
      import('d3-graphviz')
        .then((d3GraphvizModule) => {
          // @ts-ignore - ignorar tipos faltantes
          const { graphviz } = d3GraphvizModule;
          
          try {
            if (containerRef.current) {
              graphviz(containerRef.current, {
                useWorker: false,
                engine: 'dot'
              })
                .zoom(true)
                .fit(true)
                .onerror((err: any) => {
                  console.error('Graphviz error:', err);
                  setError('Error al renderizar el grafo');
                  setIsLoading(false);
                })
                .renderDot(code);
              
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Error rendering graph:', err);
            setError('Error al renderizar el grafo. Intenta recargar la página.');
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error loading graphviz:', err);
          setError('Error al cargar la librería de visualización');
          setIsLoading(false);
        });
    }
  }, [pda, isVisible]);

  const handleDownloadDOT = () => {
    downloadDOT(dotCode);
  };

  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      downloadSVG(svg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Diagrama del Autómata</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            {isVisible ? 'Ocultar' : 'Mostrar'}
          </button>
          <button
            onClick={handleDownloadDOT}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            DOT
          </button>
          <button
            onClick={handleDownloadSVG}
            disabled={!containerRef.current?.querySelector('svg')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            SVG
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-red-400 font-semibold">Error de visualización</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <div 
            ref={containerRef} 
            className="w-full min-h-[400px] bg-slate-950 rounded-xl border border-slate-800 overflow-auto"
          />
          
          <details className="mt-4">
            <summary className="text-slate-400 cursor-pointer hover:text-slate-300 transition-colors font-medium">
              Ver código DOT
            </summary>
            <pre className="mt-2 p-4 bg-slate-950 rounded-lg text-slate-300 text-xs overflow-x-auto border border-slate-800 font-mono">
              {dotCode}
            </pre>
            <p className="text-slate-400 text-xs mt-2">
              Copia este código y pégalo en{' '}
              
                href="https://dreampuf.github.io/GraphvizOnline/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              <a>
                Graphviz Online
              </a>{' '}
              para visualizarlo externamente
            </p>
          </details>
        </div>
      )}
    </motion.div>
  );
};

export default GraphVisualizer;