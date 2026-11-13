import { moeda, dataBR } from '../utils/formatters'
import { useMemo, useState } from 'react'

import {
  drawbackMock,
  drawbackImpMock,
  drawbackNfMock,
  drawbackProcImpMock,
  drawbackResumoImpMock,
} from '../mocks/tables'

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
}


const dadosMock: LinhaGanho[] = [
  ...drawbackImpMock.map((imp): LinhaGanho => {
    const ato = drawbackMock.find(
      (item) =>
        item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK &&
        item.NRO_ITEM === imp.NRO_ITEM,
    )

    const resumo = drawbackResumoImpMock.find(
      (item) =>
        item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK &&
        item.NRO_ITEM_IMP === imp.NRO_ITEM,
    )

    const processo = drawbackProcImpMock.find(
      (item) =>
        item.NUMERO_DRAWBACK === imp.NUMERO_DRAWBACK &&
        item.NRO_ITEM === imp.NRO_ITEM,
    )

    const ii = Number(imp.VALOR_DEVIDO_II ?? 0)

    const afrmm =
      Number(imp.VALOR_FRETE_RS ?? 0) *
      Number(imp.AFRMM_ALIQUOTA ?? 0)

    return {
      id: `IMP-${String(imp.NUMERO_DRAWBACK)}-${String(imp.NRO_ITEM)}`,
      planta: String(ato?.CLIENTE_CIDADE ?? imp.CLIENTE ?? 'Não identificada'),
      ac: String(imp.NUMERO_DRAWBACK ?? ''),
      item: String(imp.NRO_ITEM ?? ''),
      insumo: String(imp.NOME_COMERCIAL ?? 'Insumo não identificado'),
      ncm: String(imp.NCM_CODIGO ?? ''),
      unidade: String(ato?.UNID_ESTAT ?? '—'),
      origem: 'Importação',
      processo: String(
        resumo?.NRO_DECLARACAO ??
          processo?.PROCESSO_PO ??
          'Não informado',
      ),
      data: String(resumo?.DATA_DESEMBARACO ?? imp.DATA_DESEMBARACO ?? ''),
      ii,
      ipi: Number(imp.VALOR_DEVIDO_IPI ?? 0),
      pis: Number(imp.VALOR_DEVIDO_PIS ?? 0),
      cofins: Number(imp.VALOR_DEVIDO_COFINS ?? 0),
      afrmm,
      icms: null,
      saving: ii + afrmm,
      cash:
        Number(imp.VALOR_DEVIDO_IPI ?? 0) +
        Number(imp.VALOR_DEVIDO_PIS ?? 0) +
        Number(imp.VALOR_DEVIDO_COFINS ?? 0),
    }
  }),

  ...drawbackNfMock.map((nf): LinhaGanho => {
    const ato = drawbackMock.find(
      (item) =>
        item.NUMERO_DRAWBACK === nf.NUMERO_DRAWBACK &&
        item.NRO_ITEM === nf.NRO_ITEM,
    )

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
      ii: null,
      ipi: Number(nf.IPI_VIPI ?? 0),
      pis: Number(nf.PIS_VPIS ?? 0),
      cofins: Number(nf.COFINS_VCOFINS ?? 0),
      afrmm: 0,
      icms: Number(nf.ICMS_VICMS ?? 0),
      saving: null,
      cash:
        Number(nf.IPI_VIPI ?? 0) +
        Number(nf.PIS_VPIS ?? 0) +
        Number(nf.COFINS_VCOFINS ?? 0),
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

  const opcoesPlanta = useMemo(
    () => [...new Set(dadosMock.map((d) => d.planta))],
    [],
  )

  const opcoesAC = useMemo(
    () => [...new Set(dadosMock.map((d) => d.ac))],
    [],
  )

  const opcoesItem = useMemo(
    () => [...new Set(dadosMock.map((d) => d.item))],
    [],
  )

  const dadosFiltrados = useMemo(() => {
    return dadosMock.filter((d) => {
      const correspondePlanta =
        planta === 'Todas' || d.planta === planta

      const correspondeAC = ac === 'Todos' || d.ac === ac

      const correspondeItem = item === 'Todos' || d.item === item

      const correspondeOrigem =
        origem === 'Todas' || d.origem === origem

      const correspondeInicio =
        !dataInicio || d.data >= dataInicio

      const correspondeFim = !dataFim || d.data <= dataFim

      const termo = busca.toLowerCase()

      const correspondeBusca =
        !termo ||
        d.insumo.toLowerCase().includes(termo) ||
        d.ncm.toLowerCase().includes(termo) ||
        d.processo.toLowerCase().includes(termo)

      return (
        correspondePlanta &&
        correspondeAC &&
        correspondeItem &&
        correspondeOrigem &&
        correspondeInicio &&
        correspondeFim &&
        correspondeBusca
      )
    })
  }, [planta, ac, item, origem, dataInicio, dataFim, busca])

  const indicadores = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, d) => ({
        saving: total.saving + (d.saving ?? 0),
        cash: total.cash + d.cash,
        icms: total.icms + (d.icms ?? 0),
      }),
      { saving: 0, cash: 0, icms: 0 },
    )
  }, [dadosFiltrados])

  const ganhosPorInsumo = useMemo(() => {
    const agrupados = new Map<
      string,
      { saving: number; cash: number }
    >()

    dadosFiltrados.forEach((d) => {
      const atual = agrupados.get(d.insumo) ?? {
        saving: 0,
        cash: 0,
      }

      agrupados.set(d.insumo, {
        saving: atual.saving + (d.saving ?? 0),
        cash: atual.cash + d.cash,
      })
    })

    return [...agrupados.entries()].map(([nome, valores]) => ({
      nome,
      ...valores,
      total: valores.saving + valores.cash,
    }))
  }, [dadosFiltrados])

  const ganhosPorAC = useMemo(() => {
    const agrupados = new Map<
      string,
      { saving: number; cash: number; quantidade: number }
    >()

    dadosFiltrados.forEach((d) => {
      const atual = agrupados.get(d.ac) ?? {
        saving: 0,
        cash: 0,
        quantidade: 0,
      }

      agrupados.set(d.ac, {
        saving: atual.saving + (d.saving ?? 0),
        cash: atual.cash + d.cash,
        quantidade: atual.quantidade + 1,
      })
    })

    return [...agrupados.entries()].map(([ac, valores]) => ({
      ac,
      ...valores,
    }))
  }, [dadosFiltrados])

  const maiorGanho = Math.max(
    ...ganhosPorInsumo.map((d) => d.total),
    1,
  )

  const limparFiltros = () => {
    setPlanta('Todas')
    setAc('Todos')
    setItem('Todos')
    setOrigem('Todas')
    setDataInicio('')
    setDataFim('')
    setBusca('')
  }

  // Identidade visual dark
  const estiloSelect =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'

  const estiloLabel =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400'

  const estiloCard =
    'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-3 shadow-lg shadow-black/10'

  const estiloTh =
    'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'

  const estiloTd =
    'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'

  return (
<div className="min-h-screen flex flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Gerdau | Drawback
          </span>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Controle de Ganhos
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Acompanhamento dos ganhos tributários por planta, ato e insumo.
          </p>
        </div>

        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
          Dados demonstrativos
        </span>
      </div>

      {/* FILTROS */}
      <section className={estiloCard}>
        <div className=" mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-white">
              Filtros de consulta
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Utilize os campos abaixo para refinar os resultados.
            </p>
          </div>

          <button
            onClick={limparFiltros}
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={estiloLabel}>Planta</label>
            <select
              className={estiloSelect}
              value={planta}
              onChange={(e) => setPlanta(e.target.value)}
            >
              <option>Todas</option>
              {opcoesPlanta.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={estiloLabel}>Ato concessório</label>
            <select
              className={estiloSelect}
              value={ac}
              onChange={(e) => setAc(e.target.value)}
            >
              <option>Todos</option>
              {opcoesAC.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={estiloLabel}>Item</label>
            <select
              className={estiloSelect}
              value={item}
              onChange={(e) => setItem(e.target.value)}
            >
              <option>Todos</option>
              {opcoesItem.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={estiloLabel}>Origem</label>
            <select
              className={estiloSelect}
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
            >
              <option>Todas</option>
              <option>Importação</option>
              <option>Mercado Nacional</option>
            </select>
          </div>

          <div>
            <label className={estiloLabel}>Data inicial</label>
            <input
              type="date"
              className={estiloSelect}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div>
            <label className={estiloLabel}>Data final</label>
            <input
              type="date"
              className={estiloSelect}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={estiloLabel}>
              Pesquisar insumo, NCM ou processo
            </label>
            <input
              type="text"
              placeholder="Digite para pesquisar..."
              className={estiloSelect}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className={`${estiloCard} border-l-4 border-l-blue-500`}>
          <p className="text-sm font-medium text-slate-400">
            Saving realizado
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-400">
            {moeda(indicadores.saving)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            II + AFRMM na importação
          </p>
        </div>

        <div className={`${estiloCard} border-l-4 border-l-emerald-500`}>
          <p className="text-sm font-medium text-slate-400">
            Cash realizado
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-400">
            {moeda(indicadores.cash)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            IPI + PIS + COFINS
          </p>
        </div>

        <div className={`${estiloCard} border-l-4 border-l-amber-500`}>
          <p className="text-sm font-medium text-slate-400">
            ICMS identificado
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-400">
            {moeda(indicadores.icms)}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Valores disponíveis nas notas fiscais
          </p>
        </div>
      </section>

      {/* GRÁFICOS E CONSOLIDAÇÕES */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* GANHOS POR INSUMO */}
        <div className={estiloCard}>
          <div className="mb-5">
            <h2 className="font-semibold text-white">
              Ganhos por insumo
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Comparativo entre Saving e Cash disponíveis nos registros.
            </p>
          </div>

          <div className="space-y-7">
            {ganhosPorInsumo.map((d) => (
              <div key={d.nome}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-200">
                    {d.nome}
                  </span>

                  <span className="font-semibold text-white">
                    {moeda(d.total)}
                  </span>
                </div>

                <div className="flex h-3 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${(d.saving / maiorGanho) * 100}%`,
                    }}
                  />

                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${(d.cash / maiorGanho) * 100}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>
                    Saving: {moeda(d.saving)}
                  </span>
                  <span>
                    Cash: {moeda(d.cash)}
                  </span>
                </div>
              </div>
            ))}

            {ganhosPorInsumo.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                Nenhum registro encontrado.
              </p>
            )}
          </div>

          <div className="mt-5 flex gap-5 border-t border-slate-700 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              Saving
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              Cash
            </span>
          </div>
        </div>

        {/* GANHOS POR AC */}
        <div className={estiloCard}>
         <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-white">
              Ganhos por Ato Concessório
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Consolidação dos valores por número de AC.
            </p>
          </div>

          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {ganhosPorAC.map((d) => (
              <div
                key={d.ac}
                className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 transition hover:border-slate-600"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold text-slate-100">
                    {d.ac}
                  </span>

                  <span className="text-xs text-slate-500">
                    {d.quantidade} registro(s)
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Saving
                    </p>

                    <p className="mt-1 font-semibold text-blue-400">
                      {moeda(d.saving)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Cash
                    </p>

                    <p className="mt-1 font-semibold text-emerald-400">
                      {moeda(d.cash)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {ganhosPorAC.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                Nenhum registro encontrado.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* TABELA POR INSUMO */}
      <section className={estiloCard}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-white">
              Detalhamento dos ganhos por insumo
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Tributos e valores identificados por item e origem.
            </p>
          </div>

          <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
            {dadosFiltrados.length} registros
          </span>
        </div>

        <div className="max-h-[380px] overflow-auto rounded-lg border border-slate-700">
          <table className="min-w-[1450px] w-full border-collapse">
            <thead>
              <tr>
                {[
                  'Planta',
                  'Nº AC',
                  'Item',
                  'Insumo',
                  'NCM',
                  'Unidade',
                  'Origem',
                  'II',
                  'IPI',
                  'PIS',
                  'COFINS',
                  'AFRMM',
                  'ICMS',
                  'Saving',
                  'Cash',
                ].map((titulo) => (
                  <th key={titulo} className={estiloTh}>
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dadosFiltrados.map((d) => (
                <tr
                  key={d.id}
                  className="transition hover:bg-slate-700/40"
                >
                  <td className={estiloTd}>{d.planta}</td>

                  <td className={`${estiloTd} font-medium text-white`}>
                    {d.ac}
                  </td>

                  <td className={estiloTd}>{d.item}</td>
                  <td className={estiloTd}>{d.insumo}</td>
                  <td className={estiloTd}>{d.ncm}</td>
                  <td className={estiloTd}>{d.unidade}</td>
                  <td className={estiloTd}>{d.origem}</td>
                  <td className={estiloTd}>{moeda(d.ii)}</td>
                  <td className={estiloTd}>{moeda(d.ipi)}</td>
                  <td className={estiloTd}>{moeda(d.pis)}</td>
                  <td className={estiloTd}>{moeda(d.cofins)}</td>
                  <td className={estiloTd}>{moeda(d.afrmm)}</td>
                  <td className={estiloTd}>{moeda(d.icms)}</td>

                  <td className={`${estiloTd} font-semibold text-blue-400`}>
                    {moeda(d.saving)}
                  </td>

                  <td className={`${estiloTd} font-semibold text-emerald-400`}>
                    {moeda(d.cash)}
                  </td>
                </tr>
              ))}

              {dadosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={15}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>

      {/* TABELA DE PROCESSOS */}
      <section className={estiloCard}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-white">
            Ganhos por processo (DI / DUIMP / NF)
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Identificação dos processos relacionados aos registros filtrados.
          </p>
        </div>

        <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-700">
          <table className="min-w-[850px] w-full border-collapse">
            <thead>
              <tr>
                {[
                  'Processo',
                  'Nº AC',
                  'Item',
                  'Insumo',
                  'Origem',
                  'Data',
                  'Saving',
                  'Cash',
                ].map((titulo) => (
                  <th key={titulo} className={estiloTh}>
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dadosFiltrados.map((d) => (
                <tr
                  key={d.id}
                  className="transition hover:bg-slate-700/40"
                >
                  <td className={`${estiloTd} font-medium text-white`}>
                    {d.processo}
                  </td>

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
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum processo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* RODAPÉ INFORMATIVO */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">
          Observação sobre os cálculos:
        </strong>{' '}
        Saving considera II + AFRMM na importação. Cash considera IPI + PIS + COFINS.
        O ICMS é exibido separadamente quando há valor disponível na nota fiscal.
        Os registros nacionais não possuem valor de II no mock atual, e os registros
        de importação não possuem valor calculado de ICMS. Os valores estimados e a
        metodologia definitiva de ICMS ainda precisam ser validados.
      </div>
    </div>
  )
}

export default ControleGanhos
