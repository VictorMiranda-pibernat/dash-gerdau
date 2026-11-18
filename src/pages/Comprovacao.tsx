
import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Package, TrendingUp, AlertCircle, CheckCircle2, Search } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import { drawbackMock } from '../mocks/tables/drawback.mock'
import { drawbackResumoImpMock } from '../mocks/tables/drawback-resumo-imp.mock'
import { drawbackResumoExpMock } from '../mocks/tables/drawback-resumo-exp.mock'

// Campo configurável para validação com o analista.
const CAMPO_QUANTIDADE_COMPROVADA_INSUMO = 'QUANTIDADE_EST'

type Aba = 'insumos' | 'produtos'
const numero = (valor: unknown): number => { const convertido = Number(valor); return Number.isFinite(convertido) ? convertido : 0 }
const texto = (valor: unknown): string => valor === null || valor === undefined ? '' : String(valor)
const formatarQuantidade = (valor: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor)
const formatarPercentual = (valor: number) => `${valor.toFixed(1).replace('.', ',')}%`

const cardClass = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10'
const estiloTh = 'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'
const estiloTd = 'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'

export default function Comprovacao() {
    const [aba, setAba] = useState<Aba>('insumos')
    const [filtroPlanta, setFiltroPlanta] = useState('')
    const [filtroAC, setFiltroAC] = useState('')
    const [filtroItem, setFiltroItem] = useState('')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')

    // Insumos: resumo de importação + cadastro do ato concessório.
    const dadosInsumos = useMemo(() => drawbackResumoImpMock.map((registro) => {
        const ac = texto(registro.NUMERO_DRAWBACK)
        const item = texto(registro.NRO_ITEM_IMP)
        const cadastro = drawbackMock.find((d) => texto(d.NUMERO_DRAWBACK) === ac && texto(d.NRO_ITEM) === item)
        const realizada = numero(registro.QUANTIDADE_INSUMO)
        const comprovada = numero(registro[CAMPO_QUANTIDADE_COMPROVADA_INSUMO])
        return {
            planta: texto(registro.CLIENTE), ac, item,
            insumo: texto(cadastro?.NOME_COMERCIAL) || 'Não identificado',
            ncm: texto(cadastro?.NCM_CODIGO),
            unidade: texto(cadastro?.UNID_ESTAT) || 'KG',
            documento: texto(registro.NRO_DECLARACAO),
            data: texto(registro.DATA_DESEMBARACO),
            realizada, comprovada, saldo: realizada - comprovada,
            percentual: realizada > 0 ? (comprovada / realizada) * 100 : 0,
        }
    }), [])

    // Produtos: resumo de exportação + cadastro do ato concessório.
    const dadosProdutos = useMemo(() => drawbackResumoExpMock.map((registro) => {
        const ac = texto(registro.NUMERO_DRAWBACK)
        const item = texto(registro.ITEM_ATO_CONCESSORIO)
        const cadastro = drawbackMock.find((d) => texto(d.NUMERO_DRAWBACK) === ac && texto(d.NRO_ITEM) === item)
        const realizada = numero(registro.QUANTIDADE_ESTATISTICA)
        const utilizada = numero(registro.QUANTIDADE_COMPROVADA)
        return {
            planta: texto(registro.CLIENTE), ac, item,
            produto: texto(cadastro?.NOME_COMERCIAL) || 'Não identificado',
            ncm: texto(registro.NCM_CODIGO),
            due: texto(registro.NRO_DUE),
            situacao: texto(registro.SITUACAO_DUE),
            dataRegistro: texto(registro.DATA_REGISTRO),
            dataEmbarque: texto(registro.DATA_EMBARQUE),
            unidade: texto(registro.UNME_COMERCIALIZADA) || 'KG',
            realizada, utilizada, saldo: realizada - utilizada,
            valorRealizado: numero(registro.VALOR),
            valorUtilizado: numero(registro.VALOR_COMPROVADO),
            percentual: realizada > 0 ? (utilizada / realizada) * 100 : 0,
        }
    }), [])

    const dadosAtivos = aba === 'insumos' ? dadosInsumos : dadosProdutos
    const plantas = [...new Set(dadosAtivos.map((d) => d.planta).filter(Boolean))]
    const atos = [...new Set(dadosAtivos.map((d) => d.ac).filter(Boolean))]
    const itens = [...new Set(dadosAtivos.map((d) => d.item).filter(Boolean))]

    const dadosFiltrados = dadosAtivos.filter((d) => {
        const data = aba === 'insumos' ? (d as typeof dadosInsumos[number]).data : (d as typeof dadosProdutos[number]).dataRegistro
        const dentroDoPeriodo = (!dataInicio || data >= dataInicio) && (!dataFim || data <= dataFim)
        return (!filtroPlanta || d.planta === filtroPlanta) && (!filtroAC || d.ac === filtroAC) && (!filtroItem || d.item === filtroItem) && dentroDoPeriodo
    })

    const totalRealizado = dadosFiltrados.reduce((total, d) => total + d.realizada, 0)
    const totalComprovado = dadosFiltrados.reduce((total, d) => total + ('comprovada' in d ? d.comprovada : d.utilizada), 0)
    const saldoTotal = totalRealizado - totalComprovado
    const percentualTotal = totalRealizado > 0 ? (totalComprovado / totalRealizado) * 100 : 0

    const dadosGrafico = dadosFiltrados.map((d) => ({
        nome: `${d.ac} / Item ${d.item}`,
        realizada: d.realizada,
        comprovada: 'comprovada' in d ? d.comprovada : d.utilizada,
        saldo: d.saldo,
    }))

    const limparFiltros = () => {
        setFiltroPlanta('')
        setFiltroAC('')
        setFiltroItem('')
        setDataInicio('')
        setDataFim('')
    }

    const inputClass = 'w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-emerald-500'
    const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-400'

    return (
        <div className="flex min-h-screen flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
            <PageHeader titulo="Controle de Comprovação" descricao="Acompanhamento das quantidades realizadas, comprovadas e pendentes." badge={<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">Dados demonstrativos</span>} />

            {/* Abas */}
            <div className="flex flex-wrap gap-2 border-b border-slate-700">
                <button onClick={() => setAba('insumos')} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${aba === 'insumos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                    <Package size={17} /> Comprovação de Insumos
                </button>
                <button onClick={() => setAba('produtos')} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${aba === 'produtos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                    <TrendingUp size={17} /> Comprovação de Produtos
                </button>
            </div>

            {/* Filtros */}
            <section className={cardClass}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-white">Filtros de consulta</h2>
                        <p className="mt-1 text-xs text-slate-400">Utilize os campos abaixo para refinar os resultados.</p>
                    </div>
                    <button onClick={limparFiltros} className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">Limpar filtros</button>
                </div>
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                        <label className={labelClass}>Planta / Cliente</label>
                        <select value={filtroPlanta} onChange={(e) => setFiltroPlanta(e.target.value)} className={inputClass}>
                            <option value="">Todas</option>
                            {plantas.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Ato concessório</label>
                        <select value={filtroAC} onChange={(e) => setFiltroAC(e.target.value)} className={inputClass}>
                            <option value="">Todos</option>
                            {atos.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Item</label>
                        <select value={filtroItem} onChange={(e) => setFiltroItem(e.target.value)} className={inputClass}>
                            <option value="">Todos</option>
                            {itens.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Data inicial</label>
                        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Data final</label>
                        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
                    </div>
                </div>
            </section>

            {/* Indicadores */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Quantidade realizada</p>
                        <Package className="text-blue-400" size={20} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{formatarQuantidade(totalRealizado)}</p>
                    <p className="mt-1 text-xs text-slate-500">Unidade estatística</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">{aba === 'insumos' ? 'Quantidade comprovada' : 'Quantidade utilizada'}</p>
                        <CheckCircle2 className="text-emerald-400" size={20} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{formatarQuantidade(totalComprovado)}</p>
                    <p className="mt-1 text-xs text-slate-500">Unidade estatística</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Saldo a comprovar</p>
                        <AlertCircle className="text-amber-400" size={20} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{formatarQuantidade(saldoTotal)}</p>
                    <p className="mt-1 text-xs text-slate-500">Quantidade pendente</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">% de comprovação</p>
                        <TrendingUp className="text-emerald-400" size={20} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{formatarPercentual(percentualTotal)}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(percentualTotal, 100)}%` }} />
                    </div>
                </div>
            </section>

            {/* Gráfico */}
            <section className={cardClass}>
                <div className="mb-5">
                    <h2 className="font-semibold text-white">Evolução da comprovação</h2>
                    <p className="mt-1 text-xs text-slate-400">Comparativo entre quantidade realizada, comprovada e saldo por ato e item.</p>
                </div>
                {dadosGrafico.length > 0 ? (
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosGrafico} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '10px', color: '#F1F5F9' }} formatter={(value) => formatarQuantidade(Number(value))} />
                                <Legend />
                                <Bar dataKey="realizada" name="Realizada" fill="#4472C4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="comprovada" name={aba === 'insumos' ? 'Comprovada' : 'Utilizada'} fill="#72A98B" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="saldo" name="Saldo" fill="#E5A443" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">Nenhum dado encontrado para os filtros selecionados.</div>}
            </section>

            {/* Tabela detalhada */}
            <section className={cardClass}>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-white">{aba === 'insumos' ? 'Detalhamento por DI / Declaração' : 'Detalhamento por DUE'}</h2>
                        <p className="mt-1 text-xs text-slate-400">{dadosFiltrados.length} registro(s) encontrado(s)</p>
                    </div>
                </div>
                <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-700">
                    <table className="w-full min-w-[950px] text-left text-sm">
                        <thead>
                            <tr>
                                <th className={estiloTh}>Ato concessório</th>
                                <th className={estiloTh}>Item</th>
                                <th className={estiloTh}>{aba === 'insumos' ? 'Insumo' : 'Produto'}</th>
                                <th className={estiloTh}>{aba === 'insumos' ? 'DI' : 'DUE'}</th>
                                <th className={`${estiloTh} text-right`}>Realizada</th>
                                <th className={`${estiloTh} text-right`}>{aba === 'insumos' ? 'Comprovada' : 'Utilizada'}</th>
                                <th className={`${estiloTh} text-right`}>Saldo</th>
                                <th className={`${estiloTh} text-right`}>Comprovação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosFiltrados.map((d, index) => (
                                <tr key={`${d.ac}-${d.item}-${index}`} className="transition hover:bg-slate-700/30">
                                    <td className={`${estiloTd} font-medium text-slate-200`}>{d.ac}</td>
                                    <td className={estiloTd}>{d.item}</td>
                                    <td className={estiloTd}>{'insumo' in d ? d.insumo : d.produto}</td>
                                    <td className={estiloTd}>{'documento' in d ? d.documento : d.due}</td>
                                    <td className={`${estiloTd} text-right tabular-nums`}>{formatarQuantidade(d.realizada)}</td>
                                    <td className={`${estiloTd} text-right tabular-nums`}>{formatarQuantidade('comprovada' in d ? d.comprovada : d.utilizada)}</td>
                                    <td className={`${estiloTd} text-right tabular-nums`}>{formatarQuantidade(d.saldo)}</td>
                                    <td className={`${estiloTd} text-right`}>
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${d.percentual >= 100 ? 'bg-emerald-500/15 text-emerald-400' : d.percentual > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                                            {formatarPercentual(d.percentual)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {dadosFiltrados.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">Nenhum registro encontrado.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
