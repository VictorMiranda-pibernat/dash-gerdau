
import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import FilterField from '../components/dashboard/FilterField'
import { drawbackMock } from '../mocks/tables'

type LinhaVencimento = {
  id: string
  planta: string
  ac: string
  item: string
  modalidade: string
  situacao: string
  dataAbertura: string
  dataVencimento: string
  tempoVigencia: number
  diasVencimento: number
  tempoUso: number
}

const texto = (valor: unknown) => String(valor ?? '').trim()

const converterData = (valor: unknown) => {
  const data = texto(valor)
  if (!data) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) return data.slice(0, 10)
  const partes = data.split('/')
  if (partes.length === 3) return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`
  return ''
}

const formatarData = (valor: string) => {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}

const formatarNumero = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(valor)

const calcularDias = (inicio: string, fim: string) => {
  if (!inicio || !fim) return 0
  return Math.round((new Date(`${fim}T00:00:00`).getTime() - new Date(`${inicio}T00:00:00`).getTime()) / 86400000)
}

const hoje = () => {
  const data = new Date()
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

const dataAtual = hoje()

const dadosBase = drawbackMock.map((registro) => {
  const dataAbertura = converterData(registro.DATA_ABERTURA)
  const dataVencimento = converterData(registro.DATA_VENCIMENTO)
  const tempoVigencia = calcularDias(dataAbertura, dataVencimento)
  const diasVencimento = calcularDias(dataAtual, dataVencimento)
  const diasUtilizados = calcularDias(dataAbertura, dataAtual)

  return {
    id: `${texto(registro.NUMERO_DRAWBACK)}-${texto(registro.NRO_ITEM)}`,
    planta: texto(registro.CLIENTE_CIDADE) || texto(registro.CLIENTE) || 'Não identificada',
    ac: texto(registro.NUMERO_DRAWBACK),
    item: texto(registro.NRO_ITEM),
    modalidade: texto(registro.MODALIDADE) || 'Não informada',
    situacao: texto(registro.SITUACAO) || 'Não informada',
    dataAbertura,
    dataVencimento,
    tempoVigencia,
    diasVencimento,
    tempoUso: tempoVigencia > 0 ? (diasUtilizados / tempoVigencia) * 100 : 0,
  }
}).filter((d) => d.ac && d.dataAbertura && d.dataVencimento && d.tempoVigencia > 0)

const estiloSelect = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'
const estiloCard = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10'
const estiloTh = 'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'
const estiloTd = 'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'

function ControleVencimentos() {
  const [planta, setPlanta] = useState('Todas')
  const [ac, setAc] = useState('Todos')
  const [item, setItem] = useState('Todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const dadosVigentes = useMemo(() => dadosBase.filter((d) => {
    const situacao = d.situacao.toUpperCase()
    const situacaoEncerrada = ['ENCERRADO', 'CANCELADO', 'BAIXADO', 'INATIVO', 'EXPIRADO'].some((termo) => situacao.includes(termo))
    return d.dataAbertura <= dataAtual && d.dataVencimento >= dataAtual && !situacaoEncerrada
  }), [])

  const opcoesPlanta = [...new Set(dadosVigentes.map((d) => d.planta))].sort()
  const opcoesAC = [...new Set(dadosVigentes.map((d) => d.ac))].sort()
  const opcoesItem = [...new Set(dadosVigentes.map((d) => d.item))].sort()

  const dadosFiltrados = useMemo(() => dadosVigentes.filter((d) =>
    (planta === 'Todas' || d.planta === planta) &&
    (ac === 'Todos' || d.ac === ac) &&
    (item === 'Todos' || d.item === item) &&
    (!dataInicio || d.dataAbertura >= dataInicio) &&
    (!dataFim || d.dataAbertura <= dataFim)
  ), [planta, ac, item, dataInicio, dataFim, dadosVigentes])

  const atosUnicos = useMemo(() => {
    const mapa = new Map<string, LinhaVencimento>()
    dadosFiltrados.forEach((d) => {
      if (!mapa.has(d.ac)) mapa.set(d.ac, d)
    })
    return [...mapa.values()]
  }, [dadosFiltrados])

  const mediaTempoUso = atosUnicos.length
    ? atosUnicos.reduce((total, d) => total + d.tempoUso, 0) / atosUnicos.length
    : 0

  const limparFiltros = () => {
    setPlanta('Todas')
    setAc('Todos')
    setItem('Todos')
    setDataInicio('')
    setDataFim('')
  }

  return (
    <div className="flex min-h-screen flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      <PageHeader
        titulo="Controle de Vencimentos"
        descricao="Acompanhamento da vigência e do tempo de utilização dos Atos Concessórios."
        badge={
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            Dados demonstrativos
          </span>
        }
      />

      <section className={estiloCard}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Filtros de consulta</h2>
            <p className="mt-1 text-xs text-slate-400">Por padrão, são exibidos somente os atos considerados vigentes.</p>
          </div>
          <button onClick={limparFiltros} className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FilterField label="Planta">
            <select className={estiloSelect} value={planta} onChange={(e) => setPlanta(e.target.value)}>
              <option value="Todas">Todas</option>
              {opcoesPlanta.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FilterField>

          <FilterField label="Número do AC">
            <select className={estiloSelect} value={ac} onChange={(e) => setAc(e.target.value)}>
              <option value="Todos">Todos</option>
              {opcoesAC.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </FilterField>

          <FilterField label="Item">
            <select className={estiloSelect} value={item} onChange={(e) => setItem(e.target.value)}>
              <option value="Todos">Todos</option>
              {opcoesItem.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </FilterField>

          <FilterField label="Data de abertura inicial">
            <input type="date" className={estiloSelect} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </FilterField>

          <FilterField label="Data de abertura final">
            <input type="date" className={estiloSelect} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </FilterField>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className={estiloCard}>
          <p className="text-sm text-slate-400">Total de Atos Concessórios vigentes</p>
          <p className="mt-3 text-3xl font-bold text-white">{formatarNumero(atosUnicos.length)}</p>
          <p className="mt-2 text-xs text-slate-500">Atos distintos conforme os filtros aplicados</p>
        </div>

        <div className={estiloCard}>
          <p className="text-sm text-slate-400">Média do tempo de uso dos atos</p>
          <p className="mt-3 text-3xl font-bold text-blue-400">{mediaTempoUso.toFixed(2).replace('.', ',')}%</p>
          <p className="mt-2 text-xs text-slate-500">Média percentual por Ato Concessório</p>
        </div>
      </section>

      <section className={estiloCard}>
        <div className="mb-5">
          <h2 className="font-semibold text-white">Controle de Vencimento por Ato Concessório</h2>
          <p className="mt-1 text-xs text-slate-400">Tempo de vigência, dias restantes e percentual de utilização do prazo.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/70">
          <table className="w-full min-w-[1250px] border-collapse">
            <thead>
              <tr>
                <th className={estiloTh}>Planta</th>
                <th className={estiloTh}>Nº AC</th>
                <th className={estiloTh}>Item</th>
                <th className={estiloTh}>Tipo</th>
                <th className={estiloTh}>Modalidade</th>
                <th className={estiloTh}>Situação</th>
                <th className={estiloTh}>Data Abertura</th>
                <th className={estiloTh}>Data Vencimento</th>
                <th className={estiloTh}>Tempo de Vigência (Dias)</th>
                <th className={estiloTh}>Dias para Vencimento</th>
                <th className={estiloTh}>Tempo de Uso %</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((d) => (
                <tr key={d.id} className="transition hover:bg-slate-700/20">
                  <td className={estiloTd}>{d.planta}</td>
                  <td className={`${estiloTd} font-semibold text-white`}>{d.ac}</td>
                  <td className={estiloTd}>{d.item}</td>
                  <td className={estiloTd}><span className="text-amber-400">A validar</span></td>
                  <td className={estiloTd}>{d.modalidade}</td>
                  <td className={estiloTd}>{d.situacao}</td>
                  <td className={estiloTd}>{formatarData(d.dataAbertura)}</td>
                  <td className={estiloTd}>{formatarData(d.dataVencimento)}</td>
                  <td className={estiloTd}>{formatarNumero(d.tempoVigencia)}</td>
                  <td className={estiloTd}>
                    <span className={d.diasVencimento <= 30 ? 'font-semibold text-amber-400' : 'text-slate-300'}>
                      {formatarNumero(d.diasVencimento)}
                    </span>
                  </td>
                  <td className={estiloTd}>
                    <div className="flex min-w-[130px] items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(Math.max(d.tempoUso, 0), 100)}%` }} />
                      </div>
                      <span className="font-semibold tabular-nums text-white">{d.tempoUso.toFixed(2).replace('.', ',')}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {dadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-500">
                    Nenhum Ato Concessório vigente encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Tipo AC não está disponível na base atual. A vigência está sendo considerada provisoriamente pelas datas de abertura e vencimento, com exclusão de situações encerradas.
        </p>
      </section>
    </div>
  )
}

export default ControleVencimentos
