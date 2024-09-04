import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import Select from "react-select";
import "./styles/Dashboard.css";
import "./styles/EtiquetaInsumo.module.css";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { estiloEtiqueta } from "./components/printEtiqueta";
import Navbar from "./components/Navbar";

function EtiquetaInsumo() {
  const [insumos, setInsumos] = useState([]);
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeCaixas, setQuantidadeCaixas] = useState("");
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [insumoName, setInsumoName] = useState("");
  const [insumoId, setInsumoId] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [etiquetas, setEtiquetas] = useState([]);
  const [subtotalProdutos, setSubtotalProdutos] = useState(0);
  const [loteInsumo, setLoteInsumo] = useState("");
  const [showContainer, setShowContainer] = useState(false);
  const etiquetasRef = useRef();

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${apiUrl}/insumos/`)
      .then((response) => {
        setInsumos(response.data);
      })
      .catch((error) => {
        console.error("Error fetching insumos:", error);
      });
  }, []);

  useEffect(() => {
    const totalCaixas = parseInt(quantidadeCaixas || 0);
    const totalProdutos = totalCaixas * parseInt(quantidade || 0);
    setSubtotalProdutos(totalProdutos);
  }, [quantidade, quantidadeCaixas]);

  const handleProduto = (selectedOption) => {
    const insumoId = selectedOption ? selectedOption.value : "";
    const insumo = insumos.find((p) => p.id === parseInt(insumoId));
    setSelectedInsumo(selectedOption);
    if (insumo) {
      setInsumoName(insumo.nome);
      setInsumoId(insumo.id);
    } else {
      setInsumoName("");
    }
  };

  const handleQuantidade = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setQuantidade(value);
    }
  };

  const handleLoteInsumo = (event) => {
    const value = event.target.value;
    setLoteInsumo(value);
  };

  const handleQuantidadeCaixas = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setQuantidadeCaixas(value);
    }
  };

  const handleGenerateQRCode = () => {
    if (selectedInsumo && quantidade && quantidadeCaixas) {
      setShowQRCode(true);
    } else {
      alert("Todos os campos são obrigatórios!");
    }
  };

  const imprimir = useReactToPrint({
    content: () => etiquetasRef.current,
    documentTitle: "Etiquetas Insumos",
    onBeforePrint: () => setShowContainer(true),
    onAfterPrint: () => setShowContainer(false),
    pageStyle: estiloEtiqueta,
  });

  const qrValue = JSON.stringify({
    id: insumoId,
    lote: loteInsumo,
    quantidade: quantidade,
    quantidadeCaixas: quantidadeCaixas,
  });

  const handlePrint = () => {
    if (!showQRCode) {
      alert("Gere o Resumo antes de imprimir.");
      return;
    }
    setShowContainer(true);
    const generatedEtiquetas = [];
    for (let i = 0; i < parseInt(quantidadeCaixas); i++) {
      const qrValue = JSON.stringify({
        id: insumoId,
        lote: loteInsumo,
        quantidade: quantidade,
        quantidadeCaixas: quantidadeCaixas,
      });

      generatedEtiquetas.push(
        <div className="etiqueta-impressa" key={i}>
          <div>
            <img
              src={require("./images/logo.png")}
              className="imagem"
              alt="Logo"
            />
            <p>{insumoName}</p>
            <p>Lote: {loteInsumo}</p>
          </div>
          <div className="qrCode-info">
            <QRCodeSVG value={qrValue} className="qrCode" />
            <p>QTDE: {quantidade}</p>
            <p>
              Caixa Nº: {i + 1}/{quantidadeCaixas}
            </p>
          </div>
        </div>
      );
    }
    setEtiquetas(generatedEtiquetas);

    setTimeout(() => {
      imprimir(); // Função de impressão utilizando react-to-print
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };

  const handleClearInputs = () => {
    setSelectedInsumo(null);
    setQuantidade("");
    setQuantidadeCaixas("");
    setInsumoName("");
    setShowQRCode(false);
    setEtiquetas([]);
  };

  const insumoOptions = insumos.map((insumo) => ({
    value: insumo.id,
    label: insumo.nome,
  }));

  const preventNonNumericInput = (event) => {
    if (
      !/^[0-9]$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Delete"
    ) {
      event.preventDefault();
    }
  };

  return (
    <div>
      <Navbar handleLogout={handleLogout} />
      <div className="App">
        <main>
          <form>
            <div className="row">
              <div className="card card-modificado">
                <label htmlFor="product-select">Escolha o insumo:</label>
                <br />
                <div className="select-div">
                  <Select
                    className="select"
                    id="insumo-select"
                    value={selectedInsumo}
                    onChange={handleProduto}
                    options={insumoOptions}
                    isClearable
                    placeholder="Selecione um produto"
                    required
                  />
                </div>
                <br />
                <label>Lote do insumo:</label>
                <input
                  type="text"
                  value={loteInsumo}
                  onChange={handleLoteInsumo}
                />
                <br />
              </div>
              <br />
              <div className="card card-modificado">
                <label>Número de caixas:</label>
                <br />
                <input
                  type="number"
                  min="1"
                  value={quantidadeCaixas}
                  onChange={handleQuantidadeCaixas}
                  onKeyDown={preventNonNumericInput}
                  required
                />
                <br />
                <label>Unidades por caixa:</label>
                <br />
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={handleQuantidade}
                  onKeyDown={preventNonNumericInput}
                  required
                />
                <br />
              </div>
            </div>
            <div className="row">
              <div className="card card-modificado">
                <button
                  type="button"
                  className="btn btn-primary sizeButton"
                  onClick={handleGenerateQRCode}
                >
                  Gerar resumo
                </button>
                <button
                  type="button"
                  className="btn btn-primary sizeButton"
                  onClick={handlePrint}
                >
                  Imprimir etiquetas
                </button>
                <button
                  type="button"
                  className="btn btn-primary sizeButton"
                  onClick={handleClearInputs}
                >
                  Limpar dados
                </button>
              </div>
              <br />
              {showQRCode && (
                <div className="card card-resumo">
                  <div className="etiqueta">
                    <div>
                      <p>{insumoName}</p>
                      <p>Lote: {loteInsumo}</p>
                      <p>Número total do insumo: {subtotalProdutos}</p>
                    </div>
                    <QRCodeSVG value={qrValue} className="qrCode" />
                  </div>
                </div>
              )}
            </div>
          </form>
          {etiquetas.length > 0 && (
            <div
              ref={etiquetasRef}
              style={{ display: showContainer ? "block" : "none" }}
              className="etiquetas-container"
            >
              {etiquetas}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default EtiquetaInsumo;
