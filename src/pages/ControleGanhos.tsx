
import { useMemo, useState } from 'react'
import { moeda, dataBR } from '../utils/formatters'
import PageHeader from '../components/layout/PageHeader'
import KpiCard from '../components/dashboard/KpiCard'
import DataTable from '../components/dashboard/DataTable'
import type { DataTableColumn } from '../types/dashboard'
import FilterField from '../components/dashboard/FilterField'
import BarChart from '../components/dashboard/BarChart'
import { drawbackMock, drawbackImpMock, drawbackNfMock, drawbackProcImpMock, drawbackResumoImpMock } from '../mocks/tables'

type LinhaGanho = {
  id: string
  planta: string
  ac: string
  item: string
  insumo: string
  ncm: string
  unidade: string
  origem: string
  processo: string
  data: string
  ii: number | null
  ipi: number
  pis: number
  cofins: number
  afrmm: number
  icms: number | null
  saving: number | null
  cash: number
  quantidadeRealizada: number
  quantidadeAprovada: number
  valorAprovado: number
  savingEstimado: number | null
  cashEstimado: number | null
  icmsEstimado: number | null
}

type CampoGanho = 'saving' | 'cash' | 'icms' | 'savingEstimado' | 'cashEstimado' | 'icmsEstimado'

const estimarGanho = (realizado: number | null, quantidadeRealizada: number, quantidadeAprovada: number): number | null => {
  if (realizado === null || quantidadeRealizada <= 0 || quantidadeAprovada <= 0) return null
  return (realizado / quantidadeRealizada) * quantidadeAprovada
}

// Soma somente valores disponíveis, preservando null quando não há informação.
const somarCampo = (registros: LinhaGanho[], campo: CampoGanho): number | null => {
  const valores = registros.map((d) => d[campo]).filter((valor): valor is number => valor !== null)
  return valores.length ? valores.reduce((total, valor) => total + valor, 0) : null
}

const criarDadosResumo = (realizado: number | null, estimado: number | null) => {
  if (realizado === null && estimado === null) return []
  return [{ categoria: 'Total', realizado: realizado ?? 0, estimado: estimado ?? 0 }]
}

const colunasGanhos: DataTableColumn<LinhaGanho>[] = [
  { key: 'planta', label: 'Planta' },
  { key: 'ac', label: 'Nº AC', render: (v) => <span className="font-medium text-white">{String(v ?? '—')}</span> },
  { key: 'item', label: 'Item' },
  { key: 'insumo', label: 'Insumo' },
  { key: 'ncm', label: 'NCM' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'origem', label: 'Origem' },
  { key: 'ii', label: 'II', render: (v) => moeda(v as number | null) },
  { key: 'ipi', label: 'IPI', render: (v) => moeda(v as number | null) },
  { key: 'pis', label: 'PIS', render: (v) => moeda(v as number | null) },
  { key: 'cofins', label: 'COFINS', render: (v) => moeda(v as number | null) },
  { key: 'afrmm', label: 'AFRMM', render: (v) => moeda(v as number | null) },
  { key: 'icms', label: 'ICMS', render: (v) => moeda(v as number | null) },
  { key: 'saving', label: 'Saving', render: (v) => <span className="font-semibold text-blue-400">{moeda(v as number | null)}</span> },
  { key: 'cash', label: 'Cash', render: (v) => <span className="font-semibold text-emerald-400">{moeda(v as number | null)}</span> },
]

