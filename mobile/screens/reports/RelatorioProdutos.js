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
      estoque: parseFloat(produto.estoque_total) || 0,
      unidade: produto.unidade,
      valor_unitario: parseFloat(produto.preco) || 0,
      valor_total: (parseFloat(produto.preco) || 0) * (parseFloat(produto.estoque_total) || 0),
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
      totalEstoque += item.estoque;
      valorTotalEstoque += item.valor_total;
    });

    totalEstoque = isNaN(totalEstoque) ? 0 : totalEstoque;
    valorTotalEstoque = isNaN(valorTotalEstoque) ? 0 : valorTotalEstoque;

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
          <h2>Total de Produtos: ${totalEstoque.toLocaleString('pt-br')}</h2>
          <h2>Valor total no estoque: R$${valorTotalEstoque.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
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
              <td>${item.estoque.toLocaleString('pt-br')}</td>
              <td>${item.descricao || "Não Possui"}</td>
              <td>${item.unidade}</td>
              <td>R$${item.valor_unitario.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>R$${item.valor_total.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>`;
    });
    htmlContent += `
          </table>
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
