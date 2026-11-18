
import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { FileWarning, CheckCircle2, AlertTriangle, ClipboardList } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import { drawbackMock, drawbackImpMock, drawbackNfMock } from '../mocks/tables'

type Registro = Record<string, unknown>
type StatusAditivo = 'ATUALIZAR' | 'NÃO' | 'SEM BASE' | 'VALIDAR MOEDA'

type LinhaAditivo = {
    id: string; planta: string; ac: string; item: string; insumo: string; ncm: string; unidade: string
    origem: 'Importação' | 'Mercado Nacional'; processo: string; data: string
    quantidadeAprovada: number; valorAprovado: number; unitarioAprovado: number | null
    quantidadeRealizada: number; valorRealizado: number | null; unitarioRealizado: number | null
    status: StatusAditivo
}

const texto = (v: unknown) => v === null || v === undefined ? '' : String(v)
const numero = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const numeroOpcional = (v: unknown): number | null => v === null || v === undefined || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null
const dataISO = (v: unknown) => { const s = texto(v); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : '' }
const dataBR = (v: string) => v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : v || '—'
const formatarQuantidade = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v)
const formatarValor = (v: number | null) => v === null ? '—' : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v)

const cardClass = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10'
const estiloTh = 'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'
const estiloTd = 'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'
const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-400'

