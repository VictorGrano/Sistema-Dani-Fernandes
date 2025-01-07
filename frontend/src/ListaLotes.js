import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles/Table.css";
import { useNavigate } from "react-router-dom";
import ReactToPrint from "react-to-print";
import Navbar from "./components/Navbar";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

function ListaLotes() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/produtos/AllLotes`);
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    const results = data.filter((item) =>
      item.nome_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };

  const handleEditClick = (id, item) => {
    setEditingId(id);
    setEditedData({ ...item });
  };

  const handleSaveClick = async (id) => {
    try {
      await axios.post(`${apiUrl}/produtos/AtualizarLote`, editedData);
      const updatedData = data.map((item) =>
        item.id === id ? { ...item, ...editedData } : item
      );
      setData(updatedData);
      setFilteredData(updatedData);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleInputChange = (field, value) => {
    setEditedData((prevState) => ({ ...prevState, [field]: value }));
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
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editedData.nome_lote || ""}
                      onChange={(e) =>
                        handleInputChange("nome_lote", e.target.value)
                      }
                    />
                  ) : (
                    item.nome_lote
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editedData.quantidade || ""}
                      onChange={(e) =>
                        handleInputChange("quantidade", e.target.value)
                      }
                    />
                  ) : (
                    item.quantidade
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editedData.quantidade_caixas || ""}
                      onChange={(e) =>
                        handleInputChange("quantidade_caixas", e.target.value)
                      }
                    />
                  ) : (
                    item.quantidade_caixas
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => handleSaveClick(item.id)}
                      >
                        <FaSave />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleCancelClick}
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditClick(item.id, item)}
                    >
                      <FaEdit />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Nenhum produto encontrado</td>
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
          placeholder="Buscar por lote..."
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

export default ListaLotes;
