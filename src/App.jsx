import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expenses  from './pages/Expenses'
import Savings   from './pages/Savings'            // ← add this line
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={!session ? <Login />     : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session  ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/expenses"  element={session  ? <Expenses />  : <Navigate to="/" />} />
        <Route path="/savings"   element={session  ? <Savings />   : <Navigate to="/" />} />  {/* ← add this line */}
      </Routes>
    </BrowserRouter>
  )
}