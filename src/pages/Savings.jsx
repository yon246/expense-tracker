import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function Savings() {
  const [goals, setGoals]         = useState([])
  const [deposits, setDeposits]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [user, setUser]           = useState(null)

  const [goalName, setGoalName]         = useState('')
  const [goalTarget, setGoalTarget]     = useState('')
  const [goalError, setGoalError]       = useState(null)
  const [goalLoading, setGoalLoading]   = useState(false)

  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote]     = useState('')
  const [depositGoal, setDepositGoal]     = useState('')
  const [depositError, setDepositError]   = useState(null)
  const [depositLoading, setDepositLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: goalsData } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: true })

    const { data: depositsData } = await supabase
      .from('savings_deposits')
      .select('*')

    setGoals(goalsData || [])
    setDeposits(depositsData || [])
    if (goalsData && goalsData.length > 0) {
      setDepositGoal(goalsData[0].id)
    }
    setLoading(false)
  }

  async function handleAddGoal(e) {
    e.preventDefault()
    if (parseFloat(goalTarget) <= 0) {
      setGoalError('Target must be greater than zero')
      return
    }
    setGoalLoading(true)
    setGoalError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('savings_goals')
      .insert({
        user_id:       user.id,
        name:          goalName,
        target_amount: parseFloat(goalTarget),
      })
    if (error) {
      setGoalError(error.message)
    } else {
      setGoalName('')
      setGoalTarget('')
      fetchAll()
    }
    setGoalLoading(false)
  }

  async function handleDeposit(e) {
    e.preventDefault()
    if (parseFloat(depositAmount) <= 0) {
      setDepositError('Amount must be greater than zero')
      return
    }
    if (!depositGoal) {
      setDepositError('Please select a goal first')
      return
    }
    setDepositLoading(true)
    setDepositError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('savings_deposits')
      .insert({
        user_id: user.id,
        goal_id: depositGoal,
        amount:  parseFloat(depositAmount),
        note:    depositNote,
      })
    if (error) {
      setDepositError(error.message)
    } else {
      setDepositAmount('')
      setDepositNote('')
      fetchAll()
    }
    setDepositLoading(false)
  }

  async function handleDeleteGoal(id) {
    const confirmed = window.confirm('Delete this goal and all its deposits?')
    if (!confirmed) return
    await supabase.from('savings_goals').delete().eq('id', id)
    fetchAll()
  }

  function savedAmountForGoal(goalId) {
    return deposits
      .filter(d => d.goal_id === goalId)
      .reduce((sum, d) => sum + parseFloat(d.amount), 0)
  }

  const totalSaved = deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800">Expense Tracker</h1>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
            Dashboard
          </Link>
          <Link to="/savings" className="text-sm text-blue-600 font-medium">
            Savings
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-500 mb-1">Total saved across all goals</p>
          <p className="text-3xl font-bold text-green-600">${totalSaved.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <form onSubmit={handleAddGoal} className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">New savings goal</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal name</label>
              <input
                type="text"
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="e.g. Holiday trip"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={goalTarget}
                onChange={e => setGoalTarget(e.target.value)}
                placeholder="0.00"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {goalError && (
              <p className="text-red-500 text-sm mb-3">{goalError}</p>
            )}
            <button
              type="submit"
              disabled={goalLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {goalLoading ? 'Saving...' : 'Create goal'}
            </button>
          </form>

          <form onSubmit={handleDeposit} className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Add deposit</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <select
                value={depositGoal}
                onChange={e => setDepositGoal(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <input
                type="text"
                value={depositNote}
                onChange={e => setDepositNote(e.target.value)}
                placeholder="e.g. Monthly contribution"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {depositError && (
              <p className="text-red-500 text-sm mb-3">{depositError}</p>
            )}
            <button
              type="submit"
              disabled={depositLoading || goals.length === 0}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {depositLoading ? 'Saving...' : 'Add deposit'}
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No savings goals yet. Create your first one above!
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const saved    = savedAmountForGoal(goal.id)
              const target   = parseFloat(goal.target_amount)
              const percent  = Math.min((saved / target) * 100, 100)
              const reached  = saved >= target

              return (
                <div key={goal.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{goal.name}</p>
                      <p className="text-sm text-gray-500">
                        ${saved.toFixed(2)} saved of ${target.toFixed(2)} goal
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {reached && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Goal reached!
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {percent.toFixed(0)}%
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}