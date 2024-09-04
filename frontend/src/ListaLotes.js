import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles/Table.css";
import { useNavigate } from "react-router-dom";
import ReactToPrint from "react-to-print";
import Navbar from "./components/Navbar";

function ListaLotes() {

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]); // Dados para exibir na tabela
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados com base na busca
  const componentRef = useRef(); // Referência ao componente da tabela

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/produtos/AllLotes`);
        setData(response.data);
        setFilteredData(response.data); // Inicialmente, mostra todos os dados
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    const results = data.filter((item) => {
      return (
        item.nome_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/Login"); // Redireciona para a página de login
  };


  const TableComponent = React.forwardRef((props, ref) => (
    <div ref={ref}>
       <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Lote</th>
              <th>Estoque</th>
              <th>Quantidade de Caixas</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.nome_lote}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.quantidade_caixas}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Nenhum produto encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  ));

  return (
    <div>
      <Navbar handleLogout={handleLogout}/>
      <div className="search-table-container">
        <input
          type="text"
          placeholder="Buscar por lote..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <ReactToPrint
              trigger={() => <button className="btn btn-primary btnImprimir">Imprimir</button>}
              content={() => componentRef.current}
            />
        <TableComponent ref={componentRef}/>
      </div>
    </div>
  );
}

export default ListaLotes;
