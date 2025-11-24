import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, GitBranch, Plus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { ConversionResult } from '../algorithms/ConversionAFNDtoAFD';
import { createConverterFromStrings } from '../algorithms/ConversionAFNDtoAFD';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AFDVisualizer from '../components/conversion/AFDVisualizer';

function ConversionAFNDtoAFD() {
  // Estados separados
  const [estados, setEstados] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);
  const [stringSymbols, setStringSymbols] = useState('012');
  const [stringInitial, setStringInitial] = useState('A');
  const [stringFinals, setStringFinals] = useState('B,C,D,E');

  // Transiciones organizadas por estado
  const [transiciones, setTransiciones] = useState<Record<string, string>>({
    'A': 'B,C,D',
    'B': 'C,D,E',
    'C': 'B,E,C',
    'D': 'C,E,BC',
    'E': 'D,C,B'
  });

  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // ===== GESTIÓN DE ESTADOS =====
  function addEstado() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letra of letras) {
      if (!estados.includes(letra)) {
        setEstados([...estados, letra]);
        setTransiciones({ ...transiciones, [letra]: '' });
        return;
      }
    }
    toast.error('No hay más letras disponibles');
  }

  function updateEstado(idx: number, value: string) {
    const nuevoEstado = value.toUpperCase().trim();
    
    if (nuevoEstado && (nuevoEstado.length > 1 || !/^[A-Z]$/i.test(nuevoEstado))) {
      toast.error('El estado debe ser una única letra');
      return;
    }

    const estadoAnterior = estados[idx];

    if (nuevoEstado && estados.includes(nuevoEstado) && estadoAnterior !== nuevoEstado) {
      toast.error('Ese estado ya existe');
      return;
    }

    const newEstados = [...estados];
    newEstados[idx] = nuevoEstado;
    setEstados(newEstados);

    // Actualizar transiciones
    const newTransiciones = { ...transiciones };
    if (estadoAnterior !== nuevoEstado) {
      newTransiciones[nuevoEstado] = newTransiciones[estadoAnterior] || '';
      delete newTransiciones[estadoAnterior];
    }
    setTransiciones(newTransiciones);

    // Actualizar estado inicial
    if (stringInitial === estadoAnterior) {
      setStringInitial(nuevoEstado);
    }

    // Actualizar estados finales
    const finales = stringFinals.split(',').map(f => f.trim()).filter(f => f);
    if (finales.includes(estadoAnterior)) {
      const newFinales = finales.map(f => f === estadoAnterior ? nuevoEstado : f);
      setStringFinals(newFinales.join(','));
    }
  }

  function deleteEstado(idx: number) {
    if (estados.length <= 1) {
      toast.error('Debe haber al menos un estado');
      return;
    }

    const estadoEliminado = estados[idx];
    const newEstados = estados.filter((_, i) => i !== idx);
    setEstados(newEstados);

    // Eliminar de transiciones
    const newTransiciones = { ...transiciones };
    delete newTransiciones[estadoEliminado];
    setTransiciones(newTransiciones);

    // Actualizar inicial si era el eliminado
    if (stringInitial === estadoEliminado) {
      setStringInitial(newEstados[0] || '');
    }

    // Actualizar finales
    const finales = stringFinals.split(',').map(f => f.trim()).filter(f => f !== estadoEliminado);
    setStringFinals(finales.join(','));
  }

  // ===== VALIDACIONES =====
  function validarEstados(): string | null {
    if (estados.length === 0) {
      return 'Debe haber al menos un estado';
    }

    for (const estado of estados) {
      if (!estado || estado.length !== 1 || !/^[A-Z]$/i.test(estado)) {
        return 'Todos los estados deben ser una única letra';
      }
    }

    const estadosUnicos = new Set(estados);
    if (estadosUnicos.size !== estados.length) {
      return 'Hay estados duplicados';
    }

    return null;
  }

  function validarEstadoInicial(): string | null {
    if (!stringInitial) {
      return 'Debe seleccionar un estado inicial';
    }
    
    if (!estados.includes(stringInitial)) {
      return `El estado inicial "${stringInitial}" no existe`;
    }

    return null;
  }

  function validarEstadosFinales(): string | null {
    const finales = stringFinals.split(',').map(f => f.trim()).filter(f => f);
    
    if (finales.length === 0) {
      return 'Debe haber al menos un estado final';
    }
    
    for (const f of finales) {
      if (!estados.includes(f)) {
        return `El estado final "${f}" no existe`;
      }
    }

    return null;
  }

  function validarTransiciones(): string | null {
    for (const estado of estados) {
      const trans = transiciones[estado];
      if (trans === undefined) {
        return `El estado "${estado}" no tiene transiciones definidas`;
      }

      // Validar que los estados destino existan
      if (trans) {
        const destinos = trans.split(',').map(d => d.trim());
        for (const destino of destinos) {
          for (const letra of destino.split('')) {
            if (letra && !estados.includes(letra)) {
              return `El estado destino "${letra}" en la transición de "${estado}" no existe`;
            }
          }
        }
      }
    }

    return null;
  }

  // ===== CONVERSIÓN =====
  function convert() {
    try {
      const v0 = validarEstados();
      if (v0) {
        toast.error(v0);
        return;
      }

      const v1 = validarEstadoInicial();
      if (v1) {
        toast.error(v1);
        return;
      }

      const v2 = validarEstadosFinales();
      if (v2) {
        toast.error(v2);
        return;
      }

      const v3 = validarTransiciones();
      if (v3) {
        toast.error(v3);
        return;
      }

      // Convertir transiciones a formato string[]
      const stringTransitions = estados.map(estado => `${estado}-${transiciones[estado] || ''}`);

      const result = createConverterFromStrings(
        stringTransitions,
        stringSymbols,
        stringInitial,
        stringFinals
      );

      setConversionResult(result);
      setShowResult(true);

      toast.success(
        `Conversión exitosa: ${estados.length} → ${result.totalStates} estados`,
        { duration: 5000 }
      );

    } catch (error) {
      toast.error('Error al procesar: ' + (error as Error).message);
    }
  }

  function reset() {
    setShowResult(false);
    setConversionResult(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Toaster position="top-right" />
      <Header />
      
      {/* Header Section */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <GitBranch className="text-blue-400" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">Conversión AFND → AFD</h1>
              <p className="text-slate-400 text-sm mt-1">
                Convierte un Autómata Finito No Determinista a Determinista
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {!showResult ? (
          /* CONFIGURACIÓN */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Configuración Básica */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-6">Configuración del AFND</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Alfabeto (Σ)
                  </label>
                  <input
                    type="text"
                    value={stringSymbols}
                    onChange={e => setStringSymbols(e.target.value)}
                    placeholder="012"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <p className="text-slate-400 text-xs mt-2">Símbolos del alfabeto sin separadores</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estado Inicial (q₀)
                  </label>
                  <select
                    value={stringInitial}
                    onChange={e => setStringInitial(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  >
                    <option value="">Seleccionar...</option>
                    {estados.filter(e => e).map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <p className="text-slate-400 text-xs mt-2">Selecciona de los estados disponibles</p>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Estados (Q)</h3>
                  <p className="text-slate-400 text-sm mt-1">Define todos los estados del autómata</p>
                </div>
                <button
                  onClick={addEstado}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Estado
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <AnimatePresence>
                  {estados.map((estado, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={estado}
                        onChange={e => updateEstado(idx, e.target.value)}
                        maxLength={1}
                        placeholder="A"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-center text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => deleteEstado(idx)}
                        disabled={estados.length <= 1}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Estados Finales */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-white">Estados Finales (F)</h3>
                <p className="text-slate-400 text-sm mt-1">Selecciona los estados de aceptación</p>
              </div>
              
              <div className="flex flex-wrap gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl min-h-[80px]">
                {estados.filter(e => e).map(estado => {
                  const isInicial = estado === stringInitial;
                  const isFinal = stringFinals.split(',').map(f => f.trim()).includes(estado);
                  
                  return (
                    <button
                      key={estado}
                      onClick={() => {
                        const finales = stringFinals.split(',').map(f => f.trim()).filter(f => f);
                        if (isFinal) {
                          const newFinales = finales.filter(f => f !== estado);
                          setStringFinals(newFinales.join(','));
                        } else {
                          setStringFinals([...finales, estado].join(','));
                        }
                      }}
                      className={`px-5 py-2.5 rounded-lg font-mono font-bold transition-all text-base ${
                        isFinal
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } ${isInicial ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                    >
                      {isInicial && '→ '}
                      {estado}
                    </button>
                  );
                })}
              </div>
              <p className="text-slate-400 text-xs mt-3">
                💡 Haz clic en los estados para marcarlos como finales. El estado inicial está marcado con →
              </p>
            </div>

            {/* Transiciones */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Función de Transición (δ)</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Define las transiciones para cada símbolo del alfabeto (separadas por comas)
                </p>
              </div>

              <div className="space-y-3">
                {estados.filter(e => e).map((estado) => (
                  <motion.div
                    key={estado}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-center"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center border-2 border-slate-600 shadow-lg">
                      <span className="text-white font-mono font-bold text-xl">{estado}</span>
                    </div>
                    <span className="text-slate-400 text-2xl font-bold">→</span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={transiciones[estado] || ''}
                        onChange={e => setTransiciones({ ...transiciones, [estado]: e.target.value })}
                        placeholder={`Ej: B,C,D o AB,C (para ${stringSymbols.length} símbolos)`}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-sm">
                  <strong>Formato:</strong> Separa las transiciones por comas. Una por cada símbolo del alfabeto ({stringSymbols}).
                  <br />
                  <strong>Ejemplo:</strong> Si el alfabeto es "012" y desde A vas a: B con "0", C con "1", y D con "2", escribe: <code className="bg-slate-800 px-2 py-1 rounded">B,C,D</code>
                </p>
              </div>
            </div>

            {/* Botón Convertir */}
            <button
              onClick={convert}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/50 transition-all"
            >
              <Play size={20} />
              Convertir a AFD
            </button>
          </motion.div>
        ) : (
          /* RESULTADOS */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Comparación de Estados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold text-slate-400 mb-2">AFND Original</h3>
                <p className="text-4xl font-bold text-white">{estados.length}</p>
                <p className="text-slate-400 text-sm mt-1">estados</p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 flex items-center justify-center">
                <ArrowRight className="text-blue-400" size={48} />
              </div>

              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/50">
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">AFD Resultante</h3>
                <p className="text-4xl font-bold text-white">{conversionResult?.totalStates}</p>
                <p className="text-emerald-400 text-sm mt-1">
                  {conversionResult && estados.length > 0 &&
                    `${conversionResult.totalStates >= estados.length ? 'Expansión' : 'Reducción'}: ${Math.abs(((conversionResult.totalStates - estados.length) / estados.length * 100)).toFixed(1)}%`
                  }
                </p>
              </div>
            </div>

            {/* Información del AFD */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-xl">→</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Estado Inicial</p>
                    <p className="text-white font-mono font-semibold text-lg">{stringInitial}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Estados Finales</p>
                    <p className="text-white font-mono font-semibold text-lg">
                      {conversionResult?.afdFinalStates.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 text-xl">Σ</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Alfabeto</p>
                    <p className="text-white font-mono font-semibold text-lg">{stringSymbols}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Transiciones */}
            {conversionResult && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-6">Tabla de Transiciones del AFD</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-700">
                        <th className="px-4 py-3 text-left text-slate-300 font-semibold">Estado</th>
                        {stringSymbols.split('').map(s => (
                          <th key={s} className="px-4 py-3 text-center text-slate-300 font-semibold">
                            {s}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-slate-300 font-semibold">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversionResult.conversionSteps.map((step, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-slate-800 ${
                            step.isFinal ? 'bg-emerald-500/10' : ''
                          } ${
                            step.currentState === stringInitial ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-white">
                            {step.currentState === stringInitial && '→ '}
                            {step.currentState}
                          </td>
                          {stringSymbols.split('').map(s => (
                            <td key={s} className="px-4 py-3 text-center font-mono text-slate-300">
                              {step.transitions[s] || '∅'}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center text-2xl">
                            {step.isFinal ? (
                              <span className="text-emerald-400">✓</span>
                            ) : (
                              <span className="text-slate-600">✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <AFDVisualizer
              result={conversionResult}
              initialState={stringInitial}
              symbols={stringSymbols}
              title="Diagrama del AFD Resultante"
            />

            {/* Botón Reiniciar */}
            <button
              onClick={reset}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <RefreshCw size={20} />
              Crear Nueva Conversión
            </button>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ConversionAFNDtoAFD;