import React from 'react'

export interface PartnerDto {
  id: number
  remoteId: string
  name?: string | null
  fantasyName?: string | null
  document?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
  specialty?: string | null
}

export interface PartnersTableProps {
  items: PartnerDto[]
  page: number
  pageSize: number
  total: number
  onPageChange: (next: number) => void
}

export default function PartnersTable({ items, page, pageSize, total, onPageChange }: PartnersTableProps) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1)

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Fantasia</th>
              <th className="py-2 pr-4">Documento</th>
              <th className="py-2 pr-4">Cidade</th>
              <th className="py-2 pr-4">UF</th>
              <th className="py-2 pr-4">Especialidade</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2 pr-4">{p.name || '-'}</td>
                <td className="py-2 pr-4">{p.fantasyName || '-'}</td>
                <td className="py-2 pr-4">{p.document || '-'}</td>
                <td className="py-2 pr-4">{p.city || '-'}</td>
                <td className="py-2 pr-4">{p.state || '-'}</td>
                <td className="py-2 pr-4">{p.specialty || '-'}</td>
                <td className="py-2 pr-4">{p.email || '-'}</td>
                <td className="py-2 pr-4">{p.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          Página {page} de {totalPages} — {total} registros
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>Anterior</button>
          <button className="btn" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Próxima</button>
        </div>
      </div>
    </div>
  )
}