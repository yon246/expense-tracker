import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = [
  '#3b82f6', '#f97316', '#ec4899',
  '#8b5cf6', '#22c55e', '#ef4444', '#6b7280'
]

export default function CategoryPieChart({ expenses }) {
  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other'
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount)
    return acc
  }, {})

  const labels = Object.keys(categoryTotals)
  const values = Object.values(categoryTotals)

  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: COLORS.slice(0, labels.length),
      borderWidth: 0,
    }]
  }

  const options = {
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet
      </div>
    )
  }

  return <Pie data={data} options={options} />
}