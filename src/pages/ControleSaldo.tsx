
import { useMemo, useState } from 'react'
import { dataBR } from '../utils/formatters'
import PageHeader from '../components/layout/PageHeader'
import KpiCard from '../components/dashboard/KpiCard'
import DataTable from '../components/dashboard/DataTable'
import type { DataTableColumn } from '../types/dashboard'
import FilterField from '../components/dashboard/FilterField'
import BarChart from '../components/dashboard/BarChart'
import { drawbackMock, drawbackImpMock, drawbackResumoImpMock } from '../mocks/tables'

type RegistroSaldo = {
  id: string
  cliente: string
  ac: string
  item: string
  insumo: string
  ncm: string
  unidade: string
  modalidade: string
  processo: string
  data: string
  situacao: string
  quantidadeAprovada: number
  quantidadeRealizada: number
  quantidadeSaldo: number
  valorAprovado: number
  valorRealizado: number
  valorSaldo: number
  percentualUtilizado: number
}

const numero = (valor: unknown): number => {
  const convertido = Number(valor ?? 0)
  return Number.isFinite(convertido) ? convertido : 0
}

const texto = (valor: unknown): string => String(valor ?? '')

const formatarQuantidade = (valor: number) =>
  `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} KG`

const formatarUSD = (valor: number) =>
  valor.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const colunasSaldo: DataTableColumn<RegistroSaldo>[] = [
  { key: 'cliente', label: 'Planta / Cliente' },
  { key: 'ac', label: 'Nº AC', render: (v) => <span className="font-medium text-white">{String(v ?? '—')}</span> },
  { key: 'item', label: 'Item' },
  { key: 'insumo', label: 'Insumo' },
  { key: 'ncm', label: 'NCM' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'quantidadeAprovada', label: 'Qtd. aprovada', render: (v) => formatarQuantidade(Number(v ?? 0)) },
  { key: 'quantidadeRealizada', label: 'Qtd. realizada', render: (v) => <span className="text-emerald-400">{formatarQuantidade(Number(v ?? 0))}</span> },
  { key: 'quantidadeSaldo', label: 'Saldo quantidade', render: (v) => <span className="font-semibold text-amber-400">{formatarQuantidade(Number(v ?? 0))}</span> },
  { key: 'valorAprovado', label: 'Valor aprovado', render: (v) => formatarUSD(Number(v ?? 0)) },
  { key: 'valorRealizado', label: 'Valor realizado', render: (v) => formatarUSD(Number(v ?? 0)) },
  { key: 'valorSaldo', label: 'Saldo valor', render: (v) => <span className="font-semibold text-amber-400">{formatarUSD(Number(v ?? 0))}</span> },
  { key: 'percentualUtilizado', label: 'Utilizado', render: (v) => <span className="font-semibold text-blue-400">{Number(v ?? 0).toFixed(1)}%</span> },
]

