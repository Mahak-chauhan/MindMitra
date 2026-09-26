import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import MoodDiary from './pages/MoodDiary'
import DigitalWellbeing from './pages/DigitalWellbeing'
import Activities from './pages/Activities'
import Roadmap from './pages/Roadmap'
import AICompanion from './pages/AICompanion'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, AuthContext } from './context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark-950 text-zinc-100 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
          <span className="font-bold text-zinc-950">M</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Loading MindMitra...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-dark-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/diary" element={<MoodDiary />} />
            <Route path="/wellbeing" element={<DigitalWellbeing />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/ai-companion" element={<AICompanion />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  )
}

export default App

