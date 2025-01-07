import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Navbar from "./components/Navbar";

function SaidaMateriaPrima() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [selectedMateriaPrima, setSelectedMateriaPrima] = useState(null);
  const [quantidade, setQuantidade] = useState("");
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
  }, [apiUrl]);

  const handleSaida = () => {
    const saidaData = {
      id: selectedMateriaPrima ? selectedMateriaPrima.value : "",
      quantidade: parseInt(quantidade),
      user: nomeUser,
      iduser: idUser,
    };

    axios.post(`${apiUrl}/estoque/SaidaMateriaPrima`, saidaData)
      .then(() => {
        alert("Saída efetuada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao registrar saída:", error);
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
            <button type="button" className="btn btn-primary" onClick={handleSaida}>
              Registrar saída
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default SaidaMateriaPrima;
