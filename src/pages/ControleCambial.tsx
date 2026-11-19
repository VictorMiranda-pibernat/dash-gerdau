
import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import FilterField from '../components/dashboard/FilterField'
import { drawbackMock } from '../mocks/tables'

type LinhaCambial = {
  id: string
  planta: string
  ac: string
  modalidade: string
  situacao: string
  dataAbertura: string
  dataVencimento: string
}

const texto = (valor: unknown) => String(valor ?? '').trim()

const normalizarData = (valor: unknown) => {
  const data = texto(valor)
  if (!data) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) return data.slice(0, 10)
  const partes = data.split('/')
  if (partes.length === 3) return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`
  return ''
}

const dataBR = (valor: string) => {
  if (!valor) return '—'
  const partes = valor.split('-')
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor
}

const dadosBase: LinhaCambial[] = drawbackMock.map((registro) => ({
  id: `${texto(registro.NUMERO_DRAWBACK)}-${texto(registro.NRO_ITEM)}`,
  planta: texto(registro.CLIENTE_CIDADE) || texto(registro.CLIENTE) || 'Não identificada',
  ac: texto(registro.NUMERO_DRAWBACK),
  modalidade: texto(registro.MODALIDADE) || 'Não informada',
  situacao: texto(registro.SITUACAO) || 'Não informada',
  dataAbertura: normalizarData(registro.DATA_ABERTURA),
  dataVencimento: normalizarData(registro.DATA_VENCIMENTO),
}))

const estiloSelect = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]'
const estiloCard = 'rounded-2xl border border-slate-700/80 bg-slate-800/70 !p-5 shadow-lg shadow-black/10'
const estiloTh = 'sticky top-0 z-10 whitespace-nowrap border-b border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-300'
const estiloTd = 'whitespace-nowrap border-b border-slate-700/60 px-4 py-3 text-sm text-slate-300'

function ControleCambial() {
  const [planta, setPlanta] = useState('Todas')
  const [ac, setAc] = useState('Todos')
  const [modalidade, setModalidade] = useState('Todas')
  const [situacao, setSituacao] = useState('Todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const dadosUnicos = useMemo(() => {
    const mapa = new Map<string, LinhaCambial>()
    dadosBase.forEach((item) => {
      if (item.ac && !mapa.has(item.ac)) mapa.set(item.ac, item)
    })
    return [...mapa.values()]
  }, [])

  const opcoesPlanta = useMemo(() => [...new Set(dadosUnicos.map((d) => d.planta))].sort(), [dadosUnicos])
  const opcoesAC = useMemo(() => [...new Set(dadosUnicos.map((d) => d.ac))].sort(), [dadosUnicos])
  const opcoesModalidade = useMemo(() => [...new Set(dadosUnicos.map((d) => d.modalidade))].sort(), [dadosUnicos])
  const opcoesSituacao = useMemo(() => [...new Set(dadosUnicos.map((d) => d.situacao))].sort(), [dadosUnicos])

  const dadosFiltrados = useMemo(() => dadosUnicos.filter((d) =>
    (planta === 'Todas' || d.planta === planta) &&
    (ac === 'Todos' || d.ac === ac) &&
    (modalidade === 'Todas' || d.modalidade === modalidade) &&
    (situacao === 'Todas' || d.situacao === situacao) &&
    (!dataInicio || !d.dataAbertura || d.dataAbertura >= dataInicio) &&
    (!dataFim || !d.dataAbertura || d.dataAbertura <= dataFim)
  ), [planta, ac, modalidade, situacao, dataInicio, dataFim, dadosUnicos])

  const limparFiltros = () => {
    setPlanta('Todas')
    setAc('Todos')
    setModalidade('Todas')
    setSituacao('Todas')
    setDataInicio('')
    setDataFim('')
  }

  const indicadores = useMemo(() => ({
    total: dadosFiltrados.length,
    vigentes: dadosFiltrados.filter((d) => d.situacao.toUpperCase() === 'VIGENTE').length,
  }), [dadosFiltrados])

  return (
    <div className="flex min-h-screen flex-col gap-8 rounded-2xl bg-[#0B1220] !p-5 text-slate-100 sm:p-7">
      <PageHeader
        titulo="Controle Cambial"
        descricao="Acompanhamento dos índices cambiais por Ato Concessório."
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
            <p className="mt-1 text-xs text-slate-400">Refine os resultados por planta, ato, modalidade, situação e período.</p>
          </div>
          <button onClick={limparFiltros} className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Planta">
            <select className={estiloSelect} value={planta} onChange={(e) => setPlanta(e.target.value)}>
              <option value="Todas">Todas</option>
              {opcoesPlanta.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Número do AC">
            <select className={estiloSelect} value={ac} onChange={(e) => setAc(e.target.value)}>
              <option value="Todos">Todos</option>
              {opcoesAC.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Tipo AC">
            <select className={estiloSelect} value="A validar" disabled>
              <option>A validar</option>
            </select>
          </FilterField>

          <FilterField label="Modalidade AC">
            <select className={estiloSelect} value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
              <option value="Todas">Todas</option>
              {opcoesModalidade.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </FilterField>

          <FilterField label="Situação AC">
            <select className={estiloSelect} value={situacao} onChange={(e) => setSituacao(e.target.value)}>
              <option value="Todas">Todas</option>
              {opcoesSituacao.map((item) => <option key={item} value={item}>{item}</option>)}
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

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3 ">
        <div className={estiloCard}>
          <p className="text-sm text-slate-400">Atos Concessórios encontrados</p>
          <p className="mt-3 text-3xl font-bold text-white">{indicadores.total}</p>
          <p className="mt-2 text-xs text-slate-500">Quantidade de ACs distintos nos filtros</p>
        </div>

        <div className={estiloCard}>
          <p className="text-sm text-slate-400">Atos Concessórios vigentes</p>
          <p className="mt-3 text-3xl font-bold text-amber-400">A validar</p>
          <p className="mt-2 text-xs text-slate-500">Critério de vigência ainda não confirmado</p>
        </div>

        <div className={estiloCard}>
          <p className="text-sm text-slate-400">Índice Cambial Realizado</p>
          <p className="mt-3 text-3xl font-bold text-amber-400">A validar</p>
          <p className="mt-2 text-xs text-slate-500">Campo e regra de cálculo não disponíveis na base</p>
        </div>
      </section>

      <section className={estiloCard}>
        <div className="mb-5">
          <h2 className="font-semibold text-white">Controle de Índice Cambial por Ato Concessório</h2>
          <p className="mt-1 text-xs text-slate-400">Consulta dos dados cadastrais e dos índices cambiais por AC.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/70">
          <table className="w-full min-w-[1150px] border-collapse">
            <thead>
              <tr>
                <th className={estiloTh}>Planta</th>
                <th className={estiloTh}>Nº AC</th>
                <th className={estiloTh}>Tipo</th>
                <th className={estiloTh}>Modalidade</th>
                <th className={estiloTh}>Situação</th>
                <th className={estiloTh}>Data Abertura</th>
                <th className={estiloTh}>Data Vencimento</th>
                <th className={estiloTh}>Índice Cambial Autorizado</th>
                <th className={estiloTh}>Índice Cambial Realizado</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((d) => (
                <tr key={d.id} className="transition hover:bg-slate-700/20">
                  <td className={estiloTd}>{d.planta}</td>
                  <td className={`${estiloTd} font-semibold text-white`}>{d.ac}</td>
                  <td className={estiloTd}><span className="text-amber-400">A validar</span></td>
                  <td className={estiloTd}>{d.modalidade}</td>
                  <td className={estiloTd}>{d.situacao}</td>
                  <td className={estiloTd}>{dataBR(d.dataAbertura)}</td>
                  <td className={estiloTd}>{dataBR(d.dataVencimento)}</td>
                  <td className={estiloTd}><span className="text-amber-400">A validar</span></td>
                  <td className={estiloTd}><span className="text-amber-400">A validar</span></td>
                </tr>
              ))}
              {dadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    Nenhum Ato Concessório encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Os campos de Tipo AC e índices cambiais dependem de validação da fonte de dados e das regras de negócio.
        </p>
      </section>
    </div>
  )
}

export default ControleCambial