export default function ControleAditivos() {
    const [planta, setPlanta] = useState('')
    const [ac, setAc] = useState('')
    const [item, setItem] = useState('')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [statusFiltro, setStatusFiltro] = useState('Todos')

    const dadosBase = useMemo(() => {
        const atos = (drawbackMock as unknown as Registro[]).filter((a) => {
            const situacao = texto(a.SITUACAO).toUpperCase()
            return !situacao || ['ATIVO', 'ABERTO', 'VIGENTE'].includes(situacao)
        })

        const localizarAto = (registro: Registro) => atos.find((a) =>
            texto(a.NUMERO_DRAWBACK) === texto(registro.NUMERO_DRAWBACK) &&
            texto(a.NRO_ITEM) === texto(registro.NRO_ITEM)
        )

        const criarLinha = (registro: Registro, origem: 'Importação' | 'Mercado Nacional', ato?: Registro): LinhaAditivo => {
            const quantidadeAprovada = numero(ato?.QUANTIDADE)
            const valorAprovado = numero(ato?.VALOR)
            const quantidadeRealizada = origem === 'Importação'
                ? numero(registro.ADICAO_QTD_ESTATISTICA)
                : numero(registro.QUANTIDADE_ESTATISTICA)

            const valorRealizado = origem === 'Importação'
                ? numeroOpcional(registro.ADI_VMLE_USS ?? registro.ITEM_VMLE_USS)
                : numeroOpcional(registro.VALOR_TOTAL_NF) ??
                  (numeroOpcional(registro.VALOR_UNITARIO) !== null
                    ? numero(registro.VALOR_UNITARIO) * quantidadeRealizada
                    : null)

            const unitarioAprovado = quantidadeAprovada > 0 ? valorAprovado / quantidadeAprovada : null
            const unitarioRealizado = valorRealizado !== null && quantidadeRealizada > 0
                ? valorRealizado / quantidadeRealizada
                : null

            let status: StatusAditivo = 'SEM BASE'
            if (origem === 'Mercado Nacional') status = 'VALIDAR MOEDA'
            else if (unitarioAprovado !== null && unitarioRealizado !== null) {
                status = unitarioRealizado >= unitarioAprovado ? 'ATUALIZAR' : 'NÃO'
            }

            const acRegistro = texto(registro.NUMERO_DRAWBACK)
            const itemRegistro = texto(registro.NRO_ITEM)

            return {
                id: `${origem}-${acRegistro}-${itemRegistro}-${texto(registro.NRO_DECLARACAO || registro.NUMERO_NF)}`,
                planta: texto(ato?.CLIENTE_CIDADE ?? registro.CLIENTE ?? 'Não identificada'),
                ac: acRegistro, item: itemRegistro,
                insumo: texto(registro.NOME_COMERCIAL ?? registro.DESCRICAO ?? ato?.NOME_COMERCIAL ?? 'Insumo não identificado'),
                ncm: texto(registro.NCM_CODIGO ?? registro.NRO_NCM ?? ato?.NCM_CODIGO),
                unidade: texto(ato?.UNID_ESTAT ?? registro.UNME_ESTATISTICA ?? '—'),
                origem,
                processo: origem === 'Importação'
                    ? texto(registro.NRO_DECLARACAO ?? 'Não informado')
                    : `NF ${texto(registro.NUMERO_NF ?? 'Não informada')}`,
                data: dataISO(origem === 'Importação' ? registro.DATA_DESEMBARACO : registro.DATA_EMISSAO),
                quantidadeAprovada, valorAprovado, unitarioAprovado,
                quantidadeRealizada, valorRealizado, unitarioRealizado, status,
            }
        }

        const importacoes = (drawbackImpMock as unknown as Registro[]).map((r) => criarLinha(r, 'Importação', localizarAto(r)))
        const notas = (drawbackNfMock as unknown as Registro[]).map((r) => criarLinha(r, 'Mercado Nacional', localizarAto(r)))

        return [...importacoes, ...notas].filter((d) => d.ac && d.item)
    }, [])

    const plantas = [...new Set(dadosBase.map((d) => d.planta).filter(Boolean))].sort()
    const atos = [...new Set(dadosBase.map((d) => d.ac).filter(Boolean))].sort()
    const itens = [...new Set(dadosBase.map((d) => d.item).filter(Boolean))].sort()

    const dadosFiltrados = dadosBase.filter((d) =>
        (!planta || d.planta === planta) &&
        (!ac || d.ac === ac) &&
        (!item || d.item === item) &&
        (!dataInicio || d.data >= dataInicio) &&
        (!dataFim || d.data <= dataFim) &&
        (statusFiltro === 'Todos' || d.status === statusFiltro)
    )

    // Consolida os processos por AC, item e origem, sem somar moedas diferentes.
    const resumoItens = useMemo(() => {
        const grupos = new Map<string, {
            base: LinhaAditivo; quantidadeRealizada: number; valorRealizado: number
            possuiValor: boolean; possuiValorAusente: boolean
        }>()

        dadosFiltrados.forEach((d) => {
            const chave = `${d.ac}-${d.item}-${d.origem}`
            const atual = grupos.get(chave) ?? {
                base: d, quantidadeRealizada: 0, valorRealizado: 0,
                possuiValor: false, possuiValorAusente: false,
            }
            atual.quantidadeRealizada += d.quantidadeRealizada
            if (d.valorRealizado !== null) {
                atual.valorRealizado += d.valorRealizado
                atual.possuiValor = true
            } else atual.possuiValorAusente = true
            grupos.set(chave, atual)
        })

        return [...grupos.values()].map((g) => {
            const d = g.base
            const valorRealizado = g.possuiValor && !g.possuiValorAusente ? g.valorRealizado : null
            const unitarioRealizado = valorRealizado !== null && g.quantidadeRealizada > 0
                ? valorRealizado / g.quantidadeRealizada
                : null
            let status: StatusAditivo = 'SEM BASE'
            if (d.origem === 'Mercado Nacional') status = 'VALIDAR MOEDA'
            else if (d.unitarioAprovado !== null && unitarioRealizado !== null) {
                status = unitarioRealizado >= d.unitarioAprovado ? 'ATUALIZAR' : 'NÃO'
            }
            return { ...d, quantidadeRealizada: g.quantidadeRealizada, valorRealizado, unitarioRealizado, status }
        })
    }, [dadosFiltrados])

    const itensAjustar = resumoItens.filter((d) => d.status === 'ATUALIZAR')
    const totalAtos = new Set(resumoItens.map((d) => d.ac)).size
    const totalItensAjustar = new Set(itensAjustar.map((d) => `${d.ac}-${d.item}`)).size
    const totalSemAjuste = resumoItens.filter((d) => d.status === 'NÃO').length
    const totalValidar = resumoItens.filter((d) => d.status === 'SEM BASE' || d.status === 'VALIDAR MOEDA').length
    const atosAjustar = new Set(itensAjustar.map((d) => d.ac)).size

    const dadosGrafico = resumoItens.filter((d) =>
        d.status !== 'VALIDAR MOEDA' && d.unitarioAprovado !== null && d.unitarioRealizado !== null
    ).map((d) => ({
        nome: `${d.ac} / Item ${d.item}`,
        aprovado: d.unitarioAprovado ?? 0,
        realizado: d.unitarioRealizado ?? 0,
    }))

    const limparFiltros = () => {
        setPlanta(''); setAc(''); setItem('')
        setDataInicio(''); setDataFim(''); setStatusFiltro('Todos')
    }

    const badgeStatus = (status: StatusAditivo) => {
        const classes: Record<StatusAditivo, string> = {
            ATUALIZAR: 'bg-amber-500/15 text-amber-400',
            NÃO: 'bg-emerald-500/15 text-emerald-400',
            'SEM BASE': 'bg-slate-500/20 text-slate-300',
            'VALIDAR MOEDA': 'bg-orange-500/15 text-orange-300',
        }
        return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{status}</span>
    }

    return (
        <div className="flex min-h-screen flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
            <PageHeader titulo="Controle de Aditivos" descricao="Análise dos valores unitários aprovados e realizados por ato concessório, item e processo." badge={<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">Dados demonstrativos</span>} />

            {/* Filtros */}
            <section className={cardClass}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-white">Filtros de consulta</h2>
                        <p className="mt-1 text-xs text-slate-400">Refine a análise por planta, ato, item, período e situação.</p>
                    </div>
                    <button onClick={limparFiltros} className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">Limpar filtros</button>
                </div>
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <div>
                        <label className={labelClass}>Planta</label>
                        <select value={planta} onChange={(e) => setPlanta(e.target.value)} className={inputClass}>
                            <option value="">Todas</option>
                            {plantas.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Ato concessório</label>
                        <select value={ac} onChange={(e) => setAc(e.target.value)} className={inputClass}>
                            <option value="">Todos</option>
                            {atos.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Item</label>
                        <select value={item} onChange={(e) => setItem(e.target.value)} className={inputClass}>
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
                    <div>
                        <label className={labelClass}>Necessidade de aditivo</label>
                        <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className={inputClass}>
                            <option>Todos</option>
                            <option>ATUALIZAR</option>
                            <option>NÃO</option>
                            <option>SEM BASE</option>
                            <option>VALIDAR MOEDA</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Indicadores */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Atos concessórios</p>
                        <ClipboardList className="text-blue-400" size={21} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{totalAtos}</p>
                    <p className="mt-1 text-xs text-slate-500">{atosAjustar} com itens para ajuste</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Itens a serem ajustados</p>
                        <FileWarning className="text-amber-400" size={21} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{totalItensAjustar}</p>
                    <p className="mt-1 text-xs text-slate-500">Valor realizado maior ou igual ao aprovado</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Sem necessidade de ajuste</p>
                        <CheckCircle2 className="text-emerald-400" size={21} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{totalSemAjuste}</p>
                    <p className="mt-1 text-xs text-slate-500">Valor realizado abaixo do aprovado</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Pendentes de validação</p>
                        <AlertTriangle className="text-orange-400" size={21} />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-white">{totalValidar}</p>
                    <p className="mt-1 text-xs text-slate-500">Dados ou moeda a confirmar</p>
                </div>
            </section>

            {/* Gráfico */}
            <section className={cardClass}>
                <div className="mb-5">
                    <h2 className="font-semibold text-white">Valor unitário aprovado x realizado</h2>
                    <p className="mt-1 text-xs text-slate-400">Comparação por ato concessório e item. Registros sem base suficiente ou com moeda pendente não são exibidos.</p>
                </div>
                {dadosGrafico.length > 0 ? (
                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosGrafico} margin={{ top: 15, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '10px', color: '#F1F5F9' }} formatter={(v) => formatarValor(Number(v))} />
                                <Legend />
                                <Bar dataKey="aprovado" name="Unitário aprovado" fill="#4472C4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="realizado" name="Unitário realizado" fill="#72A98B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">Não há dados suficientes para montar o gráfico.</div>}
            </section>

            {/* Resumo por insumo e ato */}
            <section className={cardClass}>
                <div className="mb-5">
                    <h2 className="font-semibold text-white">Valores unitários por insumo e ato concessório</h2>
                    <p className="mt-1 text-xs text-slate-400">{resumoItens.length} item(ns) encontrado(s)</p>
                </div>
                <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-700">
                    <table className="w-full min-w-[1250px] text-left text-sm">
                        <thead><tr>
                            {['Planta', 'Nº AC', 'Item', 'Insumo', 'Origem', 'Qtd. aprovada', 'Valor aprovado', 'Unitário aprovado', 'Qtd. realizada', 'Valor realizado', 'Unitário realizado', 'Atualizar valor?'].map((h) => <th key={h} className={estiloTh}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {resumoItens.map((d, i) => (
                                <tr key={`${d.ac}-${d.item}-${d.origem}-${i}`} className="transition hover:bg-slate-700/30">
                                    <td className={estiloTd}>{d.planta}</td>
                                    <td className={`${estiloTd} font-medium text-white`}>{d.ac}</td>
                                    <td className={estiloTd}>{d.item}</td>
                                    <td className={estiloTd}>{d.insumo}</td>
                                    <td className={estiloTd}>{d.origem}</td>
                                    <td className={estiloTd}>{formatarQuantidade(d.quantidadeAprovada)} {d.unidade}</td>
                                    <td className={estiloTd}>{formatarValor(d.valorAprovado)}</td>
                                    <td className={estiloTd}>{formatarValor(d.unitarioAprovado)}</td>
                                    <td className={estiloTd}>{formatarQuantidade(d.quantidadeRealizada)} {d.unidade}</td>
                                    <td className={estiloTd}>{formatarValor(d.valorRealizado)}</td>
                                    <td className={estiloTd}>{formatarValor(d.unitarioRealizado)}</td>
                                    <td className={estiloTd}>{badgeStatus(d.status)}</td>
                                </tr>
                            ))}
                            {resumoItens.length === 0 && <tr><td colSpan={12} className="px-4 py-10 text-center text-slate-500">Nenhum registro encontrado.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Detalhamento por processo */}
            <section className={cardClass}>
                <div className="mb-5">
                    <h2 className="font-semibold text-white">Valores unitários por DI / DUIMP / NF</h2>
                    <p className="mt-1 text-xs text-slate-400">{dadosFiltrados.length} processo(s) encontrado(s)</p>
                </div>
                <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-700">
                    <table className="w-full min-w-[1200px] text-left text-sm">
                        <thead><tr>
                            {['Planta', 'Nº AC', 'Item', 'Processo', 'Data', 'Insumo', 'NCM', 'Origem', 'Qtd. aprovada', 'Unitário aprovado', 'Qtd. realizada', 'Valor realizado', 'Unitário realizado', 'Atualizar valor?'].map((h) => <th key={h} className={estiloTh}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {dadosFiltrados.map((d) => (
                                <tr key={d.id} className="transition hover:bg-slate-700/30">
                                    <td className={estiloTd}>{d.planta}</td>
                                    <td className={`${estiloTd} font-medium text-white`}>{d.ac}</td>
                                    <td className={estiloTd}>{d.item}</td>
                                    <td className={estiloTd}>{d.processo}</td>
                                    <td className={estiloTd}>{dataBR(d.data)}</td>
                                    <td className={estiloTd}>{d.insumo}</td>
                                    <td className={estiloTd}>{d.ncm || '—'}</td>
                                    <td className={estiloTd}>{d.origem}</td>
                                    <td className={estiloTd}>{formatarQuantidade(d.quantidadeAprovada)} {d.unidade}</td>
                                    <td className={estiloTd}>{formatarValor(d.unitarioAprovado)}</td>
                                    <td className={estiloTd}>{formatarQuantidade(d.quantidadeRealizada)} {d.unidade}</td>
                                    <td className={estiloTd}>{formatarValor(d.valorRealizado)}</td>
                                    <td className={estiloTd}>{formatarValor(d.unitarioRealizado)}</td>
                                    <td className={estiloTd}>{badgeStatus(d.status)}</td>
                                </tr>
                            ))}
                            {dadosFiltrados.length === 0 && <tr><td colSpan={14} className="px-4 py-10 text-center text-slate-500">Nenhum processo encontrado.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            <p className="text-xs text-slate-500">Atenção: os valores são apresentados conforme a origem da base, sem conversão cambial. Registros de mercado nacional permanecem como “VALIDAR MOEDA” até a confirmação da moeda utilizada.</p>
        </div>
    )
}
