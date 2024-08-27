import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { format, parse, parseISO, addHours } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./styles/EtiquetaProduto.css";
import { CgChevronLeft } from "react-icons/cg";
import { QRCodeSVG } from "qrcode.react";

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

  const generatedEtiquetas = [];
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate(); // Defina o hook useNavigate

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

  const handleBack = () => {
    navigate("/");
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
    for (let i = 0; i < caixasImpressas; i++) {
      const qrValueNormal = JSON.stringify({
        id: productId,
        quantidade: quantidadePorCaixa,
        lote: selectedLote ? selectedLote.label : newLoteName,
        validade: `${mesValidade.padStart(2, "0")}-${anoValidade}`,
        fabricacao: dataFabricacao,
      });
  
      generatedEtiquetas.push(
        <div className="etiqueta-impressa" key={i}>
          <div>
            <p>{productName}</p>
            <p>Lote: {selectedLote ? selectedLote.label : newLoteName}</p>
            <p>Quantidade: {quantidadePorCaixa}</p>
            <p>Número da caixa: {lastBoxNumber + i + 1}</p>
            <p>Validade: {`${mesValidade.padStart(2, "0")}/${anoValidade}`}</p>
            <p>Contagem: _______________________ </p>
            <p>Conferência: ______________________ </p>
            <p>Data: ___/___/_____ </p>
          </div>
          <QRCodeSVG value={qrValueNormal} className="qrCode" />
        </div>
      );
    }
  
    lastBoxNumber += caixasImpressas;
    localStorage.setItem("lastBoxNumber", lastBoxNumber.toString());
  
    setEtiquetas(generatedEtiquetas);
  
    const etiquetasContainer = document.querySelector(".etiquetas-container");
    if (etiquetasContainer) {
      etiquetasContainer.classList.add("imprimir");
    }
  
    // Atualiza o subtotal e o total de caixas da impressão atual
    setInitialSubtotalProdutos((prevSubtotal) => prevSubtotal + caixasImpressas * quantidadePorCaixa);
    setInitialTotalCaixas((prevTotal) => prevTotal + caixasImpressas);
  
    setTimeout(() => {
      window.print();
      if (etiquetasContainer) {
        etiquetasContainer.classList.remove("imprimir");
      }
      setEtiquetas([]);
  
      setShowQRCode(true); // Mostra novamente o resumo atualizado
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

  const displayedSubtotalProdutos = initialSubtotalProdutos !== null ? initialSubtotalProdutos : subtotalProdutos;
  const displayedTotalCaixas = initialTotalCaixas !== null ? initialTotalCaixas : totalCaixas;

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
          <span className="headerSpan">Etiqueta de Produto</span>
        </div>
      </header>
      <main>
        <form>
          <div className="card">
            <label htmlFor="product-select">Escolha o produto:</label>
            <br />
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
            <br />
            {!creatingLote && (
              <>
                <label htmlFor="lote-select">
                  Escolha o lote (Apenas se já existir no estoque):
                </label>
                <br />
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
                  <br />
                </div>
                <span className="spanLote">
                  Ou crie um novo lote no botão abaixo:
                </span>
                <br />
              </>
            )}
            {creatingLote && (
              <div>
                <br />
                <span>
                  Escolha um produto acima e uma data de fabricação abaixo para
                  criar um lote.
                </span>
                <br />
                <br />
                <label>Data de Fabricação:</label>
                <br />
                <input
                  type="date"
                  className="inputDate"
                  value={dataFabricacao}
                  onChange={(e) => setDataFabricacao(e.target.value)}
                  required
                />
                <br />
                <button type="button" onClick={handleCreateLote}>
                  Confirmar
                </button>
              </div>
            )}
            {newLoteName && (
              <div>
                <p>Novo Lote Criado: {newLoteName}</p>
              </div>
            )}

            <button type="button" onClick={toggleCreateLote}>
              {creatingLote ? "Escolher Lote existente" : "Criar Lote"}
            </button>
          </div>
          <br />
          <div className="card">
            <label>Número de caixas completas:</label>
            <br />
            <input
              type="number"
              min="1"
              value={quantidadeCaixas}
              onChange={handleQuantidadeCaixas}
              required
            />
            <br />
            <label>Unidade por caixa:</label>
            <br />
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={handleQuantidade}
              required
            />
            <br />
            </div>
          <br />
          <div className="card">
            <label>Digite o mês de validade:</label>
            <br />
            <input
              type="number"
              min="1"
              max="12"
              value={mesValidade}
              onChange={(e) => setMesValidade(e.target.value)}
              required
            />
            <br />
            <label>Digite o ano de validade:</label>
            <br />
            <input
              type="number"
              min={new Date().getFullYear()}
              value={anoValidade}
              onChange={(e) => setAnoValidade(e.target.value)}
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
            <button type="button" onClick={handleClearLastBoxNumber}>
              Limpar Histórico de Caixas
            </button>
          </div>
          <br />
        </form>
        {showQRCode && (
          <div className="card">
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
          <div className="etiquetas-container">{etiquetas}</div>
        )}
      </main>
    </div>
  );
}

export default EtiquetaProduto;
