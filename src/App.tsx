
import gerdauLogo from './assets/gerdau-logo.png'
import { useState } from 'react'
import ControleGanhos from './pages/ControleGanhos'
import './index.css'

const paginas = [
  'Home',
  'Controle de Ganhos',
  'Ganhos Mensais',
  'Ganhos Provisionados',
  'Controle de Saldo',
  'Comprovação',
  'Controle de Aditivos',
  'Controle Cambial',
  'Controle de Vencimentos',
]

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('Home')

  return (
    <div className="app">
      <header className="topbar">
        <nav className="navigation">
          {paginas.map((pagina, index) => (
            <button
              key={pagina}
              className={`nav-item ${paginaAtiva === pagina ? 'active' : ''}`}
              onClick={() => setPaginaAtiva(pagina)}
            >
              <span className="nav-icon">
                {['⌂', '▥', '↗', '◷', '▤', '⇄', '✎', '◉', '◷'][index]}
              </span>
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
                <h1>
                  Dashboard
                  <span>Drawback</span>
                </h1>

                <p>
                  BI de Gerenciamento | Drawback Gerdau
                </p>
              </div>
            </div>

            <div className="hero-brand">
              <div className="brand-content">
                {/* <span className="brand-symbol">G</span>
                <span className="brand-name">GERDAU</span> */}
              </div>

              {/* <div className="brand-line" /> */}

              <img
                src={gerdauLogo}
                alt="Logo Gerdau"
                className="brand-logo"
              />

              <span className="brand-caption">
                Inteligência e gestão de Drawback
              </span>
            </div>
          </section>
        ) : paginaAtiva === 'Controle de Ganhos' ? (
          <ControleGanhos />
        ) : (
          <section className="page-placeholder">
            <span className="page-label">GERDAU | DRAWBACK</span>
            <h1>{paginaAtiva}</h1>
            <p>
              Área preparada para construção dos indicadores,
              filtros, gráficos e tabelas deste módulo.
            </p>
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
