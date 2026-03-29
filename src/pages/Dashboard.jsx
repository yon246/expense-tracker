import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import CategoryPieChart from '../components/CategoryPieChart'
import MonthlyBarChart from '../components/MonthlyBarChart'

export default function Dashboard() {
  const [expenses, setExpenses]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [user, setUser]             = useState(null)
  const [totalSaved, setTotalSaved] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchExpenses()
    fetchSavings()
  }, [])

  async function fetchExpenses() {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  async function fetchSavings() {
    const { data } = await supabase
      .from('savings_deposits')
      .select('amount')
    const total = (data || []).reduce((sum, d) => sum + parseFloat(d.amount), 0)
    setTotalSaved(total)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const thisMonth = expenses.filter(e =>
    e.date.slice(0, 7) === new Date().toISOString().slice(0, 7)
  )
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other'
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount)
    return acc
  }, {})
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800">Expense Tracker</h1>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-blue-600 font-medium">
            Dashboard
          </Link>
          <Link to="/savings" className="text-sm text-gray-500 hover:text-gray-800">
            Savings
          </Link>
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">All time spent</p>
            <p className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">This month</p>
            <p className="text-2xl font-bold text-gray-800">${thisMonthTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Top category</p>
            <p className="text-2xl font-bold text-gray-800">
              {topCategory ? topCategory[0] : '—'}
            </p>
          </div>
          <Link to="/savings" className="bg-green-50 border border-green-200 rounded-xl p-5 hover:bg-green-100">
            <p className="text-sm text-green-600 mb-1">Total saved</p>
            <p className="text-2xl font-bold text-green-700">${totalSaved.toFixed(2)}</p>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Spending by category</p>
            <CategoryPieChart expenses={expenses} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Monthly spending</p>
            <MonthlyBarChart expenses={expenses} />
          </div>
        </div>

        <ExpenseForm onExpenseAdded={fetchExpenses} />

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : (
          <ExpenseList expenses={expenses} onDelete={fetchExpenses} />
        )}

      </div>
    </div>
  )
}