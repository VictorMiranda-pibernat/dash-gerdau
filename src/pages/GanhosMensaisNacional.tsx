
import { useMemo, useState } from 'react'
import { moeda } from '../utils/formatters'
import PageHeader from '../components/layout/PageHeader'
import KpiCard from '../components/dashboard/KpiCard'
import FilterField from '../components/dashboard/FilterField'
import BarChart from '../components/dashboard/BarChart'
import { drawbackNfMock, drawbackMock } from '../mocks/tables'

type RegistroNacional = {
  id: string
  cliente: string
  planta: string
  ac: string
  item: string
  numeroNF: string
  chaveNFe: string
  descricao: string
  ncm: string
  dataEmissao: string
  valorNF: number | null
  ipi: number | null
  pis: number | null
  cofins: number | null
  icms: number | null
}

type CampoTributo = 'ipi' | 'pis' | 'cofins' | 'icms'

type DadoMensal = {
  mes: string
  realizado: number
  acumulado: number
}

const obterCampo = (objeto: unknown, ...campos: string[]): unknown => {
  if (!objeto || typeof objeto !== 'object') return undefined
  const registro = objeto as Record<string, unknown>
  for (const campo of campos) {
    if (registro[campo] !== undefined && registro[campo] !== null && registro[campo] !== '') {
      return registro[campo]
    }
  }
  return undefined
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

const registrosNacionais: RegistroNacional[] = drawbackNfMock.map((nf, index) => {
  const ac = String(nf.NUMERO_DRAWBACK ?? '')
  const item = String(nf.NRO_ITEM ?? '')

  const ato = drawbackMock.find((registro) =>
    String(registro.NUMERO_DRAWBACK) === ac &&
    String(registro.NRO_ITEM) === item
  )

  return {
    id: String(nf.CHAVE_NFE || nf.NUMERO_NF || `${ac}-${item}-${index}`),
    cliente: String(nf.CLIENTE ?? ''),
    planta: String(ato?.CLIENTE_CIDADE ?? nf.CLIENTE ?? 'Não identificada'),
    ac,
    item,
    numeroNF: String(nf.NUMERO_NF ?? ''),
    chaveNFe: String(nf.CHAVE_NFE ?? ''),
    descricao: String(nf.DESCRICAO ?? ''),
    ncm: String(nf.NRO_NCM ?? ''),
    dataEmissao: String(nf.DATA_EMISSAO ?? ''),
    valorNF: obterNumero(nf, 'VALOR_TOTAL_NF'),
    ipi: obterNumero(nf, 'IPI_VIPI'),
    pis: obterNumero(nf, 'PIS_VPIS'),
    cofins: obterNumero(nf, 'COFINS_VCOFINS'),
    icms: obterNumero(nf, 'ICMS_VICMS'),
  }
})

const obterValor = (registro: RegistroNacional, campo: CampoTributo): number | null =>
  registro[campo]

const construirDadosMensais = (
  registros: RegistroNacional[],
  campo: CampoTributo,
  ano: string,
  dataInicio: string,
  dataFim: string,
): DadoMensal[] => {
  const agrupados = new Map<string, { data: Date; valor: number }>()

  registros.forEach((registro) => {
    const data = converterData(registro.dataEmissao)
    const valor = obterValor(registro, campo)

    if (!data || valor === null) return
    if (ano !== 'Todos' && data.getFullYear() !== Number(ano)) return
    if (dataInicio && data < new Date(`${dataInicio}T00:00:00`)) return
    if (dataFim && data > new Date(`${dataFim}T23:59:59`)) return

    const chaveMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-01`
    const atual = agrupados.get(chaveMes)

    agrupados.set(chaveMes, {
      data: new Date(data.getFullYear(), data.getMonth(), 1),
      valor: (atual?.valor ?? 0) + valor,
    })
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

const somarTributo = (registros: RegistroNacional[], campo: CampoTributo): number =>
  registros.reduce((total, registro) => total + (registro[campo] ?? 0), 0)

const seriesMensais = (cor: string, corAcumulado: string) => [
  { dataKey: 'acumulado', nome: 'Acumulado no período', cor: corAcumulado, tipo: 'barra' as const },
  { dataKey: 'realizado', nome: 'Realizado no mês', cor, tipo: 'linha' as const },
]

function GanhosMensaisNacional() {
  const [cliente, setCliente] = useState('Todos')
  const [planta, setPlanta] = useState('Todas')
  const [ac, setAc] = useState('Todos')
  const [item, setItem] = useState('Todos')
  const [ncm, setNcm] = useState('')
  const [ano, setAno] = useState('Todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const opcoesCliente = useMemo(
    () => [...new Set(registrosNacionais.map((d) => d.cliente).filter(Boolean))].sort(),
    [],
  )

  const opcoesPlanta = useMemo(
    () => [...new Set(registrosNacionais.map((d) => d.planta).filter(Boolean))].sort(),
    [],
  )

  const opcoesAC = useMemo(
    () => [...new Set(registrosNacionais.map((d) => d.ac).filter(Boolean))].sort(),
    [],
  )

  const opcoesItem = useMemo(
    () => [...new Set(registrosNacionais.map((d) => d.item).filter(Boolean))].sort(),
    [],
  )

  const opcoesAno = useMemo(() => {
    const anos = registrosNacionais
      .map((d) => converterData(d.dataEmissao))
      .filter((data): data is Date => data !== null)
      .map((data) => data.getFullYear())

    return [...new Set(anos)].sort((a, b) => a - b)
  }, [])

  const dadosFiltrados = useMemo(
    () => registrosNacionais.filter((d) =>
      (cliente === 'Todos' || d.cliente === cliente) &&
      (planta === 'Todas' || d.planta === planta) &&
      (ac === 'Todos' || d.ac === ac) &&
      (item === 'Todos' || d.item === item) &&
      (!ncm || d.ncm.includes(ncm))
    ),
    [cliente, planta, ac, item, ncm],
  )

  const dadosPeriodo = useMemo(
    () => dadosFiltrados.filter((d) => {
      const data = converterData(d.dataEmissao)
      if (!data) return false
      if (ano !== 'Todos' && data.getFullYear() !== Number(ano)) return false
      if (dataInicio && data < new Date(`${dataInicio}T00:00:00`)) return false
      if (dataFim && data > new Date(`${dataFim}T23:59:59`)) return false
      return true
    }),
    [dadosFiltrados, ano, dataInicio, dataFim],
  )

  const dadosIPI = construirDadosMensais(dadosFiltrados, 'ipi', ano, dataInicio, dataFim)
  const dadosPIS = construirDadosMensais(dadosFiltrados, 'pis', ano, dataInicio, dataFim)
  const dadosCOFINS = construirDadosMensais(dadosFiltrados, 'cofins', ano, dataInicio, dataFim)
  const dadosICMS = construirDadosMensais(dadosFiltrados, 'icms', ano, dataInicio, dataFim)

  const totalNotas = new Set(
    dadosPeriodo
      .map((d) => d.chaveNFe || d.numeroNF)
      .filter(Boolean),
  ).size

  const indicadores = {
    ipi: somarTributo(dadosPeriodo, 'ipi'),
    pis: somarTributo(dadosPeriodo, 'pis'),
    cofins: somarTributo(dadosPeriodo, 'cofins'),
    icms: somarTributo(dadosPeriodo, 'icms'),
  }

  const limparFiltros = () => {
    setCliente('Todos')
    setPlanta('Todas')
    setAc('Todos')
    setItem('Todos')
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
        titulo="Ganhos Mensais – Nacional"
        descricao="Acompanhamento mensal dos ganhos tributários vinculados às notas fiscais nacionais."
        badge={
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            Dados demonstrativos
          </span>
        }
      />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <KpiCard
          titulo="Total Notas Fiscais Vinculadas"
          valor={totalNotas.toLocaleString('pt-BR')}
          descricao="Quantidade de notas fiscais distintas no período"
          variante="blue"
        />
        <KpiCard
          titulo="Total CASH Realizado"
          valor="A validar"
          descricao="Regra de composição do CASH ainda não definida para a base nacional"
          variante="green"
        />
      </section>

      <section className={estiloCard}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Filtros de consulta</h2>
            <p className="mt-1 text-xs text-slate-400">
              Selecione os critérios para atualizar os indicadores e gráficos.
            </p>
          </div>
          <button
            onClick={limparFiltros}
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Cliente">
            <select className={estiloSelect} value={cliente} onChange={(e) => setCliente(e.target.value)}>
              <option value="Todos">Todos</option>
              {opcoesCliente.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FilterField>

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

          <FilterField label="NCM">
            <input
              className={estiloSelect}
              value={ncm}
              onChange={(e) => setNcm(e.target.value)}
              placeholder="Pesquisar NCM..."
            />
          </FilterField>

          <FilterField label="Ano">
            <select className={estiloSelect} value={ano} onChange={(e) => setAno(e.target.value)}>
              <option value="Todos">Todos</option>
              {opcoesAno.map((a) => <option key={a} value={String(a)}>{a}</option>)}
            </select>
          </FilterField>

          <FilterField label="Data inicial">
            <input
              type="date"
              className={estiloSelect}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </FilterField>

          <FilterField label="Data final">
            <input
              type="date"
              className={estiloSelect}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </FilterField>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Evolução mensal dos ganhos</h2>
          <p className="mt-1 text-sm text-slate-400">
            Valores tributários realizados no mês e acumulados no período, conforme a data de emissão da NF.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BarChart
            titulo="Total CASH Realizado e Acumulado"
            descricao="Composição pendente de validação"
            dados={[]}
            categoriaKey="mes"
            series={seriesMensais('#10B981', '#6EE7B7')}
          />

          <BarChart
            titulo="Total IPI Realizado e Acumulado"
            descricao="Mês de emissão da NF"
            dados={dadosIPI}
            categoriaKey="mes"
            series={seriesMensais('#F59E0B', '#FCD34D')}
          />

          <BarChart
            titulo="Total PIS Realizado e Acumulado"
            descricao="Mês de emissão da NF"
            dados={dadosPIS}
            categoriaKey="mes"
            series={seriesMensais('#06B6D4', '#67E8F9')}
          />

          <BarChart
            titulo="Total COFINS Realizado e Acumulado"
            descricao="Mês de emissão da NF"
            dados={dadosCOFINS}
            categoriaKey="mes"
            series={seriesMensais('#EC4899', '#F9A8D4')}
          />

          <BarChart
            titulo="Total ICMS Realizado e Acumulado"
            descricao="Mês de emissão da NF"
            dados={dadosICMS}
            categoriaKey="mes"
            series={seriesMensais('#F97316', '#FDBA74')}
          />
        </div>
      </section>

      <section className={estiloCard}>
        <h2 className="mb-4 font-semibold text-white">Resumo dos tributos no período</h2>
        <div className="grid grid-cols-1 !p-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { titulo: 'IPI', valor: indicadores.ipi, cor: 'text-amber-400' },
            { titulo: 'PIS', valor: indicadores.pis, cor: 'text-cyan-400' },
            { titulo: 'COFINS', valor: indicadores.cofins, cor: 'text-pink-400' },
            { titulo: 'ICMS', valor: indicadores.icms, cor: 'text-orange-400' },
          ].map((indicador) => (
            <div key={indicador.titulo} className="rounded-xl border border-slate-700 bg-slate-900/60 !p-2">
              <p className="text-xs font-medium text-slate-400">{indicador.titulo}</p>
              <p className={`mt-2 text-xl font-bold ${indicador.cor}`}>
                {moeda(indicador.valor)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Observações:</strong>{' '}
        Os gráficos utilizam os valores de IPI, PIS, COFINS e ICMS disponíveis na base de notas fiscais,
        agrupados pela data de emissão. O total de notas considera documentos distintos pela chave da NF-e
        ou pelo número da nota. O CASH permanece sem cálculo até a validação de sua regra de composição.
        Os valores apresentados dependem da base demonstrativa atualmente disponível.
      </div>
    </div>
  )
}

export default GanhosMensaisNacional
