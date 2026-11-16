
import { useMemo, useState } from 'react'
import { moeda } from '../utils/formatters'
import PageHeader from '../components/layout/PageHeader'
import KpiCard from '../components/dashboard/KpiCard'
import FilterField from '../components/dashboard/FilterField'

type RegistroProvisionado = {
  id: string
  planta: string
  ac: string
  li: string
  item: string
  insumo: string
  ncm: string
  dataProvisionamento: string
  ii: number
  ipi: number
  pis: number
  cofins: number
  afrmm: number
  icms: number
}

const registrosProvisionados: RegistroProvisionado[] = [
  {
    id: 'PROV-001',
    planta: 'Ouro Branco',
    ac: '250008270',
    li: '26/0266476-8',
    item: '39',
    insumo: 'FERRO SILÍCIO',
    ncm: '72022100',
    dataProvisionamento: '2026-01-15',
    ii: 1850.00,
    ipi: 1200.00,
    pis: 750.00,
    cofins: 3450.00,
    afrmm: 125.00,
    icms: 1650.00,
  },
  {
    id: 'PROV-002',
    planta: 'Ouro Branco',
    ac: '250008270',
    li: '26/0266476-8',
    item: '100',
    insumo: 'FERRO SILÍCIO',
    ncm: '72022100',
    dataProvisionamento: '2026-02-10',
    ii: 2350.00,
    ipi: 1450.00,
    pis: 900.00,
    cofins: 4100.00,
    afrmm: 180.00,
    icms: 2100.00,
  },
  {
    id: 'PROV-003',
    planta: 'Ouro Branco',
    ac: '250008271',
    li: '26/0266480-5',
    item: '12',
    insumo: 'ANTRACITA',
    ncm: '27011100',
    dataProvisionamento: '2026-03-05',
    ii: 1650.00,
    ipi: 980.00,
    pis: 620.00,
    cofins: 2850.00,
    afrmm: 95.00,
    icms: 1420.00,
  },
  {
    id: 'PROV-004',
    planta: 'Usina do Rio',
    ac: '250008272',
    li: '26/0266491-0',
    item: '08',
    insumo: 'CARVÃO',
    ncm: '27011200',
    dataProvisionamento: '2026-04-12',
    ii: 3200.00,
    ipi: 2100.00,
    pis: 1300.00,
    cofins: 5980.00,
    afrmm: 240.00,
    icms: 2850.00,
  },
  {
    id: 'PROV-005',
    planta: 'Ouro Branco',
    ac: '250008273',
    li: '26/0266502-7',
    item: '21',
    insumo: 'FERRO MANGANÊS',
    ncm: '72021100',
    dataProvisionamento: '2026-05-20',
    ii: 2750.00,
    ipi: 1750.00,
    pis: 1100.00,
    cofins: 5060.00,
    afrmm: 210.00,
    icms: 2350.00,
  },
  {
    id: 'PROV-006',
    planta: 'Usina do Rio',
    ac: '250008274',
    li: '26/0266510-8',
    item: '05',
    insumo: 'SILÍCIO METÁLICO',
    ncm: '28046900',
    dataProvisionamento: '2026-06-18',
    ii: 1950.00,
    ipi: 1320.00,
    pis: 820.00,
    cofins: 3770.00,
    afrmm: 155.00,
    icms: 1780.00,
  },
]

const somar = (
  registros: RegistroProvisionado[],
  campo: 'ii' | 'afrmm' | 'ipi' | 'pis' | 'cofins' | 'icms',
) => registros.reduce((total, registro) => total + registro[campo], 0)

const obterSaving = (registro: RegistroProvisionado) =>
  registro.ii + registro.afrmm

const obterCash = (registro: RegistroProvisionado) =>
  registro.ipi + registro.pis + registro.cofins

