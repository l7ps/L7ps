import React from 'react'

export interface FiltersProps {
  q: string
  state: string
  city: string
  specialty: string
  onChange: (next: Partial<FiltersProps>) => void
  onSearch: () => void
}

export default function Filters(props: FiltersProps) {
  const { q, state, city, specialty, onChange, onSearch } = props
  return (
    <div className="card grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <div className="label">Busca</div>
        <input className="input" placeholder="nome, documento, email..." value={q} onChange={e => onChange({ q: e.target.value })} />
      </div>
      <div>
        <div className="label">UF</div>
        <input className="input" placeholder="SP" value={state} onChange={e => onChange({ state: e.target.value.toUpperCase() })} />
      </div>
      <div>
        <div className="label">Cidade</div>
        <input className="input" placeholder="São Paulo" value={city} onChange={e => onChange({ city: e.target.value })} />
      </div>
      <div>
        <div className="label">Especialidade</div>
        <input className="input" placeholder="Clínica Geral" value={specialty} onChange={e => onChange({ specialty: e.target.value })} />
      </div>
      <div className="md:col-span-4 text-right">
        <button className="btn" onClick={onSearch}>Buscar</button>
      </div>
    </div>
  )
}