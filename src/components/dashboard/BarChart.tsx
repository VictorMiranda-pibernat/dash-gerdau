//Ele ficará responsável pela estrutura visual dos gráficos. 
// Assim, não precisaremos escrever um gráfico do zero em cada página.


import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts'

type DadoGrafico = Record<string, string | number>

type SerieGrafico = {
  dataKey: string
  nome: string
  cor: string
}

type BarChartProps = {
  titulo: string
  descricao?: string
  dados: DadoGrafico[]
  categoriaKey: string
  series: SerieGrafico[]
  formatarValor?: (valor: number) => string
}

const moedaBR = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })

function BarChart({
  titulo,
  descricao,
  dados,
  categoriaKey,
  series,
  formatarValor = moedaBR,
}: BarChartProps) {
  const formatarEixo = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(valor)

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10">
      <div className="mb-5">
        <h2 className="font-semibold text-white">{titulo}</h2>
        {descricao && (
          <p className="mt-1 text-xs text-slate-400">{descricao}</p>
        )}
      </div>

      <div className="h-[320px] w-full">
        {dados.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={dados}
              margin={{ top: 30, right: 15, left: 10, bottom: 35 }}
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
                formatter={(valor) => formatarValor(Number(valor ?? 0))}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#F1F5F9',
                }}
                labelStyle={{ color: '#CBD5E1', marginBottom: 6 }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              />

              <Legend
                verticalAlign="top"
                height={35}
                wrapperStyle={{ color: '#CBD5E1', fontSize: '12px' }}
              />

              {series.map((serie) => (
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
                    formatter={(valor) => formatarValor(Number(valor ?? 0))}
                    fill="#E2E8F0"
                    fontSize={10}
                  />
                </Bar>
              ))}
            </RechartsBarChart>
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
