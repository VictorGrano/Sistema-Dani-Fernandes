import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Navbar from "./components/Navbar";

function EntradaMateriaPrima() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [selectedMateriaPrima, setSelectedMateriaPrima] = useState(null);
  const [quantidade, setQuantidade] = useState("");
  const [locais, setLocais] = useState([]);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [coluna, setColuna] = useState("");
  const [idUser, setIdUser] = useState(null);
  const [nomeUser, setNomeUser] = useState(null);

  useEffect(() => {
    setIdUser(localStorage.getItem("idUsuario"));
    setNomeUser(localStorage.getItem("nomeUser"));

    axios.get(`${apiUrl}/materia-prima/`)
      .then((response) => {
        setMateriasPrimas(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar matérias-primas:", error);
      });

    axios.get(`${apiUrl}/estoque/Locais`)
      .then((response) => {
        setLocais(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar locais:", error);
      });
  }, [apiUrl]);

  const handleEntrar = () => {
    const entradaData = {
      id: selectedMateriaPrima ? selectedMateriaPrima.value : "",
      quantidade: parseInt(quantidade),
      localArmazenado: selectedLocal?.value,
      coluna: coluna || "SEM COLUNA",
      user: nomeUser,
      iduser: idUser,
    };

    axios.post(`${apiUrl}/estoque/EntradaMateriaPrima`, entradaData)
      .then(() => {
        alert("Entrada efetuada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao criar entrada:", error);
      });
  };

  return (
    <div>
      <Navbar />
      <div className="App">
        <main>
          <form>
            <div className="card card-entrada">
              <label htmlFor="materia-select">Escolha a matéria-prima:</label>
              <Select
                className="select"
                id="materia-select"
                value={selectedMateriaPrima}
                onChange={(item) => setSelectedMateriaPrima(item)}
                options={materiasPrimas.map((mp) => ({
                  label: mp.materia_prima,
                  value: mp.id,
                }))}
                isClearable
                placeholder="Selecione uma matéria-prima"
              />
            </div>
            <div className="card card-entrada">
              <label>Quantidade:</label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <div className="card card-entrada">
              <label>Local de Armazenamento:</label>
              <Select
                className="select"
                value={selectedLocal}
                onChange={(item) => setSelectedLocal(item)}
                options={locais.map((local) => ({
                  label: local.nome_local,
                  value: local.id,
                }))}
                isClearable
                placeholder="Selecione um local"
              />
              <label>Coluna armazenada:</label>
              <input
                type="text"
                value={coluna}
                onChange={(e) => setColuna(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={handleEntrar}>
              Dar entrada
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EntradaMateriaPrima;
