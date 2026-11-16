
import type { ReactNode } from 'react'

type PageHeaderProps = {
  titulo: string
  descricao?: string
  identificacao?: string
  badge?: ReactNode
}

function PageHeader({
  titulo,
  descricao,
  identificacao = 'Gerdau | Drawback',
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
          {identificacao}
        </span>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          {titulo}
        </h1>

        {descricao && (
          <p className="mt-1 text-sm text-slate-400">
            {descricao}
          </p>
        )}
      </div>

      {badge && <div>{badge}</div>}
    </div>
  )
}

export default PageHeader
