import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Navbar from "./components/Navbar";

function SaidaInsumo() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLote, setSelectedLote] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [quantidadeCaixas, setQuantidadeCaixas] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [idUser, setIdUser] = useState(null);
  const [nomeUser, setNomeUser] = useState(null);

  useEffect(() => {
    setIdUser(localStorage.getItem("idUsuario"));
    setNomeUser(localStorage.getItem("nomeUser"));
    axios
      .get(`${apiUrl}/insumos/`)
      .then((response) => {
        setProdutos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
      });
  }, [apiUrl]);

  const fetchLotes = (productId) => {
    axios
      .get(`${apiUrl}/insumos/Lotes?insumo_id=${productId}`)
      .then((response) => {
        setLotes(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar lotes:", error);
      });
  };

  const handleProduto = (selectedOption) => {
    const productId = selectedOption ? selectedOption.value : "";
    setSelectedProduct(selectedOption);
    if (productId) {
      fetchLotes(productId);
    } else {
      setLotes([]);
    }
  };

  const handleLoteChange = (lote) => {
    setSelectedLote(lote);
  };

  const handleSaida = () => {
    // Soma as quantidades fracionadas ao valor principal de quantidade

    // Verifica se as datas de fabricação e validade foram passadas, senão pega do lote[0]

    const saidaData = {
      id: selectedProduct ? selectedProduct.value : "",
      quantidade: (quantidade * quantidadeCaixas),
      lote: selectedLote?.label,  
      quantidade_caixas: parseInt(quantidadeCaixas) || 1,
      user: nomeUser,
      iduser: idUser,
    };

    axios
      .post(`${apiUrl}/estoque/SaidaInsumo`, saidaData)
      .then(() => {
        alert("Saída efetuada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao criar entrada:", error);
      });
  };

  const handleLogout = () => {
    console.log("Logout acionado");
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout} />
      <div className="App">
        <main>
          <form>
            <div className="row align-items-center">
              <div className="card card-entrada">
                <label htmlFor="product-select">Escolha o insumo:</label>
                <div className="select-div">
                  <Select
                    className="select"
                    id="product-select"
                    value={selectedProduct}
                    onChange={handleProduto}
                    options={produtos.map((produto) => ({
                      label: produto.nome,
                      value: produto.id,
                    }))}
                    isClearable
                    placeholder="Selecione um produto"
                    required
                  />
                </div>
              </div>

              <div className="card card-entrada">
                <label>Quantidade:</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
             </div>
            <div className="row align-items-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaida}
              >
                Dar Saída
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default SaidaInsumo