function GanhosProvisionados() {
  const [planta, setPlanta] = useState('Todas')
  const [ac, setAc] = useState('Todos')
  const [item, setItem] = useState('Todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const estiloSelect =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'

  const estiloCard =
    'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10'

  const opcoesPlanta = useMemo(
    () => [...new Set(registrosProvisionados.map((d) => d.planta))].sort(),
    [],
  )

  const opcoesAC = useMemo(
    () => [...new Set(registrosProvisionados.map((d) => d.ac))].sort(),
    [],
  )

  const opcoesItem = useMemo(
    () => [...new Set(registrosProvisionados.map((d) => d.item))].sort(),
    [],
  )

  const dadosFiltrados = useMemo(
    () =>
      registrosProvisionados.filter((registro) => {
        const data = registro.dataProvisionamento

        return (
          (planta === 'Todas' || registro.planta === planta) &&
          (ac === 'Todos' || registro.ac === ac) &&
          (item === 'Todos' || registro.item === item) &&
          (!dataInicio || data >= dataInicio) &&
          (!dataFim || data <= dataFim)
        )
      }),
    [planta, ac, item, dataInicio, dataFim],
  )

  const indicadores = useMemo(
    () => ({
      saving: dadosFiltrados.reduce(
        (total, registro) => total + obterSaving(registro),
        0,
      ),
      cash: dadosFiltrados.reduce(
        (total, registro) => total + obterCash(registro),
        0,
      ),
      icms: somar(dadosFiltrados, 'icms'),
    }),
    [dadosFiltrados],
  )

  const limparFiltros = () => {
    setPlanta('Todas')
    setAc('Todos')
    setItem('Todos')
    setDataInicio('')
    setDataFim('')
  }

  return (
    <div className="flex min-h-screen flex-col gap-7 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      <PageHeader
        titulo="Ganhos Provisionados"
        descricao="Acompanhamento dos ganhos tributários provisionados por ato concessório e item."
        badge={
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            Dados demonstrativos
          </span>
        }
      />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <KpiCard
          titulo="Total SAVING Provisionado"
          valor={moeda(indicadores.saving)}
          descricao="II + AFRMM"
          variante="blue"
        />
        <KpiCard
          titulo="Total CASH Provisionado"
          valor={moeda(indicadores.cash)}
          descricao="IPI + PIS + COFINS"
          variante="green"
        />
        <KpiCard
          titulo="Total ICMS Provisionado"
          valor={moeda(indicadores.icms)}
          descricao="ICMS apresentado separadamente"
          variante="blue"
        />
      </section>

      <section className={estiloCard}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Filtros de consulta</h2>
            <p className="mt-1 text-xs text-slate-400">
              Selecione os critérios para atualizar os indicadores e a tabela.
            </p>
          </div>

          <button
            onClick={limparFiltros}
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
          <FilterField label="Planta Gerdau">
            <select
              className={estiloSelect}
              value={planta}
              onChange={(e) => setPlanta(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {opcoesPlanta.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Número do AC">
            <select
              className={estiloSelect}
              value={ac}
              onChange={(e) => setAc(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {opcoesAC.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Item do AC">
            <select
              className={estiloSelect}
              value={item}
              onChange={(e) => setItem(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {opcoesItem.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
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

      <section className={estiloCard}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Controle de Ganhos</h2>
            <p className="mt-1 text-xs text-slate-400">
              Detalhamento dos valores provisionados por AC e item.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {dadosFiltrados.length} registro(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-4">Planta Gerdau</th>
                <th className="px-3 py-4">N° AC</th>
                <th className="px-3 py-4">N° LI</th>
                <th className="px-3 py-4">N° Item</th>
                <th className="px-3 py-4">Insumo</th>
                <th className="px-3 py-4">NCM</th>
                <th className="px-3 py-4 text-right">II</th>
                <th className="px-3 py-4 text-right">IPI</th>
                <th className="px-3 py-4 text-right">PIS</th>
                <th className="px-3 py-4 text-right">COFINS</th>
                <th className="px-3 py-4 text-right">AFRMM</th>
                <th className="px-3 py-4 text-right">ICMS</th>
                <th className="px-3 py-4 text-right">SAVING</th>
                <th className="px-3 py-4 text-right">CASH</th>
              </tr>
            </thead>

            <tbody>
              {dadosFiltrados.map((registro) => (
                <tr
                  key={registro.id}
                  className="border-b border-slate-800 text-slate-300 transition hover:bg-slate-700/20"
                >
                  <td className="whitespace-nowrap px-3 py-4">{registro.planta}</td>
                  <td className="whitespace-nowrap px-3 py-4">{registro.ac}</td>
                  <td className="whitespace-nowrap px-3 py-4">{registro.li}</td>
                  <td className="px-3 py-4">{registro.item}</td>
                  <td className="whitespace-nowrap px-3 py-4">{registro.insumo}</td>
                  <td className="px-3 py-4">{registro.ncm}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(registro.ii)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(registro.ipi)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(registro.pis)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(registro.cofins)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(registro.afrmm)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(registro.icms)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-blue-300">
                    {moeda(obterSaving(registro))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-emerald-300">
                    {moeda(obterCash(registro))}
                  </td>
                </tr>
              ))}

              {dadosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>

            {dadosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-600 bg-slate-900/70 font-semibold text-white">
                  <td className="px-3 py-4" colSpan={6}>
                    Total geral
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(somar(dadosFiltrados, 'ii'))}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(somar(dadosFiltrados, 'ipi'))}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(somar(dadosFiltrados, 'pis'))}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(somar(dadosFiltrados, 'cofins'))}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(somar(dadosFiltrados, 'afrmm'))}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right">{moeda(indicadores.icms)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-blue-300">{moeda(indicadores.saving)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-emerald-300">{moeda(indicadores.cash)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Observações:</strong>{' '}
        SAVING considera II + AFRMM. CASH considera IPI + PIS + COFINS.
        ICMS é apresentado em indicador e coluna próprios, sem ser somado ao
        CASH. Os registros desta versão são fictícios e servem apenas para
        demonstrar a estrutura e o funcionamento dos filtros. A regra de
        provisionamento e a origem dos valores deverão ser validadas com a
        base definitiva.
      </div>
    </div>
  )
}

export default GanhosProvisionados
