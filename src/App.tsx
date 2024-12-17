import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Waiting from './Waiting'
import Vote from './Vote'
import CandidatePage from './pages/CandidatePage'
import { getCandidatesList } from './data/candidateData'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  const candidates = getCandidatesList();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Waiting />} />
          <Route path="/vote" element={<Vote candidates={candidates} />} />
          <Route path="/candidate/:id" element={<CandidatePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
