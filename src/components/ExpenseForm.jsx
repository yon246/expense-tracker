import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ExpenseForm({ onExpenseAdded }) {
  const [amount, setAmount]           = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState('Food')
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero')
      return
    }
    if (parseFloat(amount) > 1000000) {
      setError('Amount seems too large — please check')
      return
    }
    if (description.length > 200) {
      setError('Description must be under 200 characters')
      return
    }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id:      user.id,
        amount:       parseFloat(amount),
        description,
        category,
        date,
        is_recurring: isRecurring,
      })

    if (error) {
      setError(error.message)
    } else {
      setAmount('')
      setDescription('')
      setCategory('Food')
      setIsRecurring(false)
      onExpenseAdded()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Add expense</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Health</option>
          <option>Rent</option>
          <option>Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Lunch at hawker centre"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={e => setIsRecurring(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor="recurring" className="text-sm text-gray-700">
          This is a recurring monthly expense (e.g. rent, subscriptions)
        </label>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add expense'}
      </button>
    </form>
  )
}