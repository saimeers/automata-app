import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import StringValidation from './pages/StringValidation'
import PDASimulator from './pages/PDASimulator'
import "./types/minimizacion.ts";
import DFAMinimizer from './pages/DFAMinimizer.tsx';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/string-validation" element={<StringValidation />} />
        <Route path="/pda" element={<PDASimulator />} />
        <Route path="/minimizacion" element={<DFAMinimizer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App