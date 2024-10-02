import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles/Table.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import ReactToPrint from "react-to-print";
import Navbar from "./components/Navbar";

function Historico() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]); // Dados para exibir na tabela
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados com base na busca
  const componentRef = useRef();

  const calculaTotal = (item) => {
    if (item.tipo_mudanca === "entrada") {
      if (isNaN(item.quantidadeAntiga)) {
        item.quantidadeAntiga = 0;
      }
      return parseInt(item.quantidadeAntiga) + parseInt(item.quantidade);
    } else if (item.tipo_mudanca === "saída") {
      return parseInt(item.quantidadeAntiga) - parseInt(item.quantidade);
    } else {
      return 0;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/Login"); // Redireciona para a página de login
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${apiUrl}/usuarios/Historico`);
        const data = response.data.map((historico) => {
          const mov_data = JSON.parse(historico.valor_movimentacao);
          const mov_antigo = JSON.parse(historico.valor_antigo);
          const parsedDate = historico.data_mudanca.slice(0, -1);
          return {
            usuario: historico.usuario,
            tabela: historico.tabela_alterada,
            tipo_mudanca: historico.tipo_mudanca,
            produto: historico.nome_produto,
            lote: historico.lote,
            quantidade: mov_data.quantidade,
            caixas: mov_data.quantidade_caixas,
            quantidadeAntiga: mov_antigo.quantidade,
            caixasAntiga: mov_antigo.quantidade_caixas,
            local_armazenado: historico.nome_local,
            coluna: historico.coluna,
            data_mudanca: format(parsedDate, "dd/MM/yyyy"),
            hora_mudanca: format(parsedDate, "HH:mm"),
          };
        });
        setData(data);
        setFilteredData(data); // Inicialmente, mostra todos os dados
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    const results = data.filter((item) => {
      // Verifica se o termo de busca está presente em vários campos
      return (
        item.data_mudanca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipo_mudanca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.coluna.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredData(results);
  }, [searchTerm, data]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const TableComponent = React.forwardRef((props, ref) => (
    <div ref={ref}>
      <table className="table">
        <thead>
          <tr>
            <th>Data da movimentação:</th>
            <th>Hora da movimentação:</th>
            <th>Usuário</th>
            <th>Tipo de Movimentação</th>
            <th>Produto</th>
            <th>Lote</th>
            <th>Quantiade anterior</th>
            <th>Quantidade Atual</th>
            <th>Quantia de produtos movimentada</th>
            <th>Local armazenado:</th>
            <th>Coluna:</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.data_mudanca}</td>
                <td>{item.hora_mudanca}</td>
                <td>{item.usuario}</td>
                <td>{item.tipo_mudanca}</td>
                <td>{item.produto}</td>
                <td>{item.lote}</td>
                <td>{item.quantidadeAntiga || 0}</td>
                <td>{calculaTotal(item)}</td>
                <td>{item.quantidade || 0}</td>
                <td>{item.local_armazenado}</td>
                <td>{item.coluna}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Nenhum histórico encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <div>
      <Navbar handleLogout={handleLogout} />
      <div className="search-table-container">
        <input
          type="text"
          placeholder="Buscar..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <ReactToPrint
          trigger={() => (
            <button className="btn btn-primary btnImprimir">Imprimir</button>
          )}
          content={() => componentRef.current}
        />
        <TableComponent ref={componentRef} />
      </div>
    </div>
  );
}

export default Historico;
