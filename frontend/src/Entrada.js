import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Navbar from "./components/Navbar";

function Entrada() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLote, setSelectedLote] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [possuiFracionada, setPossuiFracionada] = useState(false);
  const [quantidadeCaixas, setQuantidadeCaixas] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [fracionadas, setFracionadas] = useState([]);
  const [quantidadeFracionada, setQuantidadeFracionada] = useState("");
  const [locais, setLocais] = useState([]);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [coluna, setColuna] = useState("");
  const [isLoteManual, setIsLoteManual] = useState(false);
  const [newLote, setNewLote] = useState("");
  const [fabricacao, setFabricacao] = useState("");
  const [validade, setValidade] = useState("");
  const [idUser, setIdUser] = useState(null);
  const [nomeUser, setNomeUser] = useState(null);

  useEffect(() => {
    setIdUser(localStorage.getItem("idUsuario"));
    setNomeUser(localStorage.getItem("nomeUser"));
    axios
      .get(`${apiUrl}/produtos/`)
      .then((response) => {
        setProdutos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
      });

    axios
      .get(`${apiUrl}/estoque/Locais`)
      .then((response) => {
        setLocais(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar locais de armazenamento:", error);
      });
  }, [apiUrl]);

  const fetchLotes = (productId) => {
    axios
      .get(`${apiUrl}/produtos/Lotes?produto_id=${productId}`)
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

  const handleAddFracionada = () => {
    if (quantidadeFracionada) {
      setFracionadas([...fracionadas, parseInt(quantidadeFracionada)]);
      setQuantidadeFracionada("");
    }
  };

  const handleRemoveFracionada = (index) => {
    const newFracionadas = fracionadas.filter((_, i) => i !== index);
    setFracionadas(newFracionadas);
  };

  const handleEntrar = () => {
    // Soma as quantidades fracionadas ao valor principal de quantidade
    const totalFracionadas = fracionadas.reduce((acc, val) => acc + val, 0);
    const quantidadeTotal =
      quantidade * (quantidadeCaixas || 1) + totalFracionadas;

    // Verifica se as datas de fabricação e validade foram passadas, senão pega do lote[0]
    const loteSelecionado = lotes.find((lote) => lote.value === selectedLote?.value);
    const dataFabricacao = isLoteManual
      ? fabricacao
      : loteSelecionado?.fabricacao || lotes[0]?.data_fabricacao;
    const dataValidade = isLoteManual
      ? validade
      : loteSelecionado?.validade || lotes[0]?.data_validade;    

    const entradaData = {
      id: selectedProduct ? selectedProduct.value : "",
      quantidade: quantidadeTotal,
      lote: isLoteManual ? newLote : selectedLote?.label,
      validade: isLoteManual ? validade : dataValidade,
      fabricacao: isLoteManual ? fabricacao : dataFabricacao,
      localArmazenado: selectedLocal?.value,
      quantidade_caixas: parseInt(quantidadeCaixas) + fracionadas.length || 1,
      coluna: coluna || "SEM COLUNA",
      user: nomeUser,
      iduser: idUser,
    };

    axios
      .post(`${apiUrl}/estoque/Entrada`, entradaData)
      .then(() => { 
        alert("Entrada efetuada com sucesso!");
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
                <label htmlFor="product-select">Escolha o produto:</label>
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

                {/* Exibição Condicional de Lote Manual ou Seleção de Lote */}
                {isLoteManual ? (
                  <>
                    <label htmlFor="lote-input">Lote:</label>
                    <input
                      type="text"
                      id="lote-input"
                      placeholder="Digite o lote"
                      value={newLote}
                      onChange={(e) => setNewLote(e.target.value)}
                    />
                    <label>Data de Fabricação:</label>
                    <input
                      type="date"
                      value={fabricacao}
                      onChange={(e) => setFabricacao(e.target.value)}
                    />
                    <label>Data de Validade:</label>
                    <input
                      type="date"
                      value={validade}
                      onChange={(e) => setValidade(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary botaoAdd"
                      onClick={() => setIsLoteManual(false)}
                    >
                      Selecionar lote existente
                    </button>
                  </>
                ) : (
                  <>
                    <label htmlFor="lote-select">
                      Escolha o lote (Apenas se já existir no estoque):
                    </label>
                    <div className="select-div">
                      <Select
                        className="select"
                        id="lote-select"
                        value={selectedLote}
                        onChange={handleLoteChange}
                        options={lotes.map((lote) => ({
                          label: lote.nome_lote,
                          value: lote.id,
                        }))}
                        isClearable
                        placeholder="Selecione um lote"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary botaoAdd"
                      onClick={() => setIsLoteManual(true)}
                    >
                      Digitar lote manualmente
                    </button>
                  </>
                )}
              </div>

              <div className="card card-entrada">
                <label>Número de caixas:</label>
                <input
                  type="number"
                  value={quantidadeCaixas}
                  onChange={(e) => setQuantidadeCaixas(e.target.value)}
                />

                <label>Quantidade por caixa:</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary botaoAdd"
                  onClick={() => setPossuiFracionada(!possuiFracionada)}
                >
                  {possuiFracionada
                    ? "Desativar caixa fracionada"
                    : "Adicionar caixa fracionada"}
                </button>
              </div>

              {possuiFracionada && (
                <>
                  <div className="card card-entrada">
                    <label>Quantidade fracionada:</label>
                    <input
                      type="number"
                      value={quantidadeFracionada}
                      onChange={(e) => setQuantidadeFracionada(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary botaoAdd"
                      onClick={handleAddFracionada}
                    >
                      Adicionar Caixa Fracionada
                    </button>

                    {fracionadas.map((item, index) => (
                      <div key={index}>
                        <span>
                          Caixa {index + 1}: {item} produtos
                        </span>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveFracionada(index)}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="card card-entrada">
                <label htmlFor="local-select">Local de Armazenamento:</label>
                <div className="select-div">
                  <Select
                    className="select"
                    id="local-select"
                    value={selectedLocal}
                    onChange={(item) => setSelectedLocal(item)}
                    options={locais.map((local) => ({
                      label: local.nome_local,
                      value: local.id,
                    }))}
                    isClearable
                    placeholder="Selecione um local"
                  />
                </div>

                <label htmlFor="coluna-input">Coluna armazenada:</label>
                <input
                  type="text"
                  id="coluna-input"
                  placeholder="Ex: A1"
                  value={coluna}
                  onChange={(e) => setColuna(e.target.value)}
                />
              </div>
            </div>
            <div className="row align-items-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEntrar}
              >
                Dar entrada
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Entrada;
