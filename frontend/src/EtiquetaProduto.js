import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import Select from "react-select";
import { format, parse, parseISO, addHours } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./styles/Dashboard.css";
import "./styles/EtiquetaProduto.css";
import { QRCodeSVG } from "qrcode.react";
import { estiloEtiqueta } from "./components/printEtiqueta";
import Navbar from "./components/Navbar";

function EtiquetaProduto() {
  const [products, setProducts] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeCaixas, setQuantidadeCaixas] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [mesValidade, setMesValidade] = useState("");
  const [anoValidade, setAnoValidade] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [creatingLote, setCreatingLote] = useState(false);
  const [dataFabricacao, setDataFabricacao] = useState("");
  const [newLoteName, setNewLoteName] = useState("");
  const [etiquetas, setEtiquetas] = useState([]);
  const [subtotalProdutos, setSubtotalProdutos] = useState(0);
  const [totalCaixas, setTotalCaixas] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [initialSubtotalProdutos, setInitialSubtotalProdutos] = useState(null);
  const [initialTotalCaixas, setInitialTotalCaixas] = useState(null);
  const etiquetasRef = useRef();

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/produtos/`)
      .then((response) => {
        setProducts(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  // Atualiza o subtotal e o total de caixas
  useEffect(() => {
    const caixasAtuais = parseInt(quantidadeCaixas || 0);
    const quantidadePorCaixa = parseInt(quantidade || 0);

    // Atualiza o subtotal de produtos considerando apenas as caixas atuais
    const totalProdutosCaixas = caixasAtuais * quantidadePorCaixa;

    // Apenas atualiza o subtotal com as caixas atuais
    setSubtotalProdutos(totalProdutosCaixas);

    // Apenas atualiza o total de caixas com as caixas atuais
    setTotalCaixas(caixasAtuais);

    if (isPrinting) {
      setIsPrinting(false); // Reseta o estado de impressão após a atualização
    }
  }, [quantidade, quantidadeCaixas, isPrinting]);

  const handleProduto = (selectedOption) => {
    const productId = selectedOption ? selectedOption.value : "";
    const product = products.find((p) => p.id === parseInt(productId));
    setSelectedProduct(selectedOption);
    if (product) {
      setProductName(product.nome);
      setProductId(product.id);
      fetchLotes(product.id);
    } else {
      setProductName("");
      setLotes([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/Login"); // Redireciona para a página de login
  };

  const fetchLotes = (productId) => {
    axios
      .get(`${apiUrl}/produtos/Lotes?produto_id=${productId}`)
      .then((response) => {
        setLotes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching lotes:", error);
      });
  };

  const extractFabricacaoDate = (loteName) => {
    const dateStr = loteName.slice(-6);
    const date = parse(dateStr, "MMddyy", new Date());
    const adjustedDate = addHours(date, 12); // Adiciona 12 horas para ajustar o fuso horário
    return format(adjustedDate, "yyyy-MM-dd");
  };

  const handleLoteChange = (selectedOption) => {
    setSelectedLote(selectedOption);
    if (selectedOption) {
      const loteName = selectedOption.label;
      const fabricacaoDate = extractFabricacaoDate(loteName);
      setDataFabricacao(fabricacaoDate);
    } else {
      setDataFabricacao("");
    }
  };

  const toggleCreateLote = () => {
    setCreatingLote(!creatingLote);
    if (!creatingLote) {
      setSelectedLote(null);
    }
  };

  const handleCreateLote = () => {
    if (productId && dataFabricacao) {
      axios
        .get(`${apiUrl}/produtos/InfoProduto?id=${productId}`)
        .then((response) => {
          const { sigla, cod_aroma } = response.data;
          const date = parseISO(dataFabricacao);
          const adjustedDate = addHours(date, 12); // Ajusta o fuso horário
          const formattedDate = format(adjustedDate, "MMddyy");
          const nomeLote = `${sigla}${cod_aroma}${formattedDate}`;
          setNewLoteName(nomeLote);
          setCreatingLote(false);
          setDataFabricacao(format(adjustedDate, "yyyy-MM-dd"));
        })
        .catch((error) => {
          console.error("Error fetching product details:", error);
        });
    } else if (productId) {
      alert("Data de fabricação é obrigatória!");
    } else if (dataFabricacao) {
      alert("Escolha um produto para criar o lote!");
    } else {
      alert("Escolha o produto e uma data de fabricação para criar um lote!");
    }
  };

  const handleQuantidadeCaixas = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setQuantidadeCaixas(value);
    }
  };

  const handleQuantidade = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setQuantidade(value);
    }
  };

  const handleGenerateQRCode = () => {
    const formattedMesValidade = mesValidade.padStart(2, "0");

    if (
      selectedProduct &&
      quantidade &&
      (selectedLote || newLoteName) &&
      formattedMesValidade &&
      anoValidade &&
      quantidadeCaixas
    ) {
      setShowQRCode(true);
    } else {
      alert("Todos os campos são obrigatórios!");
    }
  };

  const imprimir = useReactToPrint({
    content: () => etiquetasRef.current,
    documentTitle: "Etiquetas",
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
    pageStyle: estiloEtiqueta,
  });

  const handlePrint = () => {
    if (!showQRCode) {
      alert("Gere o resumo antes de imprimir.");
      return;
    }

    setIsPrinting(true);
    let lastBoxNumber = parseInt(localStorage.getItem("lastBoxNumber") || "0");

    const caixasImpressas = parseInt(quantidadeCaixas);
    const quantidadePorCaixa = parseInt(quantidade);

    // Adiciona etiquetas para as caixas normais
    const newEtiquetas = [];
    for (let i = 0; i < caixasImpressas; i++) {
      const qrValueNormal = JSON.stringify({
        id: productId,
        quantidade: quantidadePorCaixa,
        lote: selectedLote ? selectedLote.label : newLoteName,
        validade: `${mesValidade.padStart(2, "0")}-${anoValidade}`,
        fabricacao: dataFabricacao,
      });

      newEtiquetas.push(
        <div className="etiqueta-impressa" key={i}>
          <div>
            <p>{productName}</p>
            <p>Lote: {selectedLote ? selectedLote.label : newLoteName}</p>
            {/* <p>Quantidade: {quantidadePorCaixa}</p>
            <p>Número da caixa: {lastBoxNumber + i + 1}</p> */}
            <p>Contagem: _____________________________ </p>
            <p>Conferência: _____________________________ </p>
            <p>Data: ______/______/________ </p>
          </div>
          <div className="qrCode-info">
            <QRCodeSVG value={qrValueNormal} className="qrCode" />
            <p>QTDE: {quantidadePorCaixa}</p>
            <p>Caixa Nº: {lastBoxNumber + i + 1}</p>
            <p>Validade: {`${mesValidade.padStart(2, "0")}/${anoValidade}`}</p>
          </div>
        </div>
      );
    }

    lastBoxNumber += caixasImpressas;
    localStorage.setItem("lastBoxNumber", lastBoxNumber.toString());

    setEtiquetas(newEtiquetas);

    setInitialSubtotalProdutos(
      (prevSubtotal) => prevSubtotal + caixasImpressas * quantidadePorCaixa
    );
    setInitialTotalCaixas((prevTotal) => prevTotal + caixasImpressas);

    // Após gerar as etiquetas, chamar a função de impressão
    setTimeout(() => {
      imprimir(); // Função de impressão utilizando react-to-print
    }, 0);
  };

  const handleClearInputs = () => {
    setSelectedProduct(null);
    setQuantidade("");
    setQuantidadeCaixas("");
    setProductName("");
    setMesValidade("");
    setAnoValidade("");
    setShowQRCode(false);
    setNewLoteName("");
    setSelectedLote(null);
    setDataFabricacao("");
    localStorage.removeItem("lastBoxNumber");
    setInitialSubtotalProdutos(null);
    setInitialTotalCaixas(null);
  };

  const handleClearLastBoxNumber = () => {
    setInitialSubtotalProdutos(null);
    setInitialTotalCaixas(null);
    localStorage.removeItem("lastBoxNumber");
    alert("Histórico de caixas foi limpo!");
  };

  const qrValue = JSON.stringify({
    id: productId,
    quantidade: quantidade,
    lote: selectedLote ? selectedLote.label : newLoteName,
    validade: `${mesValidade.padStart(2, "0")}-${anoValidade}`,
    fabricacao: dataFabricacao,
  });

  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.nome,
  }));

  const loteOptions = lotes.map((lote) => ({
    value: lote.id,
    label: `${lote.nome_lote}`,
  }));

  const displayedSubtotalProdutos =
    initialSubtotalProdutos !== null
      ? initialSubtotalProdutos
      : subtotalProdutos;
  const displayedTotalCaixas =
    initialTotalCaixas !== null ? initialTotalCaixas : totalCaixas;

  return (
    <div>
      <Navbar handleLogout={handleLogout} />
      <div className="App">
        <main>
          <form>
            <div class="row align-items-center">
              <div className="card card-modificado">
                <label htmlFor="product-select">Escolha o produto:</label>

                <div className="select-div">
                  <Select
                    className="select"
                    id="product-select"
                    value={selectedProduct}
                    onChange={handleProduto}
                    options={productOptions}
                    isClearable
                    placeholder="Selecione um produto"
                    required
                  />
                </div>

                {!creatingLote && (
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
                        options={loteOptions}
                        isClearable
                        placeholder="Selecione um lote"
                      />
                    </div>
                    <span className="spanLote">
                      Ou crie um novo lote no botão abaixo:
                    </span>
                  </>
                )}
                {creatingLote && (
                  <div>
                    <span>
                      Escolha um produto acima e uma data de fabricação abaixo
                      para criar um lote.
                    </span>

                    <label>Data de Fabricação:</label>

                    <input
                      type="date"
                      className="inputDate"
                      value={dataFabricacao}
                      onChange={(e) => setDataFabricacao(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={handleCreateLote}
                      class="btn btn-primary sizeButton"
                    >
                      Confirmar
                    </button>
                  </div>
                )}
                {newLoteName && (
                  <div>
                    <p>Novo Lote Criado: {newLoteName}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleCreateLote}
                  className="btn btn-primary"
                >
                  {creatingLote ? "Escolher Lote existente" : "Criar Lote"}
                </button>
              </div>
              <div className="card card-modificado">
                <label>Número de caixas completas:</label>

                <input
                  type="number"
                  min="1"
                  value={quantidadeCaixas}
                  onChange={handleQuantidadeCaixas}
                  required
                />

                <label>Unidade por caixa:</label>

                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={handleQuantidade}
                  required
                />
              </div>
            </div>
            <div class="row align-items-center">
              <div className="card card-modificado">
                <label>Digite o mês de validade:</label>

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={mesValidade}
                  onChange={(e) => setMesValidade(e.target.value)}
                  required
                />

                <label>Digite o ano de validade:</label>

                <input
                  type="number"
                  min={new Date().getFullYear()}
                  value={anoValidade}
                  onChange={(e) => setAnoValidade(e.target.value)}
                  required
                />
              </div>
              <div className="card card-modificado">
                <button
                  type="button"
                  class="btn btn-primary sizeButton"
                  onClick={handleGenerateQRCode}
                >
                  Gerar resumo
                </button>
                <button
                  type="button"
                  class="btn btn-primary sizeButton"
                  onClick={handlePrint}
                >
                  Imprimir etiquetas
                </button>
                <button
                  type="button"
                  class="btn btn-primary sizeButton"
                  onClick={handleClearInputs}
                >
                  Limpar dados
                </button>
                <button
                  type="button"
                  class="btn btn-primary sizeButton"
                  onClick={handleClearLastBoxNumber}
                >
                  Limpar Histórico de Caixas
                </button>
              </div>
            </div>
          </form>
        </main>
        {showQRCode && (
          <div className="card card-resumo">
            <div>
              <p>{productName}</p>
              <p>Número de caixas: {displayedTotalCaixas}</p>
              <p>Quantidade total: {displayedSubtotalProdutos}</p>
              <p>Lote: {selectedLote ? selectedLote.label : newLoteName}</p>
              <p>
                Mês de Fabricação: {format(new Date(dataFabricacao), "MM/yyyy")}
              </p>
              <p>
                Validade: {`${mesValidade.padStart(2, "0")}/${anoValidade}`}
              </p>
              <QRCodeSVG value={qrValue} className="qrCode" />
            </div>
          </div>
        )}
        {etiquetas.length > 0 && (
          <div
            ref={etiquetasRef}
            style={{ display: isPrinting ? "block" : "none" }}
            className="etiquetas-container"
          >
            {etiquetas}
          </div>
        )}
      </div>
    </div>
  );
}

export default EtiquetaProduto;
