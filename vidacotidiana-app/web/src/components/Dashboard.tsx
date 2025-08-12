import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface StatItem { state?: string | null; _count: { _all: number } }
interface SpecialtyItem { specialty?: string | null; _count: { _all: number } }

export default function Dashboard() {
  const [stats, setStats] = useState<{ total: number; byState: StatItem[]; bySpecialty: SpecialtyItem[] } | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)

  async function loadStats() {
    const { data } = await api.get('/partners/stats')
    setStats(data)
  }

  async function doSync() {
    setSyncLoading(true)
    try {
      await api.post('/partners/sync')
      await loadStats()
      alert('Sincronização concluída!')
    } catch (e: any) {
      alert('Erro na sincronização: ' + (e?.message || ''))
    } finally {
      setSyncLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const stateChart = useMemo(() => {
    const labels = (stats?.byState || []).map(s => s.state || '—')
    const values = (stats?.byState || []).map(s => s._count._all)
    return {
      labels,
      datasets: [{ label: 'Parceiros por UF', data: values, backgroundColor: 'rgba(59,130,246,0.6)' }],
    }
  }, [stats])

  const specialtyChart = useMemo(() => {
    const top = (stats?.bySpecialty || []).slice(0, 10)
    const labels = top.map(s => s.specialty || '—')
    const values = top.map(s => s._count._all)
    return {
      labels,
      datasets: [{ label: 'Top 10 Especialidades', data: values, backgroundColor: 'rgba(34,197,94,0.6)' }],
    }
  }, [stats])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <div className="text-sm text-gray-500">Total de Parceiros</div>
        <div className="text-3xl font-semibold">{stats?.total ?? '—'}</div>
        <div className="mt-4">
          <button className="btn" onClick={doSync} disabled={syncLoading}>{syncLoading ? 'Sincronizando...' : 'Sincronizar agora'}</button>
        </div>
      </div>
      <div className="card md:col-span-2">
        <Bar data={stateChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="card md:col-span-3">
        <Bar data={specialtyChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  )
}