import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ConfigPanel from '../components/string-validation/ConfigPanel';
import AutomatonFlow from '../components/string-validation/AutomatonFlow';
import ValidationPanel from '../components/string-validation/ValidationPanel';
import StepsPanel from '../components/string-validation/StepsPanel';
import { useAutomaton } from '../hooks/useAutomaton';
import { AutomatonParser } from '../utils/automatonParser';
import type { ValidationResult } from '../types/automaton';
import { useNavigate } from 'react-router-dom';

const StringValidation = () => {
  const navigate = useNavigate(); 
  const [alphabet, setAlphabet] = useState('a,b');
  const [rules, setRules] = useState('q0,a,q1\nq1,b,q2\nq2,a,q0\nq0,b,q0\nq1,a,q1\nq2,b,q2');
  const [initialState, setInitialState] = useState('q0');
  const [finalStates, setFinalStates] = useState('q2');
  const [inputString, setInputString] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { automaton, loadAutomaton, validateString } = useAutomaton();

  const handleGenerateAutomaton = () => {
    try {
      const parsedAutomaton = AutomatonParser.parseFromRules(
        alphabet,
        rules,
        initialState,
        finalStates
      );

      const errors = AutomatonParser.validateAutomaton(parsedAutomaton);
      if (errors.length > 0) {
        alert('Errores en el autómata:\n' + errors.join('\n'));
        return;
      }

      loadAutomaton(parsedAutomaton);
      setValidationResult(null);
      setCurrentStep(0);
    } catch (error) {
      alert('Error al parsear el autómata');
      console.error(error);
    }
  };

  const handleValidate = () => {
    if (!automaton || !inputString) return;

    const result = validateString(inputString);
    setValidationResult(result);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (!validationResult) return;
    if (currentStep < validationResult.steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-6 pt-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </button>
      </div>

      {/* Page Title */}
      <section className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Verificación de Cadenas</h1>
              <p className="text-slate-400">Define un AFD y valida cadenas paso a paso</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <ConfigPanel
              alphabet={alphabet}
              setAlphabet={setAlphabet}
              rules={rules}
              setRules={setRules}
              initialState={initialState}
              setInitialState={setInitialState}
              finalStates={finalStates}
              setFinalStates={setFinalStates}
              onGenerate={handleGenerateAutomaton}
            />

            {automaton && (
              <ValidationPanel
                inputString={inputString}
                setInputString={setInputString}
                onValidate={handleValidate}
                validationResult={validationResult}
              />
            )}
          </div>

          {/* Center Panel - Visualization */}
          <div className="lg:col-span-8 space-y-6">
            <AutomatonFlow
              automaton={automaton}
              currentStep={currentStep}
              validationResult={validationResult}
            />

            {validationResult && (
              <StepsPanel
                validationResult={validationResult}
                currentStep={currentStep}
                isPlaying={isPlaying}
                onStepForward={handleStepForward}
                onStepBackward={handleStepBackward}
                onReset={handleReset}
                onPlayPause={handlePlayPause}
              />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StringValidation;