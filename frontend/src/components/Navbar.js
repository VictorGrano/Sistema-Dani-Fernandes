import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ handleLogout }) {
  const location = useLocation();
  const tipoUsuario = localStorage.getItem("tipoUsuario"); // Verifica o tipo de usuário

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

            {/* Exibir listas separadas apenas para o usuário "consulta" */}
            {tipoUsuario === "consulta" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/ListaAdesivos") ? "active" : ""}`}
                    to="/ListaAdesivos"
                  >
                    Lista de Adesivos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/ListaProdutos") ? "active" : ""}`}
                    to="/ListaProdutos"
                  >
                    Lista de Produtos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/ListaLotes") ? "active" : ""}`}
                    to="/ListaLotes"
                  >
                    Lista de Lotes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/ListaInsumos") ? "active" : ""}`}
                    to="/ListaInsumos"
                  >
                    Lista de Insumos
                  </Link>
                </li>
              </>
            )}

            {/* Exibir o gerador de etiquetas de produtos para "produção", "admin" e "almoxarifado" */}
            {(tipoUsuario === "admin" || tipoUsuario === "producao" || tipoUsuario === "almoxarifado") && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/etiquetaProduto") ? "active" : ""}`}
                  to="/etiquetaProduto"
                >
                  Gerar Etiquetas Produtos
                </Link>
              </li>
            )}

            {/* Exibir controle completo e listas dentro de dropdowns para "admin", "almoxarifado", e "produção" */}
            {(tipoUsuario === "admin" || tipoUsuario === "almoxarifado" || tipoUsuario === "producao") && (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Controle de Adesivos
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/ListaAdesivos") ? "active" : ""}`}
                        to="/ListaAdesivos"
                      >
                        Lista de Adesivos
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/EntradaAdesivo") ? "active" : ""}`}
                        to="/EntradaAdesivo"
                      >
                        Entrada de Adesivos
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/SaidaAdesivo") ? "active" : ""}`}
                        to="/SaidaAdesivo"
                      >
                        Saída de Adesivos
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {/* Exibir controle completo para "admin" e "almoxarifado" */}
            {(tipoUsuario === "admin" || tipoUsuario === "almoxarifado") && (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Controle de Entrada e Saída
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/Entrada") ? "active" : ""}`}
                        to="/Entrada"
                      >
                        Entrada de Produtos
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/Saida") ? "active" : ""}`}
                        to="/Saida"
                      >
                        Saída de Produtos
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/EntradaInsumos") ? "active" : ""}`}
                        to="/EntradaInsumos"
                      >
                        Entrada de Insumos
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={`dropdown-item ${isActive("/SaidaInsumo") ? "active" : ""}`}
                        to="/SaidaInsumo"
                      >
                        Saída de Insumos
                      </Link>
                    </li>
                  </ul>
                </li>

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
                        className={`dropdown-item ${isActive("/etiquetaInsumo") ? "active" : ""}`}
                        to="/etiquetaInsumo"
                      >
                        Gerar Etiquetas Insumos
                      </Link>
                    </li>
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
              </>
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
