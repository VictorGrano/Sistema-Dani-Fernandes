import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ handleLogout }) {
  const location = useLocation();
  const tipoUsuario = localStorage.getItem('tipoUsuario'); // Verifica o tipo de usuário

  // Função auxiliar para verificar se a rota atual é a mesma do link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Dani Fernandes
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                aria-current="page"
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/etiquetaProduto") ? "active" : ""}`}
                to="/etiquetaProduto"
              >
                Gerar Etiquetas Produtos
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/etiquetaInsumo") ? "active" : ""}`}
                to="/etiquetaInsumo"
              >
                Gerar Etiquetas Insumos
              </Link>
            </li>

            {/* Verifica se o usuário é admin antes de exibir Almoxarifado */}
            {tipoUsuario === 'admin' && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Almoxarifado
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={`dropdown-item ${isActive("/ListaProdutos") ? "active" : ""}`}
                      to="/ListaProdutos"
                    >
                      Lista de Produtos
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${isActive("/ListaLotes") ? "active" : ""}`}
                      to="/ListaLotes"
                    >
                      Lista de Lotes
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${isActive("/ListaInsumos") ? "active" : ""}`}
                      to="/ListaInsumos"
                    >
                      Lista de Insumos
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`dropdown-item ${isActive("/Historico") ? "active" : ""}`}
                      to="/Historico"
                    >
                      Histórico
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/Login" onClick={handleLogout}>
                Log-out
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
