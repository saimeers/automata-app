// src/components/ConversionAFNDtoAFD.tsx
import { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';

import type { ConversionStep, ConversionResult } from '../algorithms/ConversionAFNDtoAFD';
import { createConverterFromStrings } from '../algorithms/ConversionAFNDtoAFD';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function ConversionAFNDtoAFD() {
  // ------------------------------
  // ESTADOS DEL FORMULARIO
  // ------------------------------
  const [stringTransitions, setStringTransitions] = useState<string[]>([
    'A-B,C,D',
    'B-C,D,E',
    'C-B,E,C',
    'D-C,E,BC',
    'E-D,C,B'
  ]);

  const [stringSymbols, setStringSymbols] = useState('012');
  const [stringInitial, setStringInitial] = useState('A');
  const [stringFinals, setStringFinals] = useState('B,C,D,E');

  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([]);
  const [afdFinalStates, setAfdFinalStates] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  // ------------------------------
  // VALIDACIONES
  // ------------------------------

  // Opción 1: Bloquear repetir estado como ORIGEN
  function validarSinEstadosRepetidos(transitions: string[]): string | null {
    const origenes = new Set<string>();

    for (const line of transitions) {
      if (!line.includes('-')) return `❌ ERROR: La transición "${line}" no tiene el formato Estado-Transiciones.`;

      const [estado] = line.split('-');

      if (origenes.has(estado)) {
        return `❌ ERROR: El estado origen "${estado}" ya está declarado anteriormente. Cada estado origen debe ser único.`;
      }
      origenes.add(estado);
    }
    return null;
  }

  // Opción 3: Bloquear usar estados que no existen dentro del conjunto
  function validarEstadosDestino(transitions: string[]): string | null {
    const origenes = new Set<string>();

    // recolectar estados declarados como origen
    for (const line of transitions) {
      const [estado] = line.split('-');
      origenes.add(estado);
    }

    // verificar destinos
    for (const line of transitions) {
      const [_, dest] = line.split('-');
      const destinos = dest.split(',');

      for (const d of destinos) {
        // Cada letra del destino debe existir entre los estados declarados
        for (const letra of d.split('')) {
          if (!origenes.has(letra)) {
            return `❌ ERROR: El estado destino "${letra}" en "${line}" no existe entre los estados declarados: ${[...origenes].join(', ')}`;
          }
        }
      }
    }
    return null;
  }

  function validarEstadoInicial() {
    if (stringInitial.length !== 1) {
      return `❌ ERROR: El estado inicial debe ser una única letra.`;
    }
    const finalStates = stringFinals.split(',');
    if (finalStates.includes(stringInitial)) {
      return `❌ ERROR: El estado inicial "${stringInitial}" no puede ser un estado final.`;
    }
    return null;
  }

  // ------------------------------
  // FUNCIÓN PRINCIPAL DE CONVERSIÓN
  // ------------------------------

  function convert() {
    try {
      // 🔍 Validaciones
      const v1 = validarSinEstadosRepetidos(stringTransitions);
      if (v1) return alert(v1);

      const v2 = validarEstadosDestino(stringTransitions);
      if (v2) return alert(v2);

      const v3 = validarEstadoInicial();
      if (v3) return alert(v3);

      // ✔️ Si todas las validaciones pasan → Convertir
      const result: ConversionResult = createConverterFromStrings(
        stringTransitions,
        stringSymbols,
        stringInitial,
        stringFinals
      );

      setConversionSteps(result.conversionSteps);
      setAfdFinalStates(result.afdFinalStates);
      setShowResult(true);

    } catch (error) {
      alert('Error al procesar: ' + (error as Error).message);
    }
  }

  function reset() {
    setShowResult(false);
    setConversionSteps([]);
    setAfdFinalStates([]);
  }

  // --------------------------------------------------------------------
  // INTERFAZ
  // --------------------------------------------------------------------

  return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
              <Header />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 backdrop-blur-sm to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔄 Conversión AFND → AFD</h1>
          <p className="text-blue-200">Convierte un Autómata Finito No Determinista a Determinista</p>
        </div>

        {/* Configuración */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📝 Configuración del AFND (Formato String)</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Símbolos (alfabeto)</label>
              <input type="text" value={stringSymbols} onChange={e => setStringSymbols(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Estado Inicial</label>
              <input type="text" value={stringInitial} onChange={e => setStringInitial(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Estados Finales</label>
              <input type="text" value={stringFinals} onChange={e => setStringFinals(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white" />
            </div>
          </div>

          {/* Transiciones */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-blue-200">
                Transiciones (Formato: Estado-Trans1,Trans2)
              </label>
              <button onClick={() => setStringTransitions([...stringTransitions, ''])}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold">
                + Agregar
              </button>
            </div>

            <div className="space-y-2">
              {stringTransitions.map((trans, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={trans}
                    onChange={(e) => {
                      const arr = [...stringTransitions]; arr[idx] = e.target.value; setStringTransitions(arr);
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white font-mono" />
                  <button onClick={() => setStringTransitions(stringTransitions.filter((_, i) => i !== idx))}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mb-6">
          <button onClick={convert}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            Convertir a AFD
          </button>
          {showResult && (
            <button onClick={reset}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Reiniciar
            </button>
          )}
        </div>

        {/* Resultados */}
        {showResult && conversionSteps.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">✅ Tabla de Conversión AFD</h2>
            <div className="mb-6 space-y-2 text-blue-200">
              <p><strong>📍 Estado Inicial:</strong> <span className="text-white">{stringInitial}</span></p>
              <p><strong>🎯 Estados Finales:</strong> <span className="text-white">{afdFinalStates.join(', ')}</span></p>
              <p><strong>📊 Total Estados:</strong> <span className="text-white">{conversionSteps.length}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b-2 border-white/30">
                    <th className="px-4 py-3 text-left">Estado</th>
                    {stringSymbols.split('').map(s => <th key={s} className="px-4 py-3 text-center">{s}</th>)}
                    <th className="px-4 py-3 text-center">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionSteps.map((step, idx) => (
                    <tr key={idx} className={`border-b border-white/10 ${step.isFinal ? 'bg-yellow-500/20' : ''}`}>
                      <td className="px-4 py-3 font-bold">{idx === 0 ? '→ ' : ''}{step.currentState}</td>
                      {stringSymbols.split('').map(s => <td key={s} className="px-4 py-3 text-center">{step.transitions[s]}</td>)}
                      <td className="px-4 py-3 text-center text-xl">{step.isFinal ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </div>
  );
}

export default ConversionAFNDtoAFD;
