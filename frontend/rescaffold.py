import os

BASE_DIR = r"D:\Users\hp\Projects\MindMitra"

files = {
    "frontend/src/App.jsx": '''import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-brand-ivory overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
''',
    "frontend/src/components/Sidebar.jsx": '''import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, BrainCircuit, Calendar, Settings } from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Check-In', path: '/check-in', icon: CheckSquare },
    { name: 'Roadmap', path: '/roadmap', icon: Calendar },
    { name: 'Mitra AI', path: '/ai-companion', icon: BrainCircuit },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-brand-charcoal text-brand-ivory hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-display font-semibold tracking-wide text-brand-amber">MindMitra</h1>
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  lex items-center px-6 py-3 transition-colors 
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
''',
    "frontend/src/pages/Dashboard.jsx": '''import React from 'react'
import { Activity, Moon, Zap, Smile } from 'lucide-react'

const Dashboard = () => {
  const wellbeingScore = 78
  const confidenceLevel = "High"
  
  const metrics = [
    { title: 'Sleep Duration', value: '6h 45m', trend: '-15m', icon: Moon, color: 'text-brand-lavender' },
    { title: 'Energy Level', value: 'Moderate', trend: 'Stable', icon: Zap, color: 'text-brand-amber' },
    { title: 'Stress', value: 'Low', trend: '-10%', icon: Activity, color: 'text-brand-terracotta' },
    { title: 'Avg Mood', value: 'Good', trend: '+1', icon: Smile, color: 'text-emerald-500' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-charcoal mb-2">Today's Overview</h1>
          <p className="text-gray-600">Here's your personal wellness summary for today.</p>
        </div>
        <button className="bg-brand-terracotta hover:bg-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-sm">
          Quick Check-in
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-brand-beige flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-amber opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Wellbeing Status</h3>
            <p className="text-sm text-gray-500 mb-6">Based on recent check-ins</p>
          </div>
          <div className="flex items-baseline">
            <span className="text-5xl font-display font-bold text-brand-charcoal">{wellbeingScore}</span>
            <span className="text-xl text-gray-400 ml-1">/100</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">Data Reliability</span>
            <span className="text-sm font-medium text-brand-terracotta">{confidenceLevel}</span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-brand-beige">
          <h3 className="text-lg font-medium text-gray-700 mb-4 font-display">Today's Recommended Roadmap</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-16 text-sm font-medium text-gray-400 pt-1">Morning</div>
              <div className="flex-1 bg-brand-ivory rounded-lg p-3 border-l-4 border-brand-amber">
                <p className="font-medium text-brand-charcoal">5-Minute Box Breathing</p>
                <p className="text-sm text-gray-600 mt-1">Suggested because your recent stress signals are slightly elevated.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-16 text-sm font-medium text-gray-400 pt-1">Afternoon</div>
              <div className="flex-1 bg-brand-ivory rounded-lg p-3 border-l-4 border-brand-lavender">
                <p className="font-medium text-brand-charcoal">Screen Break & Walk</p>
                <p className="text-sm text-gray-600 mt-1">Suggested to balance long baseline screen time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-brand-beige flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={p-2 rounded-lg bg-opacity-10 bg-current }>
                <m.icon className={w-5 h-5 } />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{m.trend}</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-brand-charcoal">{m.value}</h4>
              <p className="text-sm text-gray-500 mt-1">{m.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
'''
}

for path, content in files.items():
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
