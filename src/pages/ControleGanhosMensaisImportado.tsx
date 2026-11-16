import { useMemo, useState } from 'react'
import { moeda } from '../utils/formatters'
import PageHeader from '../components/layout/PageHeader'
import KpiCard from '../components/dashboard/KpiCard'
import FilterField from '../components/dashboard/FilterField'
import BarChart from '../components/dashboard/BarChart'
import { drawbackMock, drawbackImpMock, drawbackResumoImpMock } from '../mocks/tables'

type RegistroImportado = {
  id: string
  planta: string
  ac: string
  item: string
  insumo: string
  ncm: string
  dataDesembaraco: string
  dataEmissao: string
  ii: number | null
  ipi: number | null
  pis: number | null
  cofins: number | null
  afrmm: number | null
  icms: number | null
}

type CampoData = 'dataDesembaraco' | 'dataEmissao'

type CampoValor = 'saving' | 'cash' | 'ii' | 'ipi' | 'pis' | 'cofins' | 'afrmm' | 'icms'

type DadoMensal = {
  mes: string
  realizado: number
  acumulado: number
}

const obterCampo = (objeto: unknown, ...campos: string[]): unknown => {
  if (!objeto || typeof objeto !== 'object') return undefined
  const registro = objeto as Record<string, unknown>
  for (const campo of campos) {
    if (registro[campo] !== undefined && registro[campo] !== null && registro[campo] !== '') return registro[campo]
  }
  return undefined
}

const obterTexto = (objeto: unknown, ...campos: string[]): string => {
  const valor = obterCampo(objeto, ...campos)
  return valor === undefined ? '' : String(valor)
}

const obterNumero = (objeto: unknown, ...campos: string[]): number | null => {
  const valor = obterCampo(objeto, ...campos)
  if (valor === undefined) return null
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

const converterData = (valor: string): Date | null => {
  if (!valor) return null
  const dataBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (dataBR) {
    const data = new Date(Number(dataBR[3]), Number(dataBR[2]) - 1, Number(dataBR[1]))
    return Number.isNaN(data.getTime()) ? null : data
  }
  const dataISO = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dataISO) {
    const data = new Date(Number(dataISO[1]), Number(dataISO[2]) - 1, Number(dataISO[3]))
    return Number.isNaN(data.getTime()) ? null : data
  }
  const data = new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data
}

const formatarMes = (data: Date): string =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
    .format(data)
    .replace('.', '')

const obterValor = (registro: RegistroImportado, campo: CampoValor): number | null => {
  if (campo === 'saving') {
    if (registro.ii === null && registro.afrmm === null) return null
    return (registro.ii ?? 0) + (registro.afrmm ?? 0)
  }
  if (campo === 'cash') {
    if (registro.ipi === null && registro.pis === null && registro.cofins === null) return null
    return (registro.ipi ?? 0) + (registro.pis ?? 0) + (registro.cofins ?? 0)
  }
  return registro[campo]
}

const registrosImportados: RegistroImportado[] = drawbackImpMock.map((imp, index) => {
  const ato = drawbackMock.find((item) =>
    item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK && item.NRO_ITEM === imp.NRO_ITEM
  )
  const resumo = drawbackResumoImpMock.find((item) =>
    item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK && item.NRO_ITEM_IMP === imp.NRO_ITEM
  )

  const ii = obterNumero(imp, 'VALOR_DEVIDO_II')
  const ipi = obterNumero(imp, 'VALOR_DEVIDO_IPI')
  const pis = obterNumero(imp, 'VALOR_DEVIDO_PIS')
  const cofins = obterNumero(imp, 'VALOR_DEVIDO_COFINS')
  const frete = obterNumero(imp, 'VALOR_FRETE_RS')
  const aliquotaAfrmm = obterNumero(imp, 'AFRMM_ALIQUOTA')
  const afrmm = frete === null || aliquotaAfrmm === null ? null : frete * aliquotaAfrmm

  return {
    id: `IMP-${String(imp.NUMERO_DRAWBACK)}-${String(imp.NRO_ITEM)}-${index}`,
    planta: String(ato?.CLIENTE_CIDADE ?? imp.CLIENTE ?? 'Não identificada'),
    ac: String(imp.NUMERO_DRAWBACK ?? ''),
    item: String(imp.NRO_ITEM ?? ''),
    insumo: String(imp.NOME_COMERCIAL ?? 'Insumo não identificado'),
    ncm: String(imp.NCM_CODIGO ?? ''),
    dataDesembaraco: String(resumo?.DATA_DESEMBARACO ?? imp.DATA_DESEMBARACO ?? ''),
    dataEmissao: obterTexto(resumo, 'DATA_EMISSAO', 'DATA_EMISSAO_NF', 'DT_EMISSAO_NF') ||
      obterTexto(imp, 'DATA_EMISSAO', 'DATA_EMISSAO_NF', 'DT_EMISSAO_NF'),
    ii,
    ipi,
    pis,
    cofins,
    afrmm,
    icms: obterNumero(imp, 'VALOR_DEVIDO_ICMS', 'ICMS_VICMS', 'VALOR_ICMS'),
  }
})


