import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './styles/EtiquetaInsumo.css';
import { QRCodeSVG } from 'qrcode.react';

function EtiquetaInsumo() {
  const [insumos, setInsumos] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeCaixas, setQuantidadeCaixas] = useState('');
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [insumoName, setInsumoName] = useState('');
  const [insumoId, setInsumoId] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [etiquetas, setEtiquetas] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/insumos/`)
      .then(response => {
        setInsumos(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching insumos:', error);
      });
  }, []);

  const handleProduto = (selectedOption) => {
    const insumoId = selectedOption ? selectedOption.value : '';
    const insumo = insumos.find(p => p.id === parseInt(insumoId));
    setSelectedInsumo(selectedOption);
    if (insumo) {
      setInsumoName(insumo.nome);
      setInsumoId(insumo.id);
    } else {
      setInsumoName('');
    }
  };

  const handleQuantidade = (event) => {
    const value = event.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setQuantidade(value);
    }
  };
  
  const handleQuantidadeCaixas = (event) => {
    const value = event.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setQuantidadeCaixas(value);
    }
  };

  const handleGenerateQRCode = () => {
    if (selectedInsumo && quantidade && quantidadeCaixas) {
      setShowQRCode(true);
    } else {
      alert('Todos os campos são obrigatórios!');
    }
  };

 const handlePrint = () => {
  if (!showQRCode) {
    alert('Gere o QR Code antes de imprimir.');
    return;
  }

  const generatedEtiquetas = [];
  for (let i = 0; i < parseInt(quantidadeCaixas); i++) {
    generatedEtiquetas.push(
      <div className="etiqueta-impressa" key={i}>
        <div>
          <p>{insumoName}</p>
          <p>Quantidade: {quantidade}</p>
          <p>Número da caixa: {i + 1}/{quantidadeCaixas}</p>
        </div>
          <QRCodeSVG value={qrValue} className='qrCode'/>
      </div>
    );
  }
  setEtiquetas(generatedEtiquetas);

  const etiquetasContainer = document.querySelector('.etiquetas-container');
  if (etiquetasContainer) {
    etiquetasContainer.classList.add('imprimir');  // Aplica a classe .imprimir
  }

  setTimeout(() => {
    window.print();
    if (etiquetasContainer) {
      etiquetasContainer.classList.remove('imprimir');  // Remove a classe após a impressão
    }
    setEtiquetas([]); // Limpa as etiquetas depois de imprimir
  }, 0);
};


  const handleClearInputs = () => {
    setSelectedInsumo(null);
    setQuantidade('');
    setQuantidadeCaixas('');
    setInsumoName('');
    setShowQRCode(false);
    setEtiquetas([]);
  };

  const qrValue = JSON.stringify({
    id: insumoId,
    quantidade: quantidade,
    quantidadeCaixas: quantidadeCaixas
  });

  const insumoOptions = insumos.map(insumo => ({
    value: insumo.id,
    label: insumo.nome
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
          Gerar Etiqueta de Insumos
        </p>
      </header>
      <main>
        <form>
          <label htmlFor="product-select">
            Escolha o insumo:
          </label>
          <br />
          <div className='select-div'>
            <Select
              className='select'
              id="insumo-select"
              value={selectedInsumo}
              onChange={handleProduto}
              options={insumoOptions}
              isClearable
              placeholder="Selecione um produto"
              required
            />
          </div>
          <br/>
          <label>
            Digite a quantidade de unidades por caixa:
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
          <br/>
          <label>
            Digite a quantidade de caixas:
          </label>
          <br />
          <input 
            type="number" 
            min='1' 
            value={quantidadeCaixas} 
            onChange={handleQuantidadeCaixas} 
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
              <p>Produto: {insumoName}</p>
              <p>Quantidade: {quantidade}</p>
              <p>Quantidade de caixas: {quantidadeCaixas}</p>
            </div>
              <QRCodeSVG value={qrValue} className='qrCode'/>
          </div>
        )}
        {etiquetas.length > 0 && (
          <div className="etiquetas-container">
            {etiquetas}
          </div>
        )}
        </main>
    </div>
  );
}

export default EtiquetaInsumo;
