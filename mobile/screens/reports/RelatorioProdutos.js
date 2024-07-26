import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

const RelatorioProdutosScreen = () => {
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://192.168.1.102:3000/produtos/");
        const produtosData = response.data.map((produto) => ({
          nome: produto.nome,
          descricao: produto.descricao,
          estoque: produto.estoque_total,
          unidade: produto.unidade,
          valor_unitario: produto.preco,
        }));
        setProdutos(produtosData);

        let totalEstoque = 0;
        let valorTotalEstoque = 0;

        produtosData.forEach((item) => {
          totalEstoque += parseInt(item.estoque);
          valorTotalEstoque +=
            parseFloat(item.valor_unitario) * parseInt(item.estoque);
        });

        setTotal(totalEstoque);
        setValorTotal(valorTotalEstoque);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  const generatePDF = async () => {

    try {
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
                <th>Preço Unitário</th>
              </tr>`;

      produtos.forEach((item) => {
        htmlContent += `
              <tr>
                <td>${item.nome}</td>
                <td>${item.estoque}</td>
                <td>${item.descricao || 'Não Possui'}</td>
                <td>${item.unidade}</td>
                <td>R$${parseFloat(item.valor_unitario || 0)}</td>
              </tr>`;
      });

      htmlContent += `
            </table>
            <h1>Total de Produtos: ${total}</h1>
            <h1>Valor total no estoque: R$${valorTotal || 0}</h1>
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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText} >Gerar PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    alignItems: 'center',
    padding: 8,
  },
  spacer: {
    height: 8,
  },
  printer: {
    textAlign: "center",
  },
  button: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RelatorioProdutosScreen;