// Dados fictícios temporários para visualização dos gráficos.
// Não utilizar estes registros nos KPIs ou em cálculos oficiais.
const registrosMockImportados: RegistroImportado[] = [
  {
    id: 'MOCK-001', planta: 'Ouro Branco', ac: '250008270', item: '1',
    insumo: 'ANTRACITA', ncm: '27011100',
    dataDesembaraco: '15/08/2025', dataEmissao: '20/08/2025',
    ii: 2265.44, ipi: 1437.09, pis: 74463.36, cofins: 342176.87,
    afrmm: 45526.81, icms: 115218.46,
  },
  {
    id: 'MOCK-002', planta: 'Ouro Branco', ac: '250008270', item: '3',
    insumo: 'CARVAO', ncm: '27011200',
    dataDesembaraco: '15/09/2025', dataEmissao: '22/09/2025',
    ii: 164604.63, ipi: 38633.78, pis: 55781.82, cofins: 256330.75,
    afrmm: 13235.64, icms: 117143.42,
  },
  {
    id: 'MOCK-003', planta: 'Ouro Branco', ac: '250008270', item: '4',
    insumo: 'CARVAO', ncm: '27011200',
    dataDesembaraco: '15/10/2025', dataEmissao: '21/10/2025',
    ii: 299599.49, ipi: 82325.54, pis: 981047.35, cofins: 4508146.16,
    afrmm: 460000.40, icms: 1345144.50,
  },
  {
    id: 'MOCK-004', planta: 'Ouro Branco', ac: '250008270', item: '5',
    insumo: 'CARVAO', ncm: '27011200',
    dataDesembaraco: '15/11/2025', dataEmissao: '24/11/2025',
    ii: 139359.50, ipi: 88402.96, pis: 1112173.54, cofins: 5110702.20,
    afrmm: 518900.15, icms: 1462287.92,
  },
  {
    id: 'MOCK-005', planta: 'Ouro Branco', ac: '250008270', item: '6',
    insumo: 'CARVAO', ncm: '27011200',
    dataDesembaraco: '15/12/2025', dataEmissao: '18/12/2025',
    ii: 438958.99, ipi: 170728.49, pis: 1966924.45, cofins: 9038486.15,
    afrmm: 598985.68, icms: 2597303.14,
  },
  {
    id: 'MOCK-006', planta: 'Ouro Branco', ac: '250008270', item: '6',
    insumo: 'CARVAO', ncm: '27011200',
    dataDesembaraco: '15/01/2026', dataEmissao: '20/01/2026',
    ii: 499363.38, ipi: 209046.13, pis: 3079097.98, cofins: 14149188.35,
    afrmm: 1117885.83, icms: 4059591.06,
  },
  {
    id: 'MOCK-007', planta: 'Ouro Branco', ac: '250008270', item: '1',
    insumo: 'ANTRACITA', ncm: '27011100',
    dataDesembaraco: '15/02/2026', dataEmissao: '19/02/2026',
    ii: 60404.39, ipi: 38317.64, pis: 23490.60, cofins: 107944.88,
    afrmm: 4167.63, icms: 51437.23,
  },
  {
    id: 'MOCK-008', planta: 'Ouro Branco', ac: '250008270', item: '3',
    insumo: 'CARVAO', ncm: '27011200',
    dataDesembaraco: '15/04/2026', dataEmissao: '22/04/2026',
    ii: 544783.19, ipi: 345448.70, pis: 756916.33, cofins: 3478210.75,
    afrmm: 290258.68, icms: 993377.36,
  },
]


