import { supabase } from '../supabaseClient'

export default function ExpenseList({ expenses, onDelete }) {

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this expense? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('expenses').delete().eq('id', id)
    onDelete()
  }

  function exportToCSV() {
    if (expenses.length === 0) {
      alert('No expenses to export yet.')
      return
    }

    const headers = ['Date', 'Description', 'Category', 'Amount']

    const rows = expenses.map(e => [
      e.date,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.category || 'Other',
      parseFloat(e.amount).toFixed(2)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const categoryColors = {
    Food:          'bg-orange-100 text-orange-700',
    Transport:     'bg-blue-100 text-blue-700',
    Shopping:      'bg-pink-100 text-pink-700',
    Entertainment: 'bg-purple-100 text-purple-700',
    Health:        'bg-green-100 text-green-700',
    Rent:          'bg-red-100 text-red-700',
    Other:         'bg-gray-100 text-gray-700',
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No expenses yet. Add your first one above!
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-gray-700">{expenses.length} expenses</p>
        <button
          onClick={exportToCSV}
          className="text-sm bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50"
        >
          Export to CSV
        </button>
      </div>

      <div className="space-y-3">
        {expenses.map(expense => (
          <div
            key={expense.id}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  {expense.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[expense.category] || categoryColors['Other']}`}>
                    {expense.category || 'Other'}
                  </span>
                  {expense.is_recurring && (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
      Monthly
    </span>
  )}
                  <span className="text-xs text-gray-400">{expense.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-800">${parseFloat(expense.amount).toFixed(2)}</span>
              <button
                onClick={() => handleDelete(expense.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}