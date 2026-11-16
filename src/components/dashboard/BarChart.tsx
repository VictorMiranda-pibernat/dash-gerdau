
import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts'

type DadoGrafico = Record<string, string | number | null | undefined>

type SerieGrafico = {
  dataKey: string
  nome: string
  cor: string
  tipo?: 'barra' | 'linha'
}

type ModoGrafico = 'combinada' | 'mensal' | 'acumulada'

type BarChartProps = {
  titulo: string
  descricao?: string
  dados?: DadoGrafico[]
  categoriaKey: string
  series?: SerieGrafico[]
  formatarValor?: (valor: number) => string
  altura?: number
}

const moedaBR = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })

const converterNumero = (valor: unknown): number | null => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor)
    return Number.isFinite(numero) ? numero : null
  }

  return null
}

function BarChart({
  titulo,
  descricao,
  dados,
  categoriaKey,
  series,
  formatarValor = moedaBR,
   altura = 320,
}: BarChartProps) {
  const [modo, setModo] = useState<ModoGrafico>('combinada')

  const formatarEixo = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(valor)

  const seriesValidas = Array.isArray(series)
    ? series.filter(
        (serie) =>
          typeof serie?.dataKey === 'string' &&
          serie.dataKey.trim() !== '',
      )
    : []

  const dadosValidos = Array.isArray(dados)
    ? dados.flatMap((registro) => {
        if (!registro || typeof registro !== 'object') return []

        const categoria = registro[categoriaKey]
        if (
          categoria === null ||
          categoria === undefined ||
          String(categoria).trim() === ''
        ) {
          return []
        }

        const valores: Record<string, string | number> = {
          [categoriaKey]: String(categoria),
        }

        let possuiValor = false

        seriesValidas.forEach((serie) => {
          const numero = converterNumero(registro[serie.dataKey])

          if (numero !== null) {
            valores[serie.dataKey] = numero
            possuiValor = true
          }
        })

        return possuiValor ? [valores] : []
      })
    : []

  const seriesVisiveis = seriesValidas.filter((serie) => {
    const tipo = serie.tipo ?? 'barra'

    if (modo === 'mensal') return tipo === 'linha'
    if (modo === 'acumulada') return tipo === 'barra'
    return true
  })

  const possuiDados = dadosValidos.length > 0 && seriesVisiveis.length > 0

  const estiloBotao = (ativo: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      ativo
        ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
        : 'text-slate-400 hover:bg-slate-700/70 hover:text-slate-200'
    }`

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">{titulo}</h2>
          {descricao && (
            <p className="mt-1 text-xs text-slate-400">{descricao}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-700 bg-slate-900/70 !p-2">
          <button
            type="button"
            onClick={() => setModo('combinada')}
            className={estiloBotao(modo === 'combinada')}
          >
            Combinada
          </button>
          <button
            type="button"
            onClick={() => setModo('mensal')}
            className={estiloBotao(modo === 'mensal')}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setModo('acumulada')}
            className={estiloBotao(modo === 'acumulada')}
          >
            Acumulada
          </button>
        </div>
      </div>

      <div className="w-full" style={{ height: altura }}>
        {possuiDados ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dadosValidos}
              margin={{ top: 30, right: 25, left: 10, bottom: 65 }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                stroke="#334155"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey={categoriaKey}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
              />

              <YAxis
                tickFormatter={formatarEixo}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />

              <Tooltip
                formatter={(valor) =>
                  formatarValor(Number(valor ?? 0))
                }
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#F1F5F9',
                }}
                labelStyle={{
                  color: '#CBD5E1',
                  marginBottom: 6,
                }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              />

              <Legend
                verticalAlign="top"
                height={35}
                wrapperStyle={{ color: '#CBD5E1', fontSize: '12px' }}
              />

              {seriesVisiveis.map((serie) => {
                const tipo = serie.tipo ?? 'barra'

                if (tipo === 'linha') {
                  return (
                    <Line
                      key={serie.dataKey}
                      type="monotone"
                      dataKey={serie.dataKey}
                      name={serie.nome}
                      stroke={serie.cor}
                      strokeWidth={3}
                      dot={{ r: 4, fill: serie.cor, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  )
                }

                return (
                  <Bar
                    key={serie.dataKey}
                    dataKey={serie.dataKey}
                    name={serie.nome}
                    fill={serie.cor}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={55}
                  >
                    <LabelList
                      dataKey={serie.dataKey}
                      position="top"
                      formatter={(valor) =>
                        formatarValor(Number(valor ?? 0))
                      }
                      fill="#E2E8F0"
                      fontSize={10}
                    />
                  </Bar>
                )
              })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Nenhum dado encontrado.
          </div>
        )}
      </div>
    </section>
  )
}

export default BarChart