const construirDadosMensais = (
  registros: RegistroImportado[],
  campo: CampoValor,
  campoData: CampoData,
  ano: string,
  dataInicio: string,
  dataFim: string,
): DadoMensal[] => {
  const agrupados = new Map<string, { data: Date; valor: number }>()

  registros.forEach((registro) => {
    const data = converterData(registro[campoData])
    const valor = obterValor(registro, campo)
    if (!data || valor === null) return
    if (ano !== 'Todos' && data.getFullYear() !== Number(ano)) return

    const dataISO = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-01`
    if (dataInicio && data < new Date(`${dataInicio}T00:00:00`)) return
    if (dataFim && data > new Date(`${dataFim}T23:59:59`)) return

    const atual = agrupados.get(dataISO)
    agrupados.set(dataISO, { data, valor: (atual?.valor ?? 0) + valor })
  })

  let acumulado = 0
  return [...agrupados.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, registro]) => {
      acumulado += registro.valor
      return {
        mes: formatarMes(registro.data),
        realizado: registro.valor,
        acumulado,
      }
    })
}

const somar = (registros: RegistroImportado[], campo: CampoValor): number =>
  registros.reduce((total, registro) => total + (obterValor(registro, campo) ?? 0), 0)

const seriesMensais = (cor: string, corAcumulado: string) => [
  { dataKey: 'realizado', nome: 'Realizado', cor },
  { dataKey: 'acumulado', nome: 'Acumulado', cor: corAcumulado },
]

function ControleGanhosMensaisImportado() {
  const [planta, setPlanta] = useState('Todas')
  const [ac, setAc] = useState('Todos')
  const [item, setItem] = useState('Todos')
  const [insumo, setInsumo] = useState('')
  const [ncm, setNcm] = useState('')
  const [ano, setAno] = useState('Todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const opcoesPlanta = useMemo(() => [...new Set(registrosImportados.map((d) => d.planta).filter(Boolean))].sort(), [])
  const opcoesAC = useMemo(() => [...new Set(registrosImportados.map((d) => d.ac).filter(Boolean))].sort(), [])
  const opcoesItem = useMemo(() => [...new Set(registrosImportados.map((d) => d.item).filter(Boolean))].sort(), [])
 const opcoesAno = useMemo(() => {const todosRegistros = [...registrosImportados, ...registrosMockImportados]
const anos = todosRegistros.flatMap((d) =>
    [d.dataDesembaraco, d.dataEmissao]
      .map(converterData)
      .filter((data): data is Date => data !== null)
      .map((data) => data.getFullYear())
  )
  return [...new Set(anos)].sort((a, b) => a - b)
}, [])


  const dadosFiltrados = useMemo(() => registrosImportados.filter((d) =>
    (planta === 'Todas' || d.planta === planta) &&
    (ac === 'Todos' || d.ac === ac) &&
    (item === 'Todos' || d.item === item) &&
    (!insumo || d.insumo.toLowerCase().includes(insumo.toLowerCase())) &&
    (!ncm || d.ncm.includes(ncm))
  ), [planta, ac, item, insumo, ncm])


const registrosMockFiltrados = useMemo(() =>
  registrosMockImportados.filter((d) =>
    (planta === 'Todas' || d.planta === planta) &&
    (ac === 'Todos' || d.ac === ac) &&
    (item === 'Todos' || d.item === item) &&
    (!insumo || d.insumo.toLowerCase().includes(insumo.toLowerCase())) &&
    (!ncm || d.ncm.includes(ncm))
  ),
  [planta, ac, item, insumo, ncm]
)


// Primeiro tenta utilizar os dados reais.
// Se a série não tiver registros, utiliza os mocks demonstrativos.
const dadosSavingReal = construirDadosMensais(dadosFiltrados, 'saving', 'dataDesembaraco', ano, dataInicio, dataFim)
const dadosCashReal = construirDadosMensais(dadosFiltrados, 'cash', 'dataDesembaraco', ano, dataInicio, dataFim)
const dadosIIReal = construirDadosMensais(dadosFiltrados, 'ii', 'dataEmissao', ano, dataInicio, dataFim)
const dadosIPIReal = construirDadosMensais(dadosFiltrados, 'ipi', 'dataEmissao', ano, dataInicio, dataFim)
const dadosPISReal = construirDadosMensais(dadosFiltrados, 'pis', 'dataEmissao', ano, dataInicio, dataFim)
const dadosCOFINSReal = construirDadosMensais(dadosFiltrados, 'cofins', 'dataEmissao', ano, dataInicio, dataFim)
const dadosAFRMMReal = construirDadosMensais(dadosFiltrados, 'afrmm', 'dataDesembaraco', ano, dataInicio, dataFim)
const dadosICMSReal = construirDadosMensais(dadosFiltrados, 'icms', 'dataEmissao', ano, dataInicio, dataFim)

const dadosSaving = dadosSavingReal.length > 0 ? dadosSavingReal : construirDadosMensais(registrosMockFiltrados, 'saving', 'dataDesembaraco', ano, dataInicio, dataFim)
const dadosCash = dadosCashReal.length > 0 ? dadosCashReal : construirDadosMensais(registrosMockFiltrados, 'cash', 'dataDesembaraco', ano, dataInicio, dataFim)
const dadosII = dadosIIReal.length > 0 ? dadosIIReal : construirDadosMensais(registrosMockFiltrados, 'ii', 'dataEmissao', ano, dataInicio, dataFim)
const dadosIPI = dadosIPIReal.length > 0 ? dadosIPIReal : construirDadosMensais(registrosMockFiltrados, 'ipi', 'dataEmissao', ano, dataInicio, dataFim)
const dadosPIS = dadosPISReal.length > 0 ? dadosPISReal : construirDadosMensais(registrosMockFiltrados, 'pis', 'dataEmissao', ano, dataInicio, dataFim)
const dadosCOFINS = dadosCOFINSReal.length > 0 ? dadosCOFINSReal : construirDadosMensais(registrosMockFiltrados, 'cofins', 'dataEmissao', ano, dataInicio, dataFim)
const dadosAFRMM = dadosAFRMMReal.length > 0 ? dadosAFRMMReal : construirDadosMensais(registrosMockFiltrados, 'afrmm', 'dataDesembaraco', ano, dataInicio, dataFim)
const dadosICMS = dadosICMSReal.length > 0 ? dadosICMSReal : construirDadosMensais(registrosMockFiltrados, 'icms', 'dataEmissao', ano, dataInicio, dataFim)

 
  const dadosKpi = useMemo(() => dadosFiltrados.filter((d) => {
    const data = converterData(d.dataDesembaraco)
    if (!data) return false
    if (ano !== 'Todos' && data.getFullYear() !== Number(ano)) return false
    if (dataInicio && data < new Date(`${dataInicio}T00:00:00`)) return false
    if (dataFim && data > new Date(`${dataFim}T23:59:59`)) return false
    return true
  }), [dadosFiltrados, ano, dataInicio, dataFim])

  const indicadores = {
    saving: somar(dadosKpi, 'saving'),
    cash: somar(dadosKpi, 'cash'),
  }

  const limparFiltros = () => {
    setPlanta('Todas')
    setAc('Todos')
    setItem('Todos')
    setInsumo('')
    setNcm('')
    setAno('Todos')
    setDataInicio('')
    setDataFim('')
  }

  const estiloSelect = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'
  const estiloCard = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10'

  return (
    <div className="flex min-h-screen flex-col gap-7 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      <PageHeader
        titulo="Ganhos Mensais – Importação"
        descricao="Acompanhamento mensal dos ganhos tributários realizados e acumulados."
        badge={
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            Dados demonstrativos
          </span>
        }
      />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <KpiCard titulo="Total Saving Realizado" valor={moeda(indicadores.saving)} descricao="II + AFRMM por mês de desembaraço" variante="blue" />
        <KpiCard titulo="Total Cash Realizado" valor={moeda(indicadores.cash)} descricao="IPI + PIS + COFINS por mês de desembaraço" variante="green" />
      </section>

      <section className={estiloCard}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Filtros de consulta</h2>
            <p className="mt-1 text-xs text-slate-400">Selecione os critérios para atualizar os indicadores e gráficos.</p>
          </div>
          <button onClick={limparFiltros} className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            Limpar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Planta">
            <select className={estiloSelect} value={planta} onChange={(e) => setPlanta(e.target.value)}>
              <option value="Todas">Todas</option>
              {opcoesPlanta.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FilterField>
          <FilterField label="Número do ato concessório (AC)">
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
          <FilterField label="Ano">
            <select className={estiloSelect} value={ano} onChange={(e) => setAno(e.target.value)}>
              <option value="Todos">Todos</option>
              {opcoesAno.map((a) => <option key={a} value={String(a)}>{a}</option>)}
            </select>
          </FilterField>
          <FilterField label="Insumo">
            <input className={estiloSelect} value={insumo} onChange={(e) => setInsumo(e.target.value)} placeholder="Pesquisar insumo..." />
          </FilterField>
          <FilterField label="NCM">
            <input className={estiloSelect} value={ncm} onChange={(e) => setNcm(e.target.value)} placeholder="Pesquisar NCM..." />
          </FilterField>
          <FilterField label="Data inicial">
            <input type="date" className={estiloSelect} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </FilterField>
          <FilterField label="Data final">
            <input type="date" className={estiloSelect} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </FilterField>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Evolução mensal dos ganhos</h2>
          <p className="mt-1 text-sm text-slate-400">Valores realizados no mês e total acumulado no período selecionado.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BarChart titulo="Total Saving Realizado e Acumulado" descricao="Mês de desembaraço | II + AFRMM" dados={dadosSaving} categoriaKey="mes" series={seriesMensais('#3B82F6', '#93C5FD')} />
          <BarChart titulo="Total Cash Realizado e Acumulado" descricao="Mês de desembaraço | IPI + PIS + COFINS" dados={dadosCash} categoriaKey="mes" series={seriesMensais('#10B981', '#6EE7B7')} />
          <BarChart titulo="Total II Realizado e Acumulado" descricao="Mês de emissão da NF" dados={dadosII} categoriaKey="mes" series={seriesMensais('#8B5CF6', '#C4B5FD')} />
          <BarChart titulo="Total IPI Realizado e Acumulado" descricao="Mês de emissão da NF" dados={dadosIPI} categoriaKey="mes" series={seriesMensais('#F59E0B', '#FCD34D')} />
          <BarChart titulo="Total PIS Realizado e Acumulado" descricao="Mês de emissão da NF" dados={dadosPIS} categoriaKey="mes" series={seriesMensais('#06B6D4', '#67E8F9')} />
          <BarChart titulo="Total COFINS Realizado e Acumulado" descricao="Mês de emissão da NF" dados={dadosCOFINS} categoriaKey="mes" series={seriesMensais('#EC4899', '#F9A8D4')} />
          <BarChart titulo="Total ICMS Realizado e Acumulado" descricao="Mês de emissão da NF" dados={dadosICMS} categoriaKey="mes" series={seriesMensais('#F97316', '#FDBA74')} />
          <BarChart titulo="Total AFRMM Realizado e Acumulado" descricao="Mês de desembaraço" dados={dadosAFRMM} categoriaKey="mes" series={seriesMensais('#A855F7', '#D8B4FE')} />
        </div>
      </section>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Observações:</strong>{' '}
        Saving considera II + AFRMM e Cash considera IPI + PIS + COFINS. Os dois indicadores utilizam a data de desembaraço. Os gráficos individuais de tributos utilizam a data de emissão da NF. Registros sem a respectiva data não entram na série mensal. O ICMS depende da existência de um campo de valor preenchido na base de importação; se esse dado não estiver disponível, o gráfico ficará sem registros.
      </div>
    </div>
  )
}

export default ControleGanhosMensaisImportado