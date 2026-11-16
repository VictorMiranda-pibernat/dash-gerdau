
import { useState } from 'react'
import gerdauLogo from './assets/gerdau-logo.png'
import ControleGanhos from './pages/ControleGanhos'
import ControleGanhosMensaisImportado from './pages/ControleGanhosMensaisImportado'
import GanhosMensaisNacional from './pages/GanhosMensaisNacional'
import './index.css'

const paginasOperacionais = [
  'Controle de Ganhos Gerais',
  'Controle de Ganhos Mensais Importado',
  'Ganhos Mensais Nacional',
  'Ganhos Provisionados',
]

const outrasPaginas = [
  'Controle de Saldo',
  'Comprovação',
  'Controle de Aditivos',
  'Controle Cambial',
  'Controle de Vencimentos',
]

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('Home')
  const [dropdownAberto, setDropdownAberto] = useState(false)

  const controleAtivo = paginasOperacionais.includes(paginaAtiva)

  const selecionarPagina = (pagina: string) => {
    setPaginaAtiva(pagina)
    setDropdownAberto(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <nav className="navigation">
          <button className={`nav-item ${paginaAtiva === 'Home' ? 'active' : ''}`} onClick={() => selecionarPagina('Home')}>
            <span className="nav-icon">⌂</span>Home
          </button>

          <div className="nav-dropdown">
            <button
              className={`nav-item ${controleAtivo ? 'active' : ''}`}
              onClick={() => setDropdownAberto(!dropdownAberto)}
              aria-expanded={dropdownAberto}
            >
              <span className="nav-icon">▥</span>
              Controle Operacional
              <span className={`dropdown-arrow ${dropdownAberto ? 'open' : ''}`}>⌄</span>
            </button>

            {dropdownAberto && (
              <div className="nav-dropdown-menu">
                {paginasOperacionais.map((pagina) => (
                  <button
                    key={pagina}
                    className={`nav-dropdown-item ${paginaAtiva === pagina ? 'active' : ''}`}
                    onClick={() => selecionarPagina(pagina)}
                  >
                    {pagina}
                  </button>
                ))}
              </div>
            )}
          </div>

          {outrasPaginas.map((pagina, index) => (
            <button
              key={pagina}
              className={`nav-item ${paginaAtiva === pagina ? 'active' : ''}`}
              onClick={() => selecionarPagina(pagina)}
            >
              <span className="nav-icon">{['▤', '⇄', '✎', '◉', '◷'][index]}</span>
              {pagina}
            </button>
          ))}
        </nav>

        <div className="system-status">
          <span className="status-dot" />
          <span>Modo Mock</span>
        </div>
      </header>

      <main className="main-content">
        {paginaAtiva === 'Home' ? (
          <section className="home-hero">
            <div className="hero-blue">
              <div className="hero-title">
                <h1>Dashboard <span>Drawback</span></h1>
                <p>BI de Gerenciamento | Drawback Gerdau</p>
              </div>
            </div>
            <div className="hero-brand">
              <div className="brand-content" />
              <img src={gerdauLogo} alt="Logo Gerdau" className="brand-logo" />
              <span className="brand-caption">Inteligência e gestão de Drawback</span>
            </div>
          </section>
        ) : paginaAtiva === 'Controle de Ganhos Gerais' ? (
          <ControleGanhos />
        ) : paginaAtiva === 'Controle de Ganhos Mensais Importado' ? (
          <ControleGanhosMensaisImportado />
        ) : paginaAtiva === 'Ganhos Mensais Nacional' ? (
          <GanhosMensaisNacional />
        ) : (
          <section className="page-placeholder">
            <span className="page-label">GERDAU | DRAWBACK</span>
            <h1>{paginaAtiva}</h1>
            <p>Área preparada para construção dos indicadores, filtros, gráficos e tabelas deste módulo.</p>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>GERDAU | BI DE GERENCIAMENTO</span>
        <span>Desenvolvido por Victor Sarti Miranda</span>
      </footer>
    </div>
  )
}

export default App
