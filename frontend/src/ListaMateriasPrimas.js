import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactToPrint from "react-to-print";
import "./styles/Table.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Select from "react-select";

function ListaMateriasPrimas() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]); // Dados para exibir na tabela
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [filteredData, setFilteredData] = useState([]); // Dados filtrados com base na busca
  const [categoriaOptions, setCategoriaOptions] = useState([]); // Opções para o filtro de categorias
  const [selectedCategoria, setSelectedCategoria] = useState(null); // Categoria selecionada
  const componentRef = useRef(); // Referência ao componente da tabela

  // Fetch initial data and set options for categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/materia-prima/`);
        setData(response.data);
        setFilteredData(response.data); // Inicialmente, mostra todos os dados

        const uniqueCategories = [
          ...new Set(response.data.map((item) => item.categoria)),
        ];
        const options = uniqueCategories.map((category) => ({
          label: category,
          value: category,
        }));
        setCategoriaOptions(options);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Filter data based on search term and selected category
  useEffect(() => {
    const results = data.filter(
      (item) =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedCategoria || item.categoria === selectedCategoria.value)
    );
    setFilteredData(results);
  }, [searchTerm, selectedCategoria, data]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/Login"); // Redireciona para a página de login
  };

  const handleCategoria = (selectedOption) => {
    setSelectedCategoria(selectedOption);
  };

  // Use React.forwardRef correctly to pass ref and props
  const TableComponent = React.forwardRef(({ data }, ref) => (
    <div ref={ref}>
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Estoque</th>
            <th>Unidade</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.descricao}</td>
                <td>{item.estoque}</td>
                <td>{item.unidade}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Nenhuma matéria-prima encontrada</td>
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
            placeholder="Buscar por nome da matéria-prima..."
            className="form-control me-2"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Select
            className="select"
            id="categoria-select"
            value={selectedCategoria}
            onChange={handleCategoria}
            options={categoriaOptions}
            isClearable
            placeholder="Filtrar por categoria..."
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

export default ListaMateriasPrimas;