const dadosMock: LinhaGanho[] = [
  ...drawbackImpMock.map((imp): LinhaGanho => {
    const ato = drawbackMock.find((item) => item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK && item.NRO_ITEM === imp.NRO_ITEM)
    const resumo = drawbackResumoImpMock.find((item) => item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK && item.NRO_ITEM_IMP === imp.NRO_ITEM)
    const processo = drawbackProcImpMock.find((item) => item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK && item.NRO_ITEM === imp.NRO_ITEM)

    const ii = Number(imp.VALOR_DEVIDO_II ?? 0)
    const afrmm = Number(imp.VALOR_FRETE_RS ?? 0) * Number(imp.AFRMM_ALIQUOTA ?? 0)
    const ipi = Number(imp.VALOR_DEVIDO_IPI ?? 0)
    const pis = Number(imp.VALOR_DEVIDO_PIS ?? 0)
    const cofins = Number(imp.VALOR_DEVIDO_COFINS ?? 0)
    const saving = ii + afrmm
    const cash = ipi + pis + cofins
    const quantidadeRealizada = Number(imp.ADICAO_QTD_ESTATISTICA ?? 0)
    const quantidadeAprovada = Number(ato?.QUANTIDADE ?? 0)
    const valorAprovado = Number(ato?.VALOR ?? 0)

    return {
      id: `IMP-${String(imp.NUMERO_DRAWBACK)}-${String(imp.NRO_ITEM)}`,
      planta: String(ato?.CLIENTE_CIDADE ?? imp.CLIENTE ?? 'Não identificada'),
      ac: String(imp.NUMERO_DRAWBACK ?? ''),
      item: String(imp.NRO_ITEM ?? ''),
      insumo: String(imp.NOME_COMERCIAL ?? 'Insumo não identificado'),
      ncm: String(imp.NCM_CODIGO ?? ''),
      unidade: String(ato?.UNID_ESTAT ?? '—'),
      origem: 'Importação',
      processo: String(resumo?.NRO_DECLARACAO ?? processo?.PROCESSO_PO ?? 'Não informado'),
      data: String(resumo?.DATA_DESEMBARACO ?? imp.DATA_DESEMBARACO ?? ''),
      ii, ipi, pis, cofins, afrmm, icms: null, saving, cash,
      quantidadeRealizada, quantidadeAprovada, valorAprovado,
      savingEstimado: estimarGanho(saving, quantidadeRealizada, quantidadeAprovada),
      cashEstimado: estimarGanho(cash, quantidadeRealizada, quantidadeAprovada),
      icmsEstimado: null,
    }
  }),
  ...drawbackNfMock.map((nf): LinhaGanho => {
    const ato = drawbackMock.find((item) => item.NUMERO_DRAWBACK === nf.NUMERO_DRAWBACK && item.NRO_ITEM === nf.NRO_ITEM)
    const ipi = Number(nf.IPI_VIPI ?? 0)
    const pis = Number(nf.PIS_VPIS ?? 0)
    const cofins = Number(nf.COFINS_VCOFINS ?? 0)
    const icms = Number(nf.ICMS_VICMS ?? 0)
    const cash = ipi + pis + cofins
    const quantidadeRealizada = Number(nf.QUANTIDADE_ESTATISTICA ?? 0)
    const quantidadeAprovada = Number(ato?.QUANTIDADE ?? 0)
    const valorAprovado = Number(ato?.VALOR ?? 0)

    return {
      id: `NF-${String(nf.NUMERO_DRAWBACK)}-${String(nf.NUMERO_NF)}`,
      planta: String(ato?.CLIENTE_CIDADE ?? nf.CLIENTE ?? 'Não identificada'),
      ac: String(nf.NUMERO_DRAWBACK ?? ''),
      item: String(nf.NRO_ITEM ?? ''),
      insumo: String(nf.DESCRICAO ?? 'Insumo não identificado'),
      ncm: String(nf.NRO_NCM ?? ''),
      unidade: String(nf.UNME_ESTATISTICA ?? '—'),
      origem: 'Mercado Nacional',
      processo: `NF ${String(nf.NUMERO_NF ?? '')}`,
      data: String(nf.DATA_EMISSAO ?? ''),
      ii: null, ipi, pis, cofins, afrmm: 0, icms, saving: null, cash,
      quantidadeRealizada, quantidadeAprovada, valorAprovado,
      savingEstimado: null,
      cashEstimado: estimarGanho(cash, quantidadeRealizada, quantidadeAprovada),
      icmsEstimado: estimarGanho(icms, quantidadeRealizada, quantidadeAprovada),
    }
  }),
]

