import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minimize2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DFABuilder from '../components/dfa/DFABuilder';
import DFAVisualizer from '../components/dfa/DFAVisualizer';
import DFAValidator from '../components/dfa/DFAValidator';
import MinimizationSteps from '../components/dfa/MinimizationSteps';
import { minimizeDFA } from '../minimization';
import type { DFA, DFABuilderConfig, MinimizedDFA, MinimizationStep } from '../types/dfa.types';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const DFAMinimizer: React.FC = () => {
    const [originalDFA, setOriginalDFA] = useState<DFA | null>(null);
    const [minimizedDFA, setMinimizedDFA] = useState<MinimizedDFA | null>(null);
    const [steps, setSteps] = useState<MinimizationStep[]>([]);
    const [showResults, setShowResults] = useState(false);

    const handleDFACreated = (config: DFABuilderConfig) => {
        // Convertir config a DFA
        const transitionMap: Record<string, Record<string, string>> = {};

        config.states.forEach(state => {
            transitionMap[state] = {};
        });

        config.transitions.forEach(t => {
            transitionMap[t.from][t.symbol] = t.to;
        });

        const dfa: DFA = {
            states: config.states,
            alphabet: config.alphabet,
            start: config.start,
            accept: new Set(config.acceptStates),
            transition: transitionMap
        };

        setOriginalDFA(dfa);

        // Minimizar
        try {
            const { minimized, steps: minSteps } = minimizeDFA(dfa);
            setMinimizedDFA(minimized);
            setSteps(minSteps);
            setShowResults(true);

            const reduction = ((dfa.states.length - minimized.states.length) / dfa.states.length * 100).toFixed(1);
            toast.success(
                `DFA minimizado exitosamente. Reducción: ${dfa.states.length} → ${minimized.states.length} estados (${reduction}%)`,
                { duration: 5000 }
            );
        } catch (error: any) {
            toast.error(`Error al minimizar: ${error.message}`);
        }
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Header />
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center gap-3">
                        <Minimize2 className="text-blue-400" size={32} />
                        <div>
                            <h1 className="text-3xl font-bold text-white">Minimización de AFD</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Construye un AFD y obten su forma minimizada equivalente
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
                {!showResults ? (
                    /* Constructor */
                    <DFABuilder onDFACreated={handleDFACreated} />
                ) : (
                    <>
                        {/* Comparación */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800">
                                <h3 className="text-lg font-semibold text-slate-400 mb-2">AFD Original</h3>
                                <p className="text-4xl font-bold text-white">{originalDFA?.states.length}</p>
                                <p className="text-slate-400 text-sm mt-1">estados</p>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 flex items-center justify-center">
                                <ArrowRight className="text-blue-400" size={48} />
                            </div>

                            <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/50">
                                <h3 className="text-lg font-semibold text-emerald-400 mb-2">AFD Minimizado</h3>
                                <p className="text-4xl font-bold text-white">{minimizedDFA?.states.length}</p>
                                <p className="text-emerald-400 text-sm mt-1">
                                    {originalDFA && minimizedDFA &&
                                        `Reducción: ${((1 - minimizedDFA.states.length / originalDFA.states.length) * 100).toFixed(1)}%`
                                    }
                                </p>
                            </div>
                        </motion.div>

                        {/* Pasos */}
                        <MinimizationSteps steps={steps} />

                        {/* DFA Original */}
                        {originalDFA && (
                            <>
                                <DFAVisualizer dfa={originalDFA} title="DFA Original" />
                                <DFAValidator dfa={originalDFA} title="Validador - DFA Original" />
                            </>
                        )}

                        {/* DFA Minimizado */}
                        {minimizedDFA && (
                            <>
                                <DFAVisualizer dfa={minimizedDFA} title="DFA Minimizado" />
                                <DFAValidator dfa={minimizedDFA} title="Validador - DFA Minimizado" />
                            </>
                        )}

                        {/* Botón para crear nuevo */}
                        <button
                            onClick={() => {
                                setOriginalDFA(null);
                                setMinimizedDFA(null);
                                setSteps([]);
                                setShowResults(false);
                            }}
                            className="w-full px-6 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
                        >
                            Crear Nuevo AFD
                        </button>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default DFAMinimizer;