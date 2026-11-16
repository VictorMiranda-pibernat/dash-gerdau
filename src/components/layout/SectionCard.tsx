// O SectionCard será especialmente
//  importante: ele padroniza fundo, borda, arredondamento, 
//  sombra e espaçamento interno.
import type { ReactNode } from 'react'

type SectionCardProps = {
  titulo?: string
  descricao?: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}

function SectionCard({
  titulo,
  descricao,
  acao,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <section
className={`rounded-2xl border border-slate-700/80 bg-slate-800/70 !px-8 py-6 shadow-lg shadow-black/10 sm:!px-9 ${className}`}    >
      {(titulo || descricao || acao) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            {titulo && (
              <h2 className="font-semibold text-white">
                {titulo}
              </h2>
            )}

            {descricao && (
              <p className="mt-1 text-xs text-slate-400">
                {descricao}
              </p>
            )}
          </div>

          {acao && <div>{acao}</div>}
        </div>
      )}

      {children}
    </section>
  )
}

export default SectionCard
