import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function MonthlyBarChart({ expenses }) {
  const monthlyTotals = expenses.reduce((acc, e) => {
    const month = e.date.slice(0, 7)
    acc[month] = (acc[month] || 0) + parseFloat(e.amount)
    return acc
  }, {})

  const sorted = Object.keys(monthlyTotals).sort()
  const labels = sorted.map(m => {
    const [year, month] = m.split('-')
    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
  })
  const values = sorted.map(m => monthlyTotals[m].toFixed(2))

  const data = {
    labels,
    datasets: [{
      label: 'Spending ($)',
      data: values,
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }]
  }

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data yet
      </div>
    )
  }

  return <Bar data={data} options={options} />
}