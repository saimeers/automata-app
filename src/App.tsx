import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import StringValidation from './pages/StringValidation'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/string-validation" element={<StringValidation />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App