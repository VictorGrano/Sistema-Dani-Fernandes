import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [dataL, setDataL] = useState([]); // Para armazenar os locais de armazenamento
  const [lotesVencimentoProximo, setLotesVencimentoProximo] = useState([]); // Para armazenar os lotes próximos do vencimento
  const [info, setInfo] = useState(false);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        navigate('/Login');
      }
    } else {
      navigate('/Login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lotesResponse = await axios.get(`${apiUrl}/produtos/AllLotes`);
        const lotesData = lotesResponse.data;

        const locaisResponse = await axios.get(`${apiUrl}/estoque/Locais`);
        const locaisData = locaisResponse.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setDataL(locaisData);

        // Definir a data de hoje e a data limite para os próximos 30 dias
        const today = new Date();
        const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias a partir de hoje

        // Filtrar lotes com vencimento nos próximos 30 dias
        const lotesProximos = lotesData.filter((lote) => {
          const validade = new Date(lote.data_validade);
          return validade > today && validade <= endDate; // Filtra se a validade está dentro dos próximos 30 dias
        });

        setLotesVencimentoProximo(lotesProximos);

        // Verifica se há lotes próximos do vencimento
        if (lotesProximos.length === 0) {
          setInfo(true);
        } else {
          setInfo(false);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setInfo(true);
        }
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/Login"); // Redireciona para a página de login
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout}/>
      <div className="dashboard-container">
        <h1>Bem vindo de volta!</h1>
        <h1> Usa a barra de navegação acima para acessar o que precisa.</h1>
        <div className="card">
          <h3 className="card-header">Lotes à vencer nos próximos 30 dias:</h3>
          {info ? (
            <p>Não há lotes perto do vencimento</p>
          ) : (
            <div className="lotes-container">
              {lotesVencimentoProximo.map((item) => (
                <div key={item.id} className="lote-item">
                  <p className="card-text">Lote: {item.nome_lote}</p>
                  <p className="card-text">Produto: {item.nome}</p>
                  <p className="card-text">Local: {item.nome_local}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
