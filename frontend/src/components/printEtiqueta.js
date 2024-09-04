export const estiloEtiqueta = `
@media print {
  body * {
    margin: 0;
    padding: 0;
    visibility: hidden;
    height: auto;
  }

  .etiquetas-container, .etiquetas-container * {
      padding: 0;
      margin: 0;    
      visibility: visible;
  }

  .etiqueta-impressa {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    page-break-inside: avoid;
    text-align: left;
    font-weight: bold;
    margin-left: 15px;
    display: flex;
    width: 9cm; /* Define a largura da etiqueta */
    height: 5cm; /* Define a altura da etiqueta */
    padding: 0;
  }

  .etiqueta-impressa p {
    font-size: 15px;
    margin: 0;
    line-height: 1.2;
  }

  .qrCode {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 3cm;
    height: 3cm;
    margin-left: auto;
    margin-right: 10px;
  }

  .qrCode-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .qrCode-info p {
    margin-top: 4px;
    text-align: center;
    align-items: center;
  }

  .row, etiqueta {
   display: none;
  }

form, .header, .select-div, .etiqueta, label, 
  .card,.spanLote, br, .inputDate, .fracionada-container, .select-div{
    display: none;
  }

  #nav {
  visibility: hidden;
  }
  
  .row align-items-center {
  visubility: hidden;
  }

  .imagem {
  width: 100%; /* Ajusta a imagem para ocupar 100% da largura disponível */
  max-width: 8cm; /* Limita o tamanho máximo da imagem para 8 cm */
  height: auto; /* Mantém a proporção original da imagem */
  margin: 0 auto; /* Centraliza a imagem horizontalmente */
  display: block;
}

  @page {
    size: 9cm 5cm; /* Define o tamanho da página para corresponder à etiqueta */
    margin: 0;
  }

} 
    `;
