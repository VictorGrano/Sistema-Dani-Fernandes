import React, { useEffect } from "react";
import axios from "axios";
import "./styles/Dashboard.css"
import { useNavigate } from "react-router-dom";
import {Helmet} from "react-helmet";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Configura o interceptor do axios quando o Dashboard for montado
    const token = localStorage.getItem("token");
    if (token) {
      axios.interceptors.request.use(
        (config) => {
          config.headers["x-access-token"] = token;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/"); // Redireciona para a página de login
  };

  return (
    <div className="dashboard-container">
      <Helmet>
      <head>
      <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
    </head>
    </Helmet>
      <h1>Bem-vindo ao Dashboard!</h1>
      <p>Escolha a rota que deseja acessar:</p>

      <div className="button-container">
        <button onClick={() => navigate("/etiquetaProduto")} className="dashboard-button">
          Ir para Etiqueta Produto
        </button>
        <button onClick={() => navigate("/etiquetaInsumo")} className="dashboard-button">
          Ir para Etiqueta Insumo
        </button>
      </div>

      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
