import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { format, parse } from 'date-fns';
import './styles/App.css';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [products, setProducts] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [mesValidade, setMesValidade] = useState('');
  const [anoValidade, setAnoValidade] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [creatingLote, setCreatingLote] = useState(false);
  const [dataFabricacao, setDataFabricacao] = useState('');
  const [newLoteName, setNewLoteName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/produtos/')
      .then(response => {
        setProducts(response.data);
        console.log(response.data)
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  const handleProduto = (selectedOption) => {
    const productId = selectedOption ? selectedOption.value : '';
    const product = products.find(p => p.id === parseInt(productId));
    setSelectedProduct(selectedOption);
    if (product) {
      setProductName(product.nome);
      setProductId(product.id);
      fetchLotes(product.id);
    } else {
      setProductName('');
      setLotes([]);
    }
  };

  const fetchLotes = (productId) => {
    axios.get(`http://localhost:3000/produtos/Lotes?produto_id=${productId}`)
      .then(response => {
        setLotes(response.data);
      })
      .catch(error => {
        console.error('Error fetching lotes:', error);
      });
  };

  const handleQuantidade = (event) => {
    const value = event.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setQuantidade(value);
    }
  };

  const handleMesValidade = (event) => {
    const value = event.target.value;
    if (value === '' || (value >= 1 && value <= 12 && /^[0-9]+$/.test(value))) {
      setMesValidade(value.padStart(2, '0'));
    }
  };

  const handleAnoValidade = (event) => {
    const value = event.target.value;
    const currentYear = new Date().getFullYear();
    if (value === '' || (value >= currentYear && value.length <= 4 && /^[0-9]+$/.test(value))) {
      setAnoValidade(value);
    }
  };

  const handleGenerateQRCode = () => {
    if (selectedProduct && quantidade && (selectedLote || newLoteName) && mesValidade && anoValidade) {
      setShowQRCode(true);
    } else {
      alert('Todos os campos são obrigatórios!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearInputs = () => {
    setSelectedProduct(null);
    setQuantidade('');
    setProductName('');
    setMesValidade('');
    setAnoValidade('');
    setShowQRCode(false);
    setNewLoteName('');
    setSelectedLote(null);
    setDataFabricacao('');
  };

  const handleCreateLote = () => {
    if (productId && dataFabricacao) {
      axios.get(`http://localhost:3000/produtos/InfoProduto?id=${productId}`)
        .then(response => {
          const { sigla, cod_aroma } = response.data;
          const date = new Date(dataFabricacao);
          const formattedDate = format(date, 'MMddyy');
          const nomeLote = `${sigla}${cod_aroma}${formattedDate}`;
          setNewLoteName(nomeLote);
          setCreatingLote(false);
          setDataFabricacao(format(date, 'dd-MM-yyyy')); // Formata a data de fabricação
        })
        .catch(error => {
          console.error('Error fetching product details:', error);
        });
    } else {
      alert('Data de fabricação é obrigatória!');
    }
  };

  const toggleCreateLote = () => {
    setCreatingLote(!creatingLote);
    if (!creatingLote) {
      setSelectedLote(null);
    }
  };

  const extractFabricacaoDate = (loteName) => {
    const dateStr = loteName.slice(-6);
    const date = parse(dateStr, 'MMddyy', new Date());
    return format(date, 'yyyy-MM-dd');
  };

  const handleLoteChange = (selectedOption) => {
    setSelectedLote(selectedOption);
    if (selectedOption) {
      const loteName = selectedOption.label;
      const fabricacaoDate = extractFabricacaoDate(loteName);
      setDataFabricacao(fabricacaoDate);
    } else {
      setDataFabricacao('');
    }
  };

  const qrValue = JSON.stringify({
    id: productId,
    quantidade: quantidade,
    lote: selectedLote ? selectedLote.label : newLoteName,
    validade: `${mesValidade}-${anoValidade}`,
    fabricacao: dataFabricacao
  });

  const productOptions = products.map(product => ({
    value: product.id,
    label: product.nome
  }));

  const loteOptions = lotes.map(lote => ({
    value: lote.id,
    label: `${lote.nome_lote}`
  }));

  const preventNonNumericInput = (event) => {
    if (!/^[0-9]$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p className="Titulo">
          Criar etiquetas
        </p>
      </header>
      <main>
        <form>
          <label htmlFor="product-select">
            Escolha o produto:
          </label>
          <br />
          <div className='select-div'>
            <Select
              className='select'
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
                Escolha o lote:
              </label>
              <br />
              <div className='select-div'>
                <Select
                  className='select'
                  id="lote-select"
                  value={selectedLote}
                  onChange={handleLoteChange}
                  options={loteOptions}
                  isClearable
                  placeholder="Selecione um lote"
                />
              </div>
            </>
          )}
          <button type="button" onClick={toggleCreateLote}>
            {creatingLote ? 'Escolher Lote' : 'Criar Lote'}
          </button>
          {creatingLote && (
            <div>
              <label>
                Data de Fabricação:
              </label>
              <br />
              <input
                type="date"
                value={dataFabricacao}
                onChange={(e) => setDataFabricacao(e.target.value)}
                required
              />
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
          <br />
          <label>
            Digite a quantidade na caixa:
          </label>
          <br />
          <input 
            type="number" 
            min='1' 
            value={quantidade} 
            onChange={handleQuantidade} 
            onKeyDown={preventNonNumericInput}
            required 
          />
          <br />
          <label>
            Digite o mês de validade:
          </label>
          <br />
          <input 
            type="number" 
            min='1' 
            max='12' 
            value={mesValidade} 
            onChange={handleMesValidade} 
            onKeyDown={preventNonNumericInput}
            required 
          />
          <br />
          <label>
            Digite o ano de validade:
          </label>
          <br />
          <input 
            type="number" 
            min={new Date().getFullYear()} 
            value={anoValidade} 
            onChange={handleAnoValidade} 
            onKeyDown={preventNonNumericInput}
            required 
          />
          <br />
          <button type="button" onClick={handleGenerateQRCode}>
            Gerar QR Code
          </button>
          <button type="button" onClick={handlePrint}>
            Imprimir
          </button>
          <button type="button" onClick={handleClearInputs}>
            Limpar
          </button>
        </form>
        {showQRCode && (
          <div className="etiqueta">
            <div>
              <p>Produto: {productName}</p>
              <p>Quantidade: {quantidade}</p>
              <p>Lote: {selectedLote ? selectedLote.label : newLoteName}</p>
              <p>Data de Fabricação: {dataFabricacao}</p>
              <p>Validade: {`${mesValidade}-${anoValidade}`}</p>
            </div>
            <QRCodeSVG value={qrValue} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
