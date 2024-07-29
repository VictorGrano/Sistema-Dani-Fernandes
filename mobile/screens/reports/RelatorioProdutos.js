// generatePDF.js
import axios from "axios";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Alert } from "react-native";

const fetchProdutos = async () => {
  try {
    const response = await axios.get("http://192.168.1.177:3000/produtos/");
    const produtosData = response.data.map((produto) => ({
      nome: produto.nome,
      descricao: produto.descricao,
      estoque: produto.estoque_total,
      unidade: produto.unidade,
      valor_unitario: produto.preco,
      valor_total: produto.estoque * produto.preco
    }));
    return produtosData;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const RelatorioGeral = async () => {
  try {
    const produtos = await fetchProdutos();

    let totalEstoque = 0;
    let valorTotalEstoque = 0;

    produtos.forEach((item) => {
      totalEstoque += parseInt(item.estoque);
      valorTotalEstoque += parseFloat(item.valor_unitario) * parseInt(item.estoque);
    });

    let htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Relatório de Estoque</h1>
          <table>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Descrição</th>
              <th>Unidade</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
            </tr>`;

    produtos.forEach((item) => {
      htmlContent += `
            <tr>
              <td>${item.nome}</td>
              <td>${item.estoque}</td>
              <td>${item.descricao || 'Não Possui'}</td>
              <td>${item.unidade}</td>
              <td>R$${parseFloat(item.valor_unitario || 0)}</td>
              <td>R$${parseFloat(item.valor_total || 0)}</td>
            </tr>`;
    });

    htmlContent += `
          </table>
          <h1>Total de Produtos: ${totalEstoque}</h1>
          <h1>Valor total no estoque: R$${valorTotalEstoque || 0}</h1>
        </body>
      </html>`;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      fileName: `Relatorio_Estoque_${
        new Date().toISOString().split("T")[0]
      }.pdf`,
    });
    console.log("File has been saved to:", uri);

    Alert.alert(
      "PDF Gerado",
      "O relatório de estoque foi gerado com sucesso!",
      [{ text: "OK" }]
    );

    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    Alert.alert("Erro", "Ocorreu um erro ao gerar o PDF.");
  }
};

export default RelatorioGeral;
