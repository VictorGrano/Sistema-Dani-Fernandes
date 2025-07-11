import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactToPrint from "react-to-print";
import "./styles/Table.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Select from "react-select";

function ListaProdutos() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]); // Dados para exibir na tabela
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados com base na busca
  const [tipoProdutoOptions, setTipoProdutoOptions] = useState([]); // Opções para o filtro de tipos de produto
  const [selectedTipo, setSelectedTipo] = useState(null); // Tipo de adesivo selecionado
  const componentRef = useRef(); // Referência ao componente da tabela

  // Fetch initial data and set options for product types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/produtos/`);
        setData(response.data);
        setFilteredData(response.data); // Inicialmente, mostra todos os dados

        const uniqueTypes = [
          ...new Set(response.data.map((item) => item.nome_categoria)),
        ];
        const options = uniqueTypes.map((type) => ({
          label: type,
          value: type,
        }));
        setTipoProdutoOptions(options);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Filter data based on search term and selected type
  useEffect(() => {
    const results = data.filter((item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedTipo || item.nome_categoria === selectedTipo.value)
    );
    setFilteredData(results);
  }, [searchTerm, selectedTipo, data]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/Login"); // Redireciona para a página de login
  };

  const handleTipo = (selectedOption) => {
    setSelectedTipo(selectedOption);
  };

  // Use React.forwardRef correctly to pass ref and props
  const TableComponent = React.forwardRef(({ data }, ref) => (
    <div ref={ref}>
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Estoque Total</th>
            <th>Quantidade de Caixas</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.estoque_total}</td>
                <td>{item.total_caixas}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Nenhum produto encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <div className="A4">
      <Navbar handleLogout={handleLogout} />
      <div className="search-table-container">
      <div className="d-flex align-items-center mb-3">
        <input
          type="text"
          placeholder="Buscar por nome do produto..."
          className="form-control me-2"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Select
          className="select"
          id="insumo-select"
          value={selectedTipo}
          onChange={handleTipo}
          options={tipoProdutoOptions}
          isClearable
          placeholder="Filtrar por tipo..."
        />
        </div>
        <ReactToPrint
          trigger={() => <button className="btn btn-primary btnImprimir">Imprimir</button>}
          content={() => componentRef.current}
        />
        <TableComponent ref={componentRef} data={filteredData} />
      </div>
    </div>
  );
}

export default ListaProdutos;
