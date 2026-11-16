
import type { KpiVariant } from '../../types/dashboard'

type KpiCardProps = {
    titulo: string
    valor: string
    descricao?: string
    variante: KpiVariant
}

const variantes = {
    blue: {
        borda: 'border-l-blue-500',
        valor: 'text-blue-400',
    },
    green: {
        borda: 'border-l-emerald-500',
        valor: 'text-emerald-400',
    },
    amber: {
        borda: 'border-l-amber-500',
        valor: 'text-amber-400',
    },
    red: {
        borda: 'border-l-red-500',
        valor: 'text-red-400',
    },
}

function KpiCard({
    titulo,
    valor,
    descricao,
    variante,
}: KpiCardProps) {
    const estilo = variantes[variante]

    return (
        <div
className={`rounded-2xl border border-slate-700/80 border-l-4 ${estilo.borda} bg-slate-800/70 !px-8 py-6 shadow-lg shadow-black/10`}        >
            <p className="text-sm font-medium text-slate-400">
                {titulo}
            </p>

            <p className={`mt-2 text-2xl font-bold tracking-tight ${estilo.valor}`}>
                {valor}
            </p>

            {descricao && (
                <p className="mt-2 text-xs text-slate-500">
                    {descricao}
                </p>
            )}
        </div>
    )
}

export default KpiCard