function ControleSaldo() {
  const [clienteSelecionado, setClienteSelecionado] = useState('Todos')
  const [acSelecionado, setAcSelecionado] = useState('Todos')
  const [itemSelecionado, setItemSelecionado] = useState('Todos')
  const [insumoSelecionado, setInsumoSelecionado] = useState('Todos')
  const [ncmSelecionado, setNcmSelecionado] = useState('Todos')
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState('Todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const registros = useMemo<RegistroSaldo[]>(() => {
    return drawbackMock
      .filter((ato) => texto(ato.SITUACAO).toLowerCase() === 'ativo')
      .map((ato) => {
        const ac = texto(ato.NUMERO_DRAWBACK)
        const item = texto(ato.NRO_ITEM)
        const resumos = drawbackResumoImpMock.filter((r) => texto(r.NUMERO_DRAWBACK) === ac && texto(r.NRO_ITEM_IMP) === item)
        const importacoes = drawbackImpMock.filter((r) => texto(r.NUMERO_DRAWBACK) === ac && texto(r.NRO_ITEM) === item)

        const resumosFiltrados = resumos.filter((r) => {
          const data = texto(r.DATA_DESEMBARACO)
          return (!dataInicio || (data && data >= dataInicio)) && (!dataFim || (data && data <= dataFim))
        })

        const importacoesFiltradas = importacoes.filter((r) => {
          const data = texto(r.DATA_DESEMBARACO)
          return (!dataInicio || (data && data >= dataInicio)) && (!dataFim || (data && data <= dataFim))
        })

        const quantidadeAprovada = numero(ato.QUANTIDADE)
        const quantidadeRealizada = resumosFiltrados.reduce((total, r) => total + numero(r.QUANTIDADE_EST), 0)
        const valorAprovado = numero(ato.VALOR)
        const valorRealizado = importacoesFiltradas.reduce((total, r) => total + numero(r.ADI_VMLE_USS), 0)
        const quantidadeSaldo = quantidadeAprovada - quantidadeRealizada
        const valorSaldo = valorAprovado - valorRealizado

        return {
          id: `${ac}-${item}`,
          cliente: texto(ato.CLIENTE_CIDADE || ato.CLIENTE),
          ac,
          item,
          insumo: texto(ato.NOME_COMERCIAL),
          ncm: texto(ato.NCM_CODIGO),
          unidade: texto(ato.UNID_ESTAT || 'KG'),
          modalidade: texto(ato.MODALIDADE),
          processo: texto(importacoesFiltradas[0]?.NRO_DECLARACAO),
          data: texto(importacoesFiltradas[0]?.DATA_DESEMBARACO),
          situacao: texto(importacoesFiltradas[0]?.SITUACAO_DI),
          quantidadeAprovada,
          quantidadeRealizada,
          quantidadeSaldo,
          valorAprovado,
          valorRealizado,
          valorSaldo,
          percentualUtilizado: quantidadeAprovada > 0 ? (quantidadeRealizada / quantidadeAprovada) * 100 : 0,
        }
      })
  }, [dataInicio, dataFim])

  const clientes = useMemo(() => [...new Set(registros.map((r) => r.cliente))], [registros])
  const atos = useMemo(() => [...new Set(registros.map((r) => r.ac))], [registros])
  const itens = useMemo(() => [...new Set(registros.map((r) => r.item))], [registros])
  const insumos = useMemo(() => [...new Set(registros.map((r) => r.insumo))], [registros])
  const ncms = useMemo(() => [...new Set(registros.map((r) => r.ncm))], [registros])
  const modalidades = useMemo(() => [...new Set(registros.map((r) => r.modalidade))], [registros])

  const dadosFiltrados = useMemo(() => registros.filter((r) =>
    (clienteSelecionado === 'Todos' || r.cliente === clienteSelecionado) &&
    (acSelecionado === 'Todos' || r.ac === acSelecionado) &&
    (itemSelecionado === 'Todos' || r.item === itemSelecionado) &&
    (insumoSelecionado === 'Todos' || r.insumo === insumoSelecionado) &&
    (ncmSelecionado === 'Todos' || r.ncm === ncmSelecionado) &&
    (modalidadeSelecionada === 'Todas' || r.modalidade === modalidadeSelecionada)
  ), [registros, clienteSelecionado, acSelecionado, itemSelecionado, insumoSelecionado, ncmSelecionado, modalidadeSelecionada])

  const indicadores = useMemo(() => dadosFiltrados.reduce((total, r) => ({
    quantidadeAprovada: total.quantidadeAprovada + r.quantidadeAprovada,
    quantidadeRealizada: total.quantidadeRealizada + r.quantidadeRealizada,
    quantidadeSaldo: total.quantidadeSaldo + r.quantidadeSaldo,
    valorAprovado: total.valorAprovado + r.valorAprovado,
    valorRealizado: total.valorRealizado + r.valorRealizado,
    valorSaldo: total.valorSaldo + r.valorSaldo,
  }), {
    quantidadeAprovada: 0,
    quantidadeRealizada: 0,
    quantidadeSaldo: 0,
    valorAprovado: 0,
    valorRealizado: 0,
    valorSaldo: 0,
  }), [dadosFiltrados])

  const dadosPorInsumo = useMemo(() => {
    const agrupados = new Map<string, { insumo: string; aprovado: number; realizado: number; saldo: number }>()
    dadosFiltrados.forEach((r) => {
      const atual = agrupados.get(r.insumo) ?? { insumo: r.insumo, aprovado: 0, realizado: 0, saldo: 0 }
      atual.aprovado += r.quantidadeAprovada
      atual.realizado += r.quantidadeRealizada
      atual.saldo += r.quantidadeSaldo
      agrupados.set(r.insumo, atual)
    })
    return [...agrupados.values()]
  }, [dadosFiltrados])

  const dadosValorPorInsumo = useMemo(() => {
    const agrupados = new Map<string, { insumo: string; aprovado: number; realizado: number; saldo: number }>()
    dadosFiltrados.forEach((r) => {
      const atual = agrupados.get(r.insumo) ?? { insumo: r.insumo, aprovado: 0, realizado: 0, saldo: 0 }
      atual.aprovado += r.valorAprovado
      atual.realizado += r.valorRealizado
      atual.saldo += r.valorSaldo
      agrupados.set(r.insumo, atual)
    })
    return [...agrupados.values()]
  }, [dadosFiltrados])

  const processos = useMemo(() => drawbackImpMock.filter((imp) => {
    const registro = dadosFiltrados.find((r) => r.ac === texto(imp.NUMERO_DRAWBACK) && r.item === texto(imp.NRO_ITEM))
    const data = texto(imp.DATA_DESEMBARACO)
    return Boolean(registro) && (!dataInicio || (data && data >= dataInicio)) && (!dataFim || (data && data <= dataFim))
  }).map((imp, index) => ({
    id: `${texto(imp.NUMERO_DRAWBACK)}-${texto(imp.NRO_ITEM)}-${index}`,
    processo: texto(imp.NRO_DECLARACAO),
    ac: texto(imp.NUMERO_DRAWBACK),
    item: texto(imp.NRO_ITEM),
    insumo: texto(imp.NOME_COMERCIAL),
    ncm: texto(imp.NCM_CODIGO),
    data: texto(imp.DATA_DESEMBARACO),
    quantidade: numero(imp.ADICAO_QTD_ESTATISTICA),
    valor: numero(imp.ADI_VMLE_USS),
    situacao: texto(imp.SITUACAO_DI),
  })), [dadosFiltrados, dataInicio, dataFim])

  const limparFiltros = () => {
    setClienteSelecionado('Todos')
    setAcSelecionado('Todos')
    setItemSelecionado('Todos')
    setInsumoSelecionado('Todos')
    setNcmSelecionado('Todos')
    setModalidadeSelecionada('Todas')
    setDataInicio('')
    setDataFim('')
  }

  const estiloSelect = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'
  const estiloCard = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-3 shadow-lg shadow-black/10'
  const estiloTh = 'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'
  const estiloTd = 'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'

  return (
    <div className="flex min-h-screen flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      <PageHeader titulo="Controle de Saldo" descricao="Acompanhamento das quantidades e valores aprovados, realizados e disponíveis por planta, ato concessório e insumo." badge={<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">Dados demonstrativos</span>} />

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
              <select className={estiloSelect} value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)}>
                <option value="Todos">Todas</option>
                {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FilterField>
            <FilterField label="Ato concessório">
              <select className={estiloSelect} value={acSelecionado} onChange={(e) => setAcSelecionado(e.target.value)}>
                <option value="Todos">Todos</option>
                {atos.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </FilterField>
            <FilterField label="Item">
              <select className={estiloSelect} value={itemSelecionado} onChange={(e) => setItemSelecionado(e.target.value)}>
                <option value="Todos">Todos</option>
                {itens.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </FilterField>
            <FilterField label="Modalidade">
              <select className={estiloSelect} value={modalidadeSelecionada} onChange={(e) => setModalidadeSelecionada(e.target.value)}>
                <option value="Todas">Todas</option>
                {modalidades.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FilterField>
            <FilterField label="Insumo">
              <select className={estiloSelect} value={insumoSelecionado} onChange={(e) => setInsumoSelecionado(e.target.value)}>
                <option value="Todos">Todos</option>
                {insumos.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </FilterField>
            <FilterField label="NCM">
              <select className={estiloSelect} value={ncmSelecionado} onChange={(e) => setNcmSelecionado(e.target.value)}>
                <option value="Todos">Todos</option>
                {ncms.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </FilterField>
            <FilterField label="Data inicial">
              <input type="date" className={estiloSelect} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </FilterField>
            <FilterField label="Data final">
              <input type="date" className={estiloSelect} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </FilterField>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Indicadores de quantidade</h2>
          <p className="mt-1 text-sm text-slate-400">Quantidades aprovadas, realizadas e disponíveis.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KpiCard titulo="Quantidade aprovada" valor={formatarQuantidade(indicadores.quantidadeAprovada)} descricao="Total autorizado" variante="blue" />
          <KpiCard titulo="Quantidade realizada" valor={formatarQuantidade(indicadores.quantidadeRealizada)} descricao="Total utilizado" variante="green" />
          <KpiCard titulo="Saldo disponível" valor={formatarQuantidade(indicadores.quantidadeSaldo)} descricao="Aprovado menos realizado" variante="amber" />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Indicadores de valor</h2>
          <p className="mt-1 text-sm text-slate-400">Valores aprovados, realizados e disponíveis em USD.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KpiCard titulo="Valor aprovado" valor={formatarUSD(indicadores.valorAprovado)} descricao="Total autorizado" variante="blue" />
          <KpiCard titulo="Valor realizado" valor={formatarUSD(indicadores.valorRealizado)} descricao="Total utilizado" variante="green" />
          <KpiCard titulo="Saldo em valor" valor={formatarUSD(indicadores.valorSaldo)} descricao="Aprovado menos realizado" variante="amber" />
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Análise de saldo por insumo</h2>
          <p className="mt-1 text-sm text-slate-400">Comparação das quantidades e dos valores aprovados, realizados e disponíveis.</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <BarChart titulo="Quantidade estatística por insumo" descricao="Aprovado x Realizado x Saldo disponível" dados={dadosPorInsumo} categoriaKey="insumo" series={[
            { dataKey: 'aprovado', nome: 'Aprovado', cor: '#3B82F6' },
            { dataKey: 'realizado', nome: 'Realizado', cor: '#10B981' },
            { dataKey: 'saldo', nome: 'Saldo disponível', cor: '#F59E0B' },
          ]} altura={420} />
          <BarChart titulo="Valor em USD por insumo" descricao="Valor aprovado x Realizado x Saldo disponível" dados={dadosValorPorInsumo} categoriaKey="insumo" series={[
            { dataKey: 'aprovado', nome: 'Aprovado', cor: '#3B82F6' },
            { dataKey: 'realizado', nome: 'Realizado', cor: '#10B981' },
            { dataKey: 'saldo', nome: 'Saldo disponível', cor: '#F59E0B' },
          ]} altura={420} />
        </div>
      </section>

      <section className={estiloCard}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-white">Controle de saldo por item</h2>
            <p className="mt-1 text-xs text-slate-400">Quantidades e valores aprovados, realizados e disponíveis por ato concessório.</p>
          </div>
          <span className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">{dadosFiltrados.length} registros</span>
        </div>
        <DataTable columns={colunasSaldo} data={dadosFiltrados} rowKey={(d) => d.id} mensagemVazia="Nenhum registro encontrado para os filtros selecionados." alturaMaxima="380px" />
      </section>

      <section className={estiloCard}>
        <div className="mb-6">
          <h2 className="font-semibold text-white">Controle de saldo por processo (DI / DUIMP)</h2>
          <p className="mt-1 text-xs text-slate-400">Detalhamento dos processos de importação relacionados aos atos filtrados.</p>
        </div>
        <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-700">
          <table className="w-full min-w-[950px] border-collapse">
            <thead>
              <tr>
                {['Processo', 'Nº AC', 'Item', 'Insumo', 'NCM', 'Data', 'Quantidade realizada', 'Valor realizado', 'Situação'].map((titulo) => <th key={titulo} className={estiloTh}>{titulo}</th>)}
              </tr>
            </thead>
            <tbody>
              {processos.map((p) => (
                <tr key={p.id} className="transition hover:bg-slate-700/40">
                  <td className={`${estiloTd} font-medium text-white`}>{p.processo || '—'}</td>
                  <td className={estiloTd}>{p.ac}</td>
                  <td className={estiloTd}>{p.item}</td>
                  <td className={estiloTd}>{p.insumo}</td>
                  <td className={estiloTd}>{p.ncm}</td>
                  <td className={estiloTd}>{dataBR(p.data)}</td>
                  <td className={estiloTd}>{formatarQuantidade(p.quantidade)}</td>
                  <td className={estiloTd}>{formatarUSD(p.valor)}</td>
                  <td className={estiloTd}>{p.situacao || '—'}</td>
                </tr>
              ))}
              {processos.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">Nenhum processo encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Observação sobre os cálculos:</strong>{' '}
        O saldo de quantidade corresponde à quantidade aprovada menos a quantidade realizada. O saldo de valor corresponde ao valor aprovado menos o valor realizado. Os valores são demonstrativos e dependem da validação dos campos utilizados como base de realização.
      </div>
    </div>
  )
}

export default ControleSaldo
