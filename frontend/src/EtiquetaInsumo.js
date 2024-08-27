import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import "./styles/EtiquetaInsumo.css";
import { useNavigate } from "react-router-dom";
import { CgChevronLeft } from "react-icons/cg";
import { QRCodeSVG } from "qrcode.react";

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
  const totalCaixas = parseInt(quantidadeCaixas);

  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate(); // Defina o hook useNavigate

  useEffect(() => {
    axios
      .get(`${apiUrl}/insumos/`)
      .then((response) => {
        setInsumos(response.data);
        console.log(response.data);
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

  const handleBack = () => {
    navigate("/");
  };

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

  const handlePrint = () => {
    if (!showQRCode) {
      alert("Gere o Resumo antes de imprimir.");
      return;
    }

    const generatedEtiquetas = [];
    for (let i = 0; i < parseInt(quantidadeCaixas); i++) {
      generatedEtiquetas.push(
        <div className="etiqueta-impressa" key={i}>
          <div>
          <img src={require('./images/logo.png')} className="imagem"/>
            <p>{insumoName}</p>
            <p>Lote: {loteInsumo}</p>
            <p>Número de caixas: {totalCaixas}</p>
            <p>Quantidade: {quantidade}</p>
            <p>
              Número da caixa: {i + 1}/{quantidadeCaixas}
            </p>
          </div>
          <QRCodeSVG value={qrValue} className="qrCode" />
        </div>
      );
    }
    setEtiquetas(generatedEtiquetas);

    const etiquetasContainer = document.querySelector(".etiquetas-container");
    if (etiquetasContainer) {
      etiquetasContainer.classList.add("imprimir"); // Aplica a classe .imprimir
    }

    setTimeout(() => {
      window.print();
      if (etiquetasContainer) {
        etiquetasContainer.classList.remove("imprimir"); // Remove a classe após a impressão
      }
      setEtiquetas([]); // Limpa as etiquetas depois de imprimir
    }, 0);
  };

  const handleClearInputs = () => {
    setSelectedInsumo(null);
    setQuantidade("");
    setQuantidadeCaixas("");
    setInsumoName("");
    setShowQRCode(false);
    setEtiquetas([]);
  };

  const qrValue = JSON.stringify({
    id: insumoId,
    lote: loteInsumo,
    quantidade: quantidade,
    quantidadeCaixas: quantidadeCaixas,
  });

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
    <div className="App">
      <header className="header">
        <CgChevronLeft
          size="50px"
          color="white"
          className="iconHeader"
          onClick={handleBack}
        ></CgChevronLeft>
        <div className="headerTextContainer">
          <span className="headerSpan">Etiqueta de Insumo</span>
        </div>
      </header>
      <main>
        <form>
          <div className="card">
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
            <input type="text" value={loteInsumo} onChange={handleLoteInsumo} />
            <br />
          </div>
          <br />
          <div className="card">
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
          <br />
          <div className="card">
            <button type="button" onClick={handleGenerateQRCode}>
              Gerar resumo
            </button>
            <button type="button" onClick={handlePrint}>
              Imprimir etiquetas
            </button>
            <button type="button" onClick={handleClearInputs}>
              Limpar dados
            </button>
          </div>
        </form>
        <br />
        {showQRCode && (
          <div className="card">
            <img src={require('./images/logo.png')} className="imagem"/>
            <div className="etiqueta">
              <div>
                <p>{insumoName}</p>
                <p>Lote: {loteInsumo}</p>
                <p>Quantidade de caixas: {quantidadeCaixas}</p>
                <p>Número total do insumo: {subtotalProdutos}</p>
              </div>
              <QRCodeSVG value={qrValue} className="qrCode" />
            </div>
          </div>
        )}
        {etiquetas.length > 0 && (
          <div className="etiquetas-container">{etiquetas}</div>
        )}
      </main>
    </div>
  );
}

export default EtiquetaInsumo;
