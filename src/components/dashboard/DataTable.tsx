
import type { DataTableColumn } from '../../types/dashboard'

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  mensagemVazia?: string
  alturaMaxima?: string
}

const alinhamentos = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

function DataTable<T>({ columns, data, rowKey, mensagemVazia = 'Nenhum registro encontrado.', alturaMaxima = '420px' }: DataTableProps<T>) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-700/80" style={{ maxHeight: alturaMaxima }}>
      <table className="w-full min-w-max border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-slate-900">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className={`whitespace-nowrap border-b border-slate-700 px-5 py-4 font-semibold text-slate-300 ${alinhamentos[column.align ?? 'left']}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-700/60 transition hover:bg-slate-700/30">
                {columns.map((column) => {
                  const valor = row[column.key]
                  return (
                    <td key={String(column.key)} className={`whitespace-nowrap px-5 py-3 text-slate-300 ${alinhamentos[column.align ?? 'left']}`}>
                      {column.render ? column.render(valor, row) : String(valor ?? '—')}
                    </td>
                  )
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">
                {mensagemVazia}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
