import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles/Table.css";
import { useNavigate } from "react-router-dom";
import ReactToPrint from "react-to-print";
import Navbar from "./components/Navbar";
import Select from "react-select";

function ListaAdesivos() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]); // Dados para exibir na tabela
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados com base na busca
  const [insumoOptions, setInsumoOptions] = useState([]); // Opções para o filtro de tipos de adesivo
  const [selectedInsumo, setSelectedInsumo] = useState(null); // Tipo de adesivo selecionado
  const componentRef = useRef(); // Referência ao componente da tabela

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/insumos/Adesivos`);
        setData(response.data);
        setFilteredData(response.data); // Inicialmente, mostra todos os dados

        // Extrai os tipos de adesivo para o Select
        const uniqueTypes = [
          ...new Set(response.data.map((item) => item.tipo)),
        ];
        const options = uniqueTypes.map((type) => ({
          label: type,
          value: type,
        }));
        setInsumoOptions(options);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Filtro por nome e tipo de adesivo
  useEffect(() => {
    const results = data.filter(
      (item) =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedInsumo || item.tipo === selectedInsumo.value)
    );
    setFilteredData(results);
  }, [searchTerm, selectedInsumo, data]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleProduto = (selectedOption) => {
    setSelectedInsumo(selectedOption);
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
            <th>Nome</th>
            <th>Estoque Total</th>
            <th>Tipo de adesivo</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.estoque}</td>
                <td>{item.tipo}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Nenhum insumo encontrado</td>
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
      <div className="d-flex align-items-center mb-3">
          <input
            type="text"
            placeholder="Buscar por adesivo..."
            className="form-control me-2"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Select
            className="select"
            id="insumo-select"
            value={selectedInsumo}
            onChange={handleProduto}
            options={insumoOptions}
            isClearable
            placeholder="Filtrar por tipo..."
          />
        </div>
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

export default ListaAdesivos;
