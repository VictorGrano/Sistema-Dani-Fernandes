import React, { useEffect } from "react";
import axios from "axios";
import "./styles/Dashboard.css"
import { useNavigate } from "react-router-dom";

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
    navigate("/Login"); // Redireciona para a página de login
  };

  return (
    <div className="dashboard-container">
      <div className="card">
      <h1>Bem-vindo ao Dashboard!</h1>
      <p>Escolha o que deseja acessar:</p>
  
      <div className="button-container">
        <button onClick={() => navigate("/etiquetaProduto")} className="dashboard-button">
          Gerar etiqueta de produto
        </button>
        <button onClick={() => navigate("/etiquetaInsumo")} className="dashboard-button">
          Gerar etiqueta de insumo
        </button>
      </div>

      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
