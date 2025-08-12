import React, { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Filters from './components/Filters'
import PartnersTable, { PartnerDto } from './components/PartnersTable'
import { api } from './api/client'

export default function App() {
  const [q, setQ] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('')

  const [items, setItems] = useState<PartnerDto[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)

  async function fetchPartners(nextPage = page) {
    const params: any = { page: nextPage, pageSize, sort: 'name:asc' }
    if (q) params.q = q
    if (state) params.state = state
    if (city) params.city = city
    if (specialty) params.specialty = specialty

    const { data } = await api.get('/partners', { params })
    setItems(data.items)
    setTotal(data.total)
    setPage(data.page)
  }

  useEffect(() => { fetchPartners(1) }, [])

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Vida Cotidiana - Dashboard de Parceiros</h1>
      <Dashboard />
      <Filters
        q={q}
        state={state}
        city={city}
        specialty={specialty}
        onChange={(next) => {
          if (next.q !== undefined) setQ(next.q)
          if (next.state !== undefined) setState(next.state)
          if (next.city !== undefined) setCity(next.city)
          if (next.specialty !== undefined) setSpecialty(next.specialty)
        }}
        onSearch={() => fetchPartners(1)}
      />
      <PartnersTable items={items} page={page} pageSize={pageSize} total={total} onPageChange={(p) => fetchPartners(p)} />
    </div>
  )
}