function ControleGanhos() {
  const [planta, setPlanta] = useState('Todas')
  const [ac, setAc] = useState('Todos')
  const [item, setItem] = useState('Todos')
  const [origem, setOrigem] = useState('Todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')

  const opcoesPlanta = useMemo(() => [...new Set(dadosMock.map((d) => d.planta))], [])
  const opcoesAC = useMemo(() => [...new Set(dadosMock.map((d) => d.ac))], [])
  const opcoesItem = useMemo(() => [...new Set(dadosMock.map((d) => d.item))], [])

  const dadosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase()
    return dadosMock.filter((d) =>
      (planta === 'Todas' || d.planta === planta) &&
      (ac === 'Todos' || d.ac === ac) &&
      (item === 'Todos' || d.item === item) &&
      (origem === 'Todas' || d.origem === origem) &&
      (!dataInicio || d.data >= dataInicio) &&
      (!dataFim || d.data <= dataFim) &&
      (!termo || d.insumo.toLowerCase().includes(termo) || d.ncm.toLowerCase().includes(termo) || d.processo.toLowerCase().includes(termo))
    )
  }, [planta, ac, item, origem, dataInicio, dataFim, busca])

  const indicadores = useMemo(() => dadosFiltrados.reduce((total, d) => ({
    saving: total.saving + (d.saving ?? 0),
    cash: total.cash + d.cash,
    icms: total.icms + (d.icms ?? 0),
  }), { saving: 0, cash: 0, icms: 0 }), [dadosFiltrados])

  // Dados dos três gráficos de resumo.
  const dadosSavingResumo = criarDadosResumo(somarCampo(dadosFiltrados, 'saving'), somarCampo(dadosFiltrados, 'savingEstimado'))
  const dadosCashResumo = criarDadosResumo(somarCampo(dadosFiltrados, 'cash'), somarCampo(dadosFiltrados, 'cashEstimado'))
  const dadosIcmsResumo = criarDadosResumo(somarCampo(dadosFiltrados, 'icms'), somarCampo(dadosFiltrados, 'icmsEstimado'))

  // Agrupamento dos registros por insumo.
  const dadosPorInsumo = useMemo(() => {
    const agrupados = new Map<string, LinhaGanho[]>()
    dadosFiltrados.forEach((d) => {
      const registros = agrupados.get(d.insumo) ?? []
      registros.push(d)
      agrupados.set(d.insumo, registros)
    })
    return [...agrupados.entries()].map(([insumo, registros]) => ({
      insumo,
      saving: somarCampo(registros, 'saving'),
      savingEstimado: somarCampo(registros, 'savingEstimado'),
      cash: somarCampo(registros, 'cash'),
      cashEstimado: somarCampo(registros, 'cashEstimado'),
      icms: somarCampo(registros, 'icms'),
      icmsEstimado: somarCampo(registros, 'icmsEstimado'),
    }))
  }, [dadosFiltrados])

  const criarDadosInsumo = (campo: 'saving' | 'cash' | 'icms', estimado: 'savingEstimado' | 'cashEstimado' | 'icmsEstimado') =>
    dadosPorInsumo.filter((d) => d[campo] !== null || d[estimado] !== null).map((d) => ({
      insumo: d.insumo,
      realizado: d[campo] ?? 0,
      estimado: d[estimado] ?? 0,
    }))

  const dadosSavingInsumo = criarDadosInsumo('saving', 'savingEstimado')
  const dadosCashInsumo = criarDadosInsumo('cash', 'cashEstimado')
  const dadosIcmsInsumo = criarDadosInsumo('icms', 'icmsEstimado')

  const seriesSaving = [
    { dataKey: 'realizado', nome: 'Realizado', cor: '#3B82F6' },
    { dataKey: 'estimado', nome: 'Estimado', cor: '#60A5FA' },
  ]
  const seriesCash = [
    { dataKey: 'realizado', nome: 'Realizado', cor: '#10B981' },
    { dataKey: 'estimado', nome: 'Estimado', cor: '#6EE7B7' },
  ]
  const seriesIcms = [
    { dataKey: 'realizado', nome: 'Realizado', cor: '#F59E0B' },
    { dataKey: 'estimado', nome: 'Estimado', cor: '#FCD34D' },
  ]

  const ganhosPorAC = useMemo(() => {
    const agrupados = new Map<string, { saving: number; cash: number; quantidade: number }>()
    dadosFiltrados.forEach((d) => {
      const atual = agrupados.get(d.ac) ?? { saving: 0, cash: 0, quantidade: 0 }
      agrupados.set(d.ac, {
        saving: atual.saving + (d.saving ?? 0),
        cash: atual.cash + d.cash,
        quantidade: atual.quantidade + 1,
      })
    })
    return [...agrupados.entries()].map(([numeroAC, valores]) => ({ ac: numeroAC, ...valores }))
  }, [dadosFiltrados])

  const limparFiltros = () => {
    setPlanta('Todas')
    setAc('Todos')
    setItem('Todos')
    setOrigem('Todas')
    setDataInicio('')
    setDataFim('')
    setBusca('')
  }

  const estiloSelect = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'
  const estiloCard = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-3 shadow-lg shadow-black/10'
  const estiloTh = 'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'
  const estiloTd = 'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'

  return (
    <div className="flex min-h-screen flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      <PageHeader titulo="Controle de Ganhos" descricao="Acompanhamento dos ganhos tributários por planta, ato e insumo." badge={
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">Dados demonstrativos</span>
      } />

      <section>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Filtros de consulta</h2>
              <p className="mt-1 text-xs text-slate-400">Utilize os campos abaixo para refinar os resultados.</p>
            </div>
            <button onClick={limparFiltros} className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">Limpar filtros</button>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <FilterField label="Planta">
              <select className={estiloSelect} value={planta} onChange={(e) => setPlanta(e.target.value)}>
                <option>Todas</option>
                {opcoesPlanta.map((p) => <option key={p}>{p}</option>)}
              </select>
            </FilterField>
            <FilterField label="Ato concessório">
              <select className={estiloSelect} value={ac} onChange={(e) => setAc(e.target.value)}>
                <option>Todos</option>
                {opcoesAC.map((a) => <option key={a}>{a}</option>)}
              </select>
            </FilterField>
            <FilterField label="Item">
              <select className={estiloSelect} value={item} onChange={(e) => setItem(e.target.value)}>
                <option>Todos</option>
                {opcoesItem.map((i) => <option key={i}>{i}</option>)}
              </select>
            </FilterField>
            <FilterField label="Origem">
              <select className={estiloSelect} value={origem} onChange={(e) => setOrigem(e.target.value)}>
                <option>Todas</option>
                <option>Importação</option>
                <option>Mercado Nacional</option>
              </select>
            </FilterField>
            <FilterField label="Data inicial">
              <input type="date" className={estiloSelect} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </FilterField>
            <FilterField label="Data final">
              <input type="date" className={estiloSelect} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </FilterField>
            <FilterField label="Pesquisar insumo, NCM ou processo" className="sm:col-span-2">
              <input type="text" placeholder="Digite para pesquisar..." className={estiloSelect} value={busca} onChange={(e) => setBusca(e.target.value)} />
            </FilterField>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard titulo="Saving realizado" valor={moeda(indicadores.saving)} descricao="II + AFRMM na importação" variante="blue" />
        <KpiCard titulo="Cash realizado" valor={moeda(indicadores.cash)} descricao="IPI + PIS + COFINS" variante="green" />
        <KpiCard titulo="ICMS identificado" valor={moeda(indicadores.icms)} descricao="Valores disponíveis nas notas fiscais" variante="amber" />
      </section>

      {/* Três gráficos de resumo */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Comparativo de ganhos</h2>
          <p className="mt-1 text-sm text-slate-400">Valores realizados e estimados conforme os filtros selecionados.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <BarChart titulo="Saving" descricao="Realizado x Estimado" dados={dadosSavingResumo} categoriaKey="categoria" series={seriesSaving} />
          <BarChart titulo="Cash" descricao="Realizado x Estimado" dados={dadosCashResumo} categoriaKey="categoria" series={seriesCash} />
          <BarChart titulo="ICMS" descricao="Realizado x Estimado" dados={dadosIcmsResumo} categoriaKey="categoria" series={seriesIcms} />
        </div>
      </section>

      {/* Três gráficos detalhados por insumo */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Ganhos por insumo</h2>
          <p className="mt-1 text-sm text-slate-400">Comparação dos valores realizados e estimados para cada insumo.</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <BarChart titulo="Saving por insumo" descricao="Valores de Saving" dados={dadosSavingInsumo} categoriaKey="insumo" series={seriesSaving} altura={420} />
          <BarChart titulo="Cash por insumo" descricao="Valores de Cash" dados={dadosCashInsumo} categoriaKey="insumo" series={seriesCash} altura={420} />
          <BarChart titulo="ICMS por insumo" descricao="Valores de ICMS" dados={dadosIcmsInsumo} categoriaKey="insumo" series={seriesIcms} altura={420} />
        </div>
      </section>

      {/* Ganhos por Ato Concessório */}
      <section className={estiloCard}>
        <div className="mb-4">
          <h2 className="font-semibold text-white">Ganhos por Ato Concessório</h2>
          <p className="mt-1 text-xs text-slate-400">Consolidação dos valores por número de AC.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ganhosPorAC.map((d) => (
            <div key={d.ac} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 transition hover:border-slate-600">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold text-slate-100">{d.ac}</span>
                <span className="text-xs text-slate-500">{d.quantidade} registro(s)</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Saving</p>
                  <p className="mt-1 font-semibold text-blue-400">{moeda(d.saving)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Cash</p>
                  <p className="mt-1 font-semibold text-emerald-400">{moeda(d.cash)}</p>
                </div>
              </div>
            </div>
          ))}
          {ganhosPorAC.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nenhum registro encontrado.</p>}
        </div>
      </section>

      {/* Tabela detalhada */}
      <section className={estiloCard}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-white">Detalhamento dos ganhos por insumo</h2>
            <p className="mt-1 text-xs text-slate-400">Tributos e valores identificados por item e origem.</p>
          </div>
          <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">{dadosFiltrados.length} registros</span>
        </div>
        <DataTable columns={colunasGanhos} data={dadosFiltrados} rowKey={(d) => d.id} mensagemVazia="Nenhum registro encontrado para os filtros selecionados." alturaMaxima="380px" />
      </section>

      {/* Ganhos por processo */}
      <section className={estiloCard}>
        <div className="mb-6">
          <h2 className="font-semibold text-white">Ganhos por processo (DI / DUIMP / NF)</h2>
          <p className="mt-1 text-xs text-slate-400">Identificação dos processos relacionados aos registros filtrados.</p>
        </div>
        <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-700">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr>
                {['Processo', 'Nº AC', 'Item', 'Insumo', 'Origem', 'Data', 'Saving', 'Cash'].map((titulo) => (
                  <th key={titulo} className={estiloTh}>{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((d) => (
                <tr key={d.id} className="transition hover:bg-slate-700/40">
                  <td className={`${estiloTd} font-medium text-white`}>{d.processo}</td>
                  <td className={estiloTd}>{d.ac}</td>
                  <td className={estiloTd}>{d.item}</td>
                  <td className={estiloTd}>{d.insumo}</td>
                  <td className={estiloTd}>{d.origem}</td>
                  <td className={estiloTd}>{dataBR(d.data)}</td>
                  <td className={estiloTd}>{moeda(d.saving)}</td>
                  <td className={estiloTd}>{moeda(d.cash)}</td>
                </tr>
              ))}
              {dadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">Nenhum processo encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Observação sobre os cálculos:</strong>{' '}
        Saving considera II + AFRMM na importação. Cash considera IPI + PIS + COFINS. O ICMS é exibido separadamente quando há valor disponível na nota fiscal. Os registros nacionais não possuem valor de II no mock atual, e os registros de importação não possuem valor calculado de ICMS. Os valores estimados e a metodologia definitiva de ICMS ainda precisam ser validados.
      </div>
    </div>
  )
}

export default ControleGanhos